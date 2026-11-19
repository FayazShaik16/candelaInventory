'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Sparkles, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading || disabled) return;

    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-[#FFFFFF] border-t border-[#E5EBE6] flex-shrink-0"
    >
      <div className="relative flex flex-col bg-[#F9FAF9] border border-[#E5EBE6] focus-within:border-[#247A51] rounded-lg p-2 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder="Ask assistant or type commands (e.g., 'Assign LF-OPEL-523C-03 to Aarif')..."
          className="w-full bg-transparent resize-none text-xs text-[#172A21] placeholder:text-[#94A3B8] focus:outline-none min-h-[32px] max-h-[120px] py-1"
        />

        <div className="flex items-center justify-between pt-1 text-[10px] text-[#94A3B8]">
          <span className="hidden sm:inline">
            <span className="font-semibold text-[#64748B]">Enter</span> to send • <span className="font-semibold text-[#64748B]">Shift + Enter</span> for line break
          </span>

          <button
            type="submit"
            disabled={!text.trim() || isLoading || disabled}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#247A51] hover:bg-[#1D6342] disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
