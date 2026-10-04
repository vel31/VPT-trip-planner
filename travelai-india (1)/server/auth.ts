import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db/database';
import { DbUser } from './db/types';

const JWT_SECRET = process.env.JWT_SECRET || 'travelai_india_production_secret_key_2026_jwt_token';

export interface AuthRequest extends Request {
  user?: DbUser;
}

export function generateToken(user: DbUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = db.findUserById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Invalid or expired token
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required. Please log in to continue.',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Administrative privileges are required to view this section.',
      code: 'FORBIDDEN'
    });
  }
  next();
}

// Route handlers for authentication
export async function handleRegister(req: Request, res: Response) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const newUser = db.createUser({ name, email, password, phone });
    const token = generateToken(newUser);

    const { passwordHash, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Account created successfully.',
      user: safeUser,
      token
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed.' });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { passwordHash, ...safeUser } = user;

    return res.json({
      message: 'Login successful.',
      user: safeUser,
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal login error.' });
  }
}

export async function handleGetMe(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const { passwordHash, ...safeUser } = req.user;
  return res.json({ user: safeUser });
}

export async function handleUpdateProfile(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    const { name, phone, avatarUrl } = req.body;
    const updated = db.updateUserProfile(req.user.id, { name, phone, avatarUrl });
    const { passwordHash, ...safeUser } = updated;
    return res.json({ message: 'Profile updated successfully.', user: safeUser });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Profile update failed.' });
  }
}

export async function handleChangePassword(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    db.changeUserPassword(req.user.id, currentPassword, newPassword);
    return res.json({ message: 'Password changed successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to change password.' });
  }
}
