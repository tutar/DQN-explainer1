import React, { useState, useRef, useEffect } from 'react';
import { sendMessageStreamToGemini, resetChat } from '../services/geminiService';
import { Message } from '../types';
import { marked } from 'marked';
import katex from 'katex';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '你好！我是你的 DQN 学习助手。关于 Deep Q-Network，你有什么想了解的吗？\n\n你可以问我：\n- **什么是 Experience Replay？**\n- **DQN 和 Q-Learning 有什么区别？**\n- **给我展示一段 PyTorch 代码示例**',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stopGenerationRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    stopGenerationRef.current = false;

    try {
        const stream = sendMessageStreamToGemini(userMsg.text);
        let botMsgId: string | null = null;

        for await (const chunk of stream) {
            // Check if user pressed stop
            if (stopGenerationRef.current) {
                break;
            }

            if (!botMsgId) {
                botMsgId = (Date.now() + 1).toString();
                const initialBotMsg: Message = {
                    id: botMsgId,
                    role: 'model',
                    text: chunk,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, initialBotMsg]);
            } else {
                setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId 
                    ? { ...msg, text: msg.text + chunk }
                    : msg
                ));
            }
        }
    } catch (e) {
        console.error("Chat error:", e);
    } finally {
        setIsLoading(false);
        stopGenerationRef.current = false;
    }
  };

  const handleStop = () => {
    stopGenerationRef.current = true;
  };

  const handleNewChat = () => {
    // Reset Gemini Service History
    resetChat();
    // Reset UI State
    setMessages([
      {
        id: Date.now().toString(),
        role: 'model',
        text: '已开启新对话。有什么我可以帮你的吗？',
        timestamp: Date.now()
      }
    ]);
    setInput('');
    setIsLoading(false);
    stopGenerationRef.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to render markdown content safely with KaTeX support
  const renderContent = (text: string) => {
    try {
      // 1. Extract and protect math segments
      // This prevents marked from parsing underscores in LaTeX as italics
      const mathSegments: { type: 'display' | 'inline', content: string }[] = [];
      
      // Regex for Display Math $$...$$
      let protectedText = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, content) => {
        mathSegments.push({ type: 'display', content });
        return `___MATH_BLOCK_${mathSegments.length - 1}___`;
      });

      // Regex for Inline Math $...$ 
      // We use a slightly stricter regex to avoid matching random $ signs (though simpler is often fine for AI output)
      protectedText = protectedText.replace(/\$([^$\n]+?)\$/g, (_, content) => {
        mathSegments.push({ type: 'inline', content });
        return `___MATH_INLINE_${mathSegments.length - 1}___`;
      });

      // 2. Parse Markdown
      let html = marked.parse(protectedText) as string;

      // 3. Restore and render Math
      html = html.replace(/___MATH_(BLOCK|INLINE)_(\d+)___/g, (match, type, indexStr) => {
        const index = parseInt(indexStr);
        const segment = mathSegments[index];
        
        if (!segment) return match;

        try {
          return katex.renderToString(segment.content, {
            displayMode: segment.type === 'display',
            throwOnError: false,
            output: 'html'
          });
        } catch (e) {
          console.error("KaTeX error:", e);
          return segment.content; // Fallback to raw text
        }
      });

      return { __html: html };
    } catch (e) {
      console.error("Render error:", e);
      return { __html: text };
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-white font-semibold">Gemini AI Tutor (DQN Expert)</span>
        </div>
        <button 
          onClick={handleNewChat}
          className="text-xs text-slate-400 hover:text-white hover:bg-slate-700 px-3 py-1.5 rounded transition-colors flex items-center"
          title="清除历史并开始新对话"
        >
          <span className="mr-1">↻</span> 开启新对话
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-700 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.role === 'user' ? (
                 <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                 <div 
                    className="markdown-content"
                    dangerouslySetInnerHTML={renderContent(msg.text)} 
                 />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-none flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入问题，例如：为什么需要 Target Network?"
            className="flex-1 bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 disabled:opacity-50"
            disabled={isLoading}
          />
          
          {isLoading ? (
            <button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center min-w-[80px] justify-center"
            >
              <span className="mr-1">■</span> 停止
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
            >
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;