"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Footer } from "@/components/footer";

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialReceiverId = searchParams.get("receiverId");
  const initialPropertyId = searchParams.get("propertyId");

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputContent, setInputContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data?.conversations) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !activeConv) {
          selectConversation(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/messages/${convId}`);
      const data = await res.json();
      if (data?.conversation) {
        setActiveConv(data.conversation);
        setMessages(data.conversation.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    setSending(true);
    const content = inputContent.trim();
    setInputContent("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv?.id,
          receiverId: initialReceiverId || activeConv?.participant2Id,
          propertyId: initialPropertyId || activeConv?.propertyId,
          content,
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        loadConversations();
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInputContent(text);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 amoled:bg-black transition-colors">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 amoled:bg-black border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            In-App Messaging
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-heading">
            Direct Host & Tenant Chat
          </h1>
        </div>
      </div>

      {/* Chat Window */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          
          {/* Left Column: Conversations List */}
          <div className="md:col-span-4 border-r border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 p-4 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              Recent Conversations
            </h2>

            {loading ? (
              <div className="p-4 text-xs text-slate-400 dark:text-slate-500">Loading chat threads...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p>No active conversations.</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Open any room listing and click "Chat with Owner" to start a conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((c) => {
                  const isActive = activeConv?.id === c.id;
                  const otherPerson = c.participant2 || c.participant1;

                  return (
                    <button
                      key={c.id}
                      onClick={() => selectConversation(c.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 border ${
                        isActive
                          ? "bg-brand-50/70 dark:bg-brand-950/40 amoled:bg-brand-950/40 border-brand-500/50 shadow-soft"
                          : "bg-white dark:bg-slate-900 amoled:bg-zinc-950 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-950 shrink-0">
                        <img
                          src={otherPerson?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-navy-900 dark:text-white truncate">
                            {otherPerson?.name || "Host"}
                          </span>
                        </div>
                        {c.property && (
                          <span className="text-[10px] text-brand-700 dark:text-brand-400 font-semibold truncate block">
                            📍 {c.property.title}
                          </span>
                        )}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {c.messages?.[0]?.content || "Start conversation..."}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Active Conversation */}
          <div className="md:col-span-8 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 amoled:bg-black/50">
            {activeConv ? (
              <>
                {/* Pinned Property Context Card */}
                {activeConv.property && (
                  <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-3.5 border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img
                          src={
                            activeConv.property.images?.[0]?.url ||
                            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=200"
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Inquiry regarding
                        </span>
                        <Link
                          href={`/property/${activeConv.property.id}`}
                          className="text-xs font-bold text-navy-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block line-clamp-1"
                        >
                          {activeConv.property.title}
                        </Link>
                      </div>
                    </div>

                    <Link
                      href={`/property/${activeConv.property.id}`}
                      className="px-3 py-1.5 rounded-xl bg-navy-900 dark:bg-brand-600 amoled:bg-brand-600 text-white text-[11px] font-bold hover:bg-brand-600 dark:hover:bg-brand-700 transition-colors"
                    >
                      View Listing
                    </Link>
                  </div>
                )}

                {/* Messages Feed */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500">
                      Send a message to introduce yourself and ask about availability or house rules.
                    </div>
                  ) : (
                    messages.map((m, idx) => {
                      const isMe = m.senderId !== activeConv.participant2Id;
                      return (
                        <div
                          key={m.id || idx}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-soft ${
                              isMe
                                ? "bg-navy-900 dark:bg-brand-600 amoled:bg-zinc-800 text-white rounded-br-none"
                                : "bg-white dark:bg-slate-850 amoled:bg-zinc-900 text-navy-900 dark:text-white border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 rounded-bl-none"
                            }`}
                          >
                            <p>{m.content}</p>
                            <span
                              className={`text-[9px] block mt-1 ${
                                isMe ? "text-slate-300 dark:text-slate-300 text-right" : "text-slate-400 dark:text-slate-500 text-left"
                              }`}
                            >
                              {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Questions suggestion pills */}
                <div className="px-6 py-2 bg-white/80 dark:bg-slate-900/80 amoled:bg-zinc-950/80 border-t border-slate-200/60 dark:border-slate-800 amoled:border-zinc-850 flex items-center gap-2 overflow-x-auto text-[11px]">
                  <span className="text-slate-400 font-semibold shrink-0">Quick reply:</span>
                  {[
                    "Is this room available from next Monday?",
                    "Can I schedule a visit tomorrow at 5 PM?",
                    "Are electricity and water included in rent?",
                  ].map((quick, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickReply(quick)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0 transition-colors"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                {/* Message Input Box */}
                <div className="p-4 bg-white dark:bg-slate-900 amoled:bg-zinc-950 border-t border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder="Type a message to the owner..."
                      className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 bg-slate-50 dark:bg-slate-800 amoled:bg-zinc-900 focus:bg-white dark:focus:bg-slate-900 amoled:focus:bg-black text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <button
                      type="submit"
                      disabled={sending || !inputContent.trim()}
                      className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-soft flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="m-auto text-center p-8 text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-bold text-navy-900 dark:text-white">Select a conversation</p>
                <p>Choose an inquiry thread from the left to start chatting.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
