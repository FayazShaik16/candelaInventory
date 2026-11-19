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
  AlertTriangle
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
  const { lanforges: ctxLanforges, metrics, assignEquipment } = useInventory();
  const lanforges = propLanforges || ctxLanforges;
  const { role: currentUserRole, user } = useAuth();
  const isAdmin = currentUserRole === 'admin';

  const [messages, setMessages] = useState<AIAssistantMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [engineStatus, setEngineStatus] = useState<'connected' | 'local'>('local');
  const [activeTokenMap, setActiveTokenMap] = useState<Record<string, string>>({});
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

  const suggestedPrompts = [
    {
      label: 'Assign LF-01 to Sirisha',
      query: 'Assign LF-OPEL-523C-01 to Sirisha for Netgear project.',
    },
    {
      label: 'Check Available Units',
      query: 'Show me all available hardware units ready for assignment.',
    },
    {
      label: 'Show LANforges in OPEL',
      query: 'Show all LANforge testbeds located in OPEL.',
    },
    {
      label: 'Set DT-01 Under Maintenance',
      query: 'Set DT-01 to Under Maintenance for diagnostic run.',
    },
    {
      label: 'Sirisha Equipment',
      query: 'What equipment is currently assigned to Sirisha?',
    },
  ];

  const handleSendMessage = async (text: string) => {
    const userMsgId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: AIAssistantMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp,
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUserRole || 'admin',
          'x-user-name': user?.full_name || 'Admin Supervisor',
          'x-user-id': user?.id || 'usr-admin-01',
        },
        body: JSON.stringify({
          message: text,
          conversation_id: 'conv-active',
        }),
      });

      const data = await response.json();
      setIsTyping(false);

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
            model: ap.category ? ap.category.toUpperCase() : 'HARDWARE',
            changes: (ap.changes || []).map((ch: any) => ({
              field: ch.field,
              from: ch.from_value ?? ch.from,
              to: String(ch.to_value ?? ch.to),
            })),
            status: 'pending' as const,
            confirmationToken: token,
            requiresConfirmation: ap.requires_confirmation,
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
          'x-user-id': user?.id || 'usr-admin-01',
        },
        body: JSON.stringify({
          confirmation_token: token,
          action_id: preview.id,
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

        // Trigger callback if provided
        if (onApplyInventoryAction) {
          onApplyInventoryAction(preview.unitAssetTag, { status: 'In-Use' });
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
  };

  const panelWidth = isExpanded ? 'w-[620px] min-w-[620px]' : 'w-[360px] min-w-[360px]';

  return (
    <aside
      className={`relative flex flex-col bg-[#FFFFFF] border-l border-[#E5EBE6] transition-all duration-200 z-10 ${
        isOpen ? panelWidth : 'w-0 min-w-0 border-l-0 overflow-hidden'
      }`}
      aria-label="Candela AI Inventory Assistant"
    >
      {isOpen && (
        <div className={`flex flex-col h-full ${isExpanded ? 'w-[620px]' : 'w-[360px]'}`}>
          {/* Header */}
          <div className="h-14 px-4 border-b border-[#E5EBE6] flex items-center justify-between bg-[#FFFFFF] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#247A51] text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#F5F7F5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#172A21] tracking-tight">
                    Inventory Assistant
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                      engineStatus === 'connected'
                        ? 'bg-[#EBF4EF] text-[#247A51] border-[#D5E9DE]'
                        : 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        engineStatus === 'connected' ? 'bg-[#247A51]' : 'bg-[#64748B]'
                      }`}
                    />
                    {engineStatus === 'connected' ? 'AI Engine Connected' : 'Local Engine'}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Natural language operations across 4 categories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] rounded transition-colors"
                title={isExpanded ? 'Collapse to standard view' : 'Expand workspace'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] rounded transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 text-[#64748B] hover:text-[#172A21] hover:bg-[#F5F7F5] rounded transition-colors"
                title="Collapse Assistant"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFFFF]"
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
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-[#247A51] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-lg bg-[#F5F7F5] border border-[#E5EBE6] text-xs text-[#64748B] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#247A51] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#247A51] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#247A51] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Processing instruction & verifying constraints...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-[#F9FAF9] border-t border-[#E5EBE6] flex-shrink-0">
            <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#247A51]" />
              <span>Verified Prompt Templates</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p.query)}
                  className="text-[11px] text-[#172A21] bg-[#FFFFFF] hover:bg-[#EBF4EF] hover:text-[#247A51] px-2 py-1 rounded border border-[#E5EBE6] transition-colors truncate max-w-full text-left"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      )}
    </aside>
  );
}
