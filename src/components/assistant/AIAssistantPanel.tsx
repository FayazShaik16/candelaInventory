'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  PanelRightClose, 
  Maximize2,
  Minimize2,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  X,
  MessageSquare
} from 'lucide-react';
import { AIAssistantMessage, LANforgeItem } from '@/types/inventory';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useAuth } from '@/context/AuthContext';
import { useInventory } from '@/context/InventoryContext';
import { INITIAL_AI_MESSAGES } from '@/data/inventorySeed';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  lanforges?: LANforgeItem[];
  onApplyInventoryAction?: (unitAssetTag: string, updates: any) => void;
  onViewUnit?: (assetTag: string) => void;
  initialMessages?: AIAssistantMessage[];
}

export function AIAssistantPanel({
  isOpen,
  onToggle,
  lanforges: propLanforges,
  onApplyInventoryAction,
  onViewUnit,
  initialMessages = INITIAL_AI_MESSAGES,
}: AIAssistantPanelProps) {
  const { lanforges: ctxLanforges, metrics, assignEquipment, refreshInventory } = useInventory();
  const lanforges = propLanforges || ctxLanforges;
  const { role: currentUserRole, user } = useAuth();
  const isAdmin = currentUserRole === 'admin';

  const [messages, setMessages] = useState<AIAssistantMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [engineStatus, setEngineStatus] = useState<'connected' | 'local'>('local');
  const [activeTokenMap, setActiveTokenMap] = useState<Record<string, string>>({});
  const [conversationId, setConversationId] = useState<string>(() => `conv-${Date.now().toString(36)}`);
  const [sessionContext, setSessionContext] = useState<Record<string, any>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check AI Assistant Engine Health
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/assistant/health');
        if (res.ok) {
          const data = await res.json();
          if (data.connected) {
            setEngineStatus('connected');
          } else {
            setEngineStatus('local');
          }
        }
      } catch {
        setEngineStatus('local');
      }
    }
    checkHealth();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    const userMsgId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: AIAssistantMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp,
      text,
    };

    const nextHistory = [...messages, userMsg].slice(-12).map((m) => ({
      sender: m.sender,
      text: m.text,
      resultTags: (m.queryResults || []).map((r) => r.tag),
    }));

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUserRole || 'admin',
          'x-user-name': user?.full_name || 'Admin Supervisor',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          history: nextHistory,
          session_context: sessionContext,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data && data.session_context) {
        setSessionContext(data.session_context);
      }

      if (data && data.text) {
        let actionPreview = undefined;

        if (data.action_preview) {
          const ap = data.action_preview;
          const token = ap.confirmation_token;
          const previewId = ap.id || `act-${Date.now()}`;

          if (token) {
            setActiveTokenMap((prev) => ({ ...prev, [previewId]: token }));
          }

          actionPreview = {
            id: previewId,
            type: ap.intent || 'assignment',
            title: ap.title,
            unitAssetTag: ap.record_identifier,
            model: ap.unit_model || (ap.category ? ap.category.toUpperCase() : 'HARDWARE'),
            changes: (ap.changes || []).map((ch: any) => ({
              field: ch.field,
              from: ch.from_value ?? ch.from,
              to: String(ch.to_value ?? ch.to),
            })),
            status: 'pending' as const,
            confirmationToken: token,
            requiresConfirmation: ap.requires_confirmation,
            rawAction: ap,
          };
        }

        const assistantMsg: AIAssistantMessage = {
          id: data.message_id || `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp: data.timestamp || timestamp,
          text: data.text,
          queryResults: data.query_results,
          actionPreview,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          text: `⚠️ Network error communicating with assistant: ${err.message || 'Please check your connection.'}`,
        },
      ]);
    }
  };

  const handleConfirmAction = async (messageId: string) => {
    if (!isAdmin) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '⚠️ Permission Denied: Only administrators have clearance to commit hardware mutations or reconfigurations.',
        },
      ]);
      return;
    }

    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg || !targetMsg.actionPreview) return;

    const preview = targetMsg.actionPreview;
    const token = preview.confirmationToken || activeTokenMap[preview.id || ''] || `candela-token-${Date.now()}`;

    try {
      const res = await fetch('/api/assistant/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUserRole || 'admin',
          'x-user-name': user?.full_name || 'Admin Supervisor',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          confirmation_token: token,
          action_id: preview.id,
          action: preview.rawAction || preview,
        }),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        // Mark as applied
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === messageId && m.actionPreview) {
              return {
                ...m,
                actionPreview: {
                  ...m.actionPreview,
                  status: 'applied' as const,
                },
              };
            }
            return m;
          })
        );

        // Append confirmation receipt
        const confirmReceipt: AIAssistantMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `✅ ${resData.message || 'Operation executed successfully.'}${resData.audit_log_id ? ` (Audit Ref: ${resData.audit_log_id})` : ''}`,
        };
        setMessages((prev) => [...prev, confirmReceipt]);

        // Trigger live refresh so inventory table and metrics update immediately
        try {
          await refreshInventory();
        } catch (e) {
          console.warn('refreshInventory after confirm failed:', e);
        }

        // Trigger callback if provided
        if (onApplyInventoryAction) {
          const newStatus = (preview.rawAction?.target_status) || (preview.type?.includes('return') ? 'Available' : 'In-Use');
          onApplyInventoryAction(preview.unitAssetTag, { status: newStatus });
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `⚠️ Execution failed: ${resData.error || 'The confirmation token has expired or is invalid.'}`,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ Confirmation error: ${err.message}`,
        },
      ]);
    }
  };

  const handleCancelAction = async (messageId: string) => {
    const targetMsg = messages.find((m) => m.id === messageId);
    const token = targetMsg?.actionPreview?.confirmationToken;

    if (token) {
      fetch('/api/assistant/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation_token: token }),
      }).catch(() => {});
    }

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId && m.actionPreview) {
          return {
            ...m,
            actionPreview: {
              ...m.actionPreview,
              status: 'cancelled' as const,
            },
          };
        }
        return m;
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Operation cancelled. No database changes were applied.`,
      },
    ]);
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
    setSessionContext({});
    setConversationId(`conv-${Date.now().toString(36)}`);
  };

  return (
    <>
      {/* Floating Launcher Icon in Bottom Right - Compact Circular Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-[#173D30] hover:bg-[#1E4637] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20 group cursor-pointer"
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-300 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#173D30]" />
          </div>
        </button>
      )}

      {/* Floating Support Chatbot Window in Bottom Right */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 ${isExpanded ? 'w-[520px]' : 'w-[380px]'} max-w-[calc(100vw-32px)] h-[540px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200`}
        >
          {/* Support Chatbot Header */}
          <div className="h-14 px-4 bg-[#173D30] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-[#247A51] flex items-center justify-center text-white border border-white/20 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#173D30] absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>Candela Assistant</span>
                </div>
                <div className="text-[10px] text-emerald-200/80 leading-tight">
                  {engineStatus === 'connected' ? 'Online • Lab Copilot' : 'Local • Lab Copilot'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title={isExpanded ? 'Compact view' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F8FAFC]"
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onConfirmAction={handleConfirmAction}
                onCancelAction={handleCancelAction}
                onViewUnit={onViewUnit}
              />
            ))}

            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#247A51] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="p-2.5 px-3 rounded-2xl rounded-tl-none bg-white border border-[#E2E8F0] text-xs text-[#64748B] flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#247A51] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#247A51] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#247A51] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Processing instruction...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      )}
    </>
  );
}
