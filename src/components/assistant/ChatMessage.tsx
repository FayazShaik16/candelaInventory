'use client';

import React from 'react';
import { AIAssistantMessage } from '@/types/inventory';
import { ActionPreviewCard } from './ActionPreviewCard';
import { Sparkles, User, Server, Laptop, Smartphone, Box, ShieldCheck, MapPin } from 'lucide-react';

interface ChatMessageProps {
  message: AIAssistantMessage;
  onConfirmAction?: (messageId: string) => void;
  onCancelAction?: (messageId: string) => void;
  onViewUnit?: (assetTag: string) => void;
}

export function ChatMessage({
  message,
  onConfirmAction,
  onCancelAction,
  onViewUnit,
}: ChatMessageProps) {
  const isUser = message.sender === 'user';

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'desktop': return <Laptop className="w-3 h-3 text-[#247A51]" />;
      case 'mobile': return <Smartphone className="w-3 h-3 text-[#247A51]" />;
      case 'chamber': return <Box className="w-3 h-3 text-[#247A51]" />;
      default: return <Server className="w-3 h-3 text-[#247A51]" />;
    }
  };

  const renderInline = (line: string): React.ReactNode[] => {
    const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return tokens.map((tok, i) => {
      if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
        return <strong key={i} className="font-semibold text-inherit">{tok.slice(2, -2)}</strong>;
      }
      if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2) {
        return (
          <code key={i} className="px-1 py-0.5 rounded bg-black/5 font-mono text-[11px]">
            {tok.slice(1, -1)}
          </code>
        );
      }
      if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2) {
        return <em key={i} className="italic">{tok.slice(1, -1)}</em>;
      }
      return <React.Fragment key={i}>{tok.replace(/\*\*/g, '')}</React.Fragment>;
    });
  };

  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }
          if (/^#{1,3}\s+/.test(trimmed)) {
            return (
              <div key={idx} className="font-semibold text-[#172A21] pt-0.5">
                {renderInline(trimmed.replace(/^#{1,3}\s+/, ''))}
              </div>
            );
          }
          if (/^[•\-*]\s+/.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#247A51] flex-shrink-0" />
                <span>{renderInline(trimmed.replace(/^[•\-*]\s+/, ''))}</span>
              </div>
            );
          }
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="font-semibold text-[#247A51] min-w-[14px]">{numMatch[1]}.</span>
                <span>{renderInline(numMatch[2])}</span>
              </div>
            );
          }
          return <p key={idx}>{renderInline(line)}</p>;
        })}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
            Available
          </span>
        );
      case 'Under Maintenance':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
            Maintenance
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#EFF6FF] text-[#0284C7] border border-[#DBEAFE]">
            In-Use
          </span>
        );
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3`}>
      <div className="flex items-center gap-1.5 mb-1 px-1">
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
            isUser
              ? 'bg-[#E5EBE6] text-[#172A21]'
              : 'bg-[#247A51] text-white'
          }`}
        >
          {isUser ? <User className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
        </div>
        <span className="text-[10px] font-medium text-[#64748B]">
          {isUser ? 'You' : 'Candela Assistant'}
        </span>
        <span className="text-[10px] text-[#94A3B8]">
          {message.timestamp}
        </span>
      </div>

      <div
        className={`max-w-[95%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed border ${
          isUser
            ? 'bg-[#173D30] text-[#FFFFFF] border-[#1E4637] rounded-tr-none'
            : 'bg-[#FFFFFF] text-[#172A21] border-[#E5EBE6] rounded-tl-none shadow-none'
        }`}
      >
        {renderFormattedText(message.text)}

        {/* Query Results List */}
        {message.queryResults && message.queryResults.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            {message.queryResults.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded border border-[#E5EBE6] bg-[#F9FAF9] hover:bg-[#F0FDF4] transition-colors flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded bg-white border border-[#E5EBE6] flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onViewUnit?.(item.tag)}
                      className="font-mono font-bold text-[#172A21] hover:text-[#247A51] hover:underline text-[11px] block text-left truncate"
                    >
                      {item.tag}
                    </button>
                    <span className="text-[10px] text-[#64748B] truncate block">
                      {item.model}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {getStatusBadge(item.status)}
                  {item.custodian && (
                    <span className="text-[9px] text-[#64748B] flex items-center gap-0.5">
                      <User className="w-2.5 h-2.5 text-[#94A3B8]" />
                      {item.custodian}
                    </span>
                  )}
                  {item.location && !item.custodian && (
                    <span className="text-[9px] text-[#64748B] flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#94A3B8]" />
                      {item.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Preview Card */}
        {message.actionPreview && (
          <ActionPreviewCard
            action={message.actionPreview}
            onConfirm={() => onConfirmAction?.(message.id)}
            onCancel={() => onCancelAction?.(message.id)}
            onViewUnit={onViewUnit}
          />
        )}
      </div>
    </div>
  );
}
