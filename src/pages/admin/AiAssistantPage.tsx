import React, { useState } from 'react';
import { api } from '../../services/api';
import { Sparkles, Send, Bot, User, Stethoscope, AlertCircle, FileText, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  insights?: any;
}

export const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your MediCare AI Clinical & Operational Assistant. You can ask me questions about clinical symptom analysis, hospital resource allocation, financial revenue trends, or medical literature.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.getAIAnalyticsInsights(userMsg.text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.executiveSummary || 'Here are the insights generated based on current hospital database records.',
        insights: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Error processing AI query: ${err.message || 'Service temporarily unavailable'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Analyze current hospital revenue and department workload',
    'Which medicines are running low in stock and need reordering?',
    'Provide clinical guidance for managing acute pediatric asthma',
    'Summarize patient consultation metrics for this month',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MediCare AI Assistant</h1>
            <p className="text-xs text-indigo-200 mt-0.5">Gemini 2.5 AI clinical intelligence, real-time database queries & decision support</p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">Suggested:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInput(prompt)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-semibold shrink-0 shadow-2xs transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  msg.sender === 'user' ? 'bg-blue-600' : 'bg-indigo-600'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center justify-between gap-4">
                  <span>{msg.sender === 'user' ? 'You' : 'MediCare Gemini AI'}</span>
                  <span className={`text-[10px] ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.insights && (
                  <div className="mt-3 p-3 rounded-xl bg-white border border-indigo-200/80 text-slate-800 space-y-2">
                    <p className="font-bold text-indigo-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Structured Key Findings
                    </p>
                    {msg.insights.keyTakeaways && (
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                        {msg.insights.keyTakeaways.map((takeaway: string, idx: number) => (
                          <li key={idx}>{takeaway}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 animate-pulse">
                Analyzing clinical database and synthesizing response...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything about hospital metrics, patient care, or pharmacy..."
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Send Query
          </button>
        </form>
      </div>
    </div>
  );
};
