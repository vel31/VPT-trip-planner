import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Bot, 
  User, 
  RotateCcw,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { Destination } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AIAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
}

export const AIAdvisorDrawer: React.FC<AIAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  destinations
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Namaste! 🙏 I am your **Verified India Travel Advisor**. \n\nEvery recommendation I provide is strictly grounded in official records from the Archaeological Survey of India, Ministry of Tourism, Indian Railways, and verified culinary history.\n\nHow can I help you plan your journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const quickQuestions = [
    "What are the best hours to visit Amber Fort in Jaipur to skip queues?",
    "Recommend a verified luxury palace stay overlooking Lake Pichola in Udaipur",
    "Where can I find authentic vegetarian Laal Maas or Dal Baati Churma?",
    "How does the Vande Bharat Express connect Delhi and Agra for the Taj Mahal?"
  ];

  const handleSendMessage = async (customQuery?: string) => {
    const textToSend = customQuery || inputText;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          destinationId: selectedDestinationId || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get advisor response');
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here is verified advice based on our Indian travel registry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Apologies, I encountered a temporary connection issue. Please verify your query or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        sender: 'assistant',
        text: `Conversation refreshed! How can I assist with your Indian travel plans?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#161616] text-[#F0F0F0] h-full shadow-2xl flex flex-col border-l border-[#2A2A2A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F27D26] flex items-center justify-center text-black font-bold shadow-md shadow-[#F27D26]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display text-lg font-bold text-[#F0F0F0]">
                  AI Travel Advisor
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-[#8E9299]">
                Grounded in Archaeological Survey & Ministry Records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg text-[#8E9299] hover:text-white hover:bg-[#252525] transition-colors"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#8E9299] hover:text-white hover:bg-[#252525] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Focus Destination Filter */}
        <div className="bg-[#121212] px-4 py-2 border-b border-[#2A2A2A] flex items-center justify-between text-xs">
          <span className="text-[#8E9299] font-medium">Focus Region:</span>
          <select
            value={selectedDestinationId}
            onChange={(e) => setSelectedDestinationId(e.target.value)}
            className="bg-[#1A1A1A] border border-[#333] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#F0F0F0] focus:outline-none"
          >
            <option value="">🗺️ All Destinations</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                📍 {d.name}, {d.state}
              </option>
            ))}
          </select>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAI
                      ? 'bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40'
                      : 'bg-[#2A2A2A] text-white border border-[#3A3A3A]'
                  }`}
                >
                  {isAI ? <Sparkles className="w-4 h-4 text-[#F27D26]" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`space-y-1 max-w-[85%] ${isAI ? 'text-left' : 'text-right'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isAI
                        ? 'bg-[#1A1A1A] text-[#F0F0F0] border border-[#2A2A2A] rounded-tl-sm'
                        : 'bg-[#F27D26] text-black font-semibold rounded-tr-sm shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-[#8E9299] px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-[#F27D26]/20 flex items-center justify-center shrink-0 border border-[#F27D26]/40">
                <Sparkles className="w-4 h-4 text-[#F27D26] animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#8E9299] flex items-center gap-2">
                <div className="w-3 h-3 bg-[#F27D26] rounded-full animate-ping" />
                <span>Consulting verified travel database...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {messages.length <= 2 && (
          <div className="p-3 bg-[#121212] border-t border-[#2A2A2A] space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#8E9299] tracking-wider block px-1">
              Suggested Questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-left text-[11px] bg-[#1A1A1A] hover:bg-[#252525] text-[#F0F0F0] p-2 rounded-xl border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors w-full cursor-pointer"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Bar */}
        <div className="p-4 bg-[#1A1A1A] border-t border-[#2A2A2A]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about monuments, hotels, local cuisine..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#121212] border border-[#333] rounded-xl text-xs sm:text-sm text-[#F0F0F0] placeholder:text-[#666] focus:outline-none focus:border-[#F27D26]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 rounded-xl bg-[#F27D26] hover:bg-[#e06c18] disabled:opacity-50 text-black font-bold transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
