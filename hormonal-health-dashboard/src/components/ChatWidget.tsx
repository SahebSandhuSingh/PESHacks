import { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi Pragya. I am your Digital Twin. What would you like to know about your hormonal health today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Analyzing your recent sensor data and cycle history... I recommend reducing stress through 10 minutes of meditation today to improve your Sleep Stability.' 
      }]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-300",
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:scale-110",
          isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"
        )}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div 
        className={clsx(
          "fixed bottom-8 right-8 z-50 w-96 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[32px] overflow-hidden shadow-2xl shadow-purple-500/20 transition-all duration-500 flex flex-col",
          isOpen ? "opacity-100 translate-y-0 h-[500px]" : "opacity-0 translate-y-12 h-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="animate-pulse" />
            <span className="font-bold tracking-tight">Ask Your Digital Twin</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto p-5 pb-2 space-y-4 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={clsx("max-w-[85%] rounded-2xl p-4 text-sm font-medium leading-relaxed", 
              msg.role === 'assistant' 
                ? "bg-purple-50 text-purple-900 border border-purple-100 self-start rounded-tl-sm"
                : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white self-end rounded-tr-sm shadow-md"
            )}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/50 border-t border-purple-100 shrink-0">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about stress, habits, or cycle..."
              className="w-full bg-white border border-gray-200 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 shadow-sm"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
