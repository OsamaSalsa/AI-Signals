import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
    history: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    onSendMessage: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, isLoading, error, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border space-y-4">
            <h3 className="font-bold text-lg text-text-main dark:text-dark-text-main flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a2 2 0 01-2 2h-2v-2h2a2 2 0 012-2z" />
                </svg>
                Ask the AI Analyst
            </h3>

            <div className="bg-background dark:bg-dark-background p-2 rounded-lg border border-border dark:border-dark-border h-64 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                         {msg.role === 'model' && (
                             <div className="w-8 h-8 rounded-full bg-card dark:bg-dark-card flex items-center justify-center flex-shrink-0 border border-border dark:border-dark-border">
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5L13.84 8.16L19.5 10L13.84 11.84L12 17.5L10.16 11.84L4.5 10L10.16 8.16L12 2.5Z" fill="#3B82F6"/><path d="M20.5 15.5L19.66 17.66L17.5 18.5L19.66 19.34L20.5 21.5L21.34 19.34L23.5 18.5L21.34 17.66L20.5 15.5Z" fill="#3B82F6"/></svg>
                             </div>
                         )}
                        <div className={`p-3 rounded-lg max-w-sm ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-card dark:bg-dark-card flex items-center justify-center flex-shrink-0 border border-border dark:border-dark-border">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5L13.84 8.16L19.5 10L13.84 11.84L12 17.5L10.16 11.84L4.5 10L10.16 8.16L12 2.5Z" fill="#3B82F6"/><path d="M20.5 15.5L19.66 17.66L17.5 18.5L19.66 19.34L20.5 21.5L21.34 19.34L23.5 18.5L21.34 17.66L20.5 15.5Z" fill="#3B82F6"/></svg>
                        </div>
                        <div className="p-3 rounded-lg bg-card dark:bg-dark-card text-text-muted dark:text-dark-text-muted">
                             <div className="flex items-center space-x-1">
                                <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

            {error && (
                <div role="alert" className="text-danger text-sm text-center">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    disabled={isLoading}
                    className="flex-grow bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg p-3 text-text-main dark:text-dark-text-main focus:ring-2 focus:ring-accent disabled:opacity-50"
                    aria-label="Your message"
                />
                <button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-accent text-white font-semibold rounded-lg px-4 py-2 flex items-center justify-center disabled:bg-opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;