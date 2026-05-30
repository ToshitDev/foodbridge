"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, doc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser, Message } from "@/lib/types";
import { X, Send } from "lucide-react";

interface Props {
  donationId: string;
  donationTitle: string;
  restaurantName: string;
  currentUser: AppUser;
  onClose: () => void;
}

export default function ChatPanel({
  donationId, donationTitle, restaurantName, currentUser, onClose,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Real-time message listener — single orderBy, no composite index needed
  useEffect(() => {
    const q = query(
      collection(db, "donations", donationId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
    });
    return unsub;
  }, [donationId]);

  // Clear unread flag when restaurant opens the panel
  useEffect(() => {
    if (currentUser.role === "restaurant") {
      updateDoc(doc(db, "donations", donationId), {
        hasUnreadForRestaurant: false,
      }).catch(() => {});
    }
  }, [donationId, currentUser.role]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await addDoc(collection(db, "donations", donationId, "messages"), {
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: trimmed,
        createdAt: Date.now(),
      });
      // When shelter sends, flag as unread for the restaurant
      if (currentUser.role === "shelter") {
        await updateDoc(doc(db, "donations", donationId), {
          hasUnreadForRestaurant: true,
        });
      }
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
        style={{ animation: "slideInRight 0.25s ease forwards" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-gray-100">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{donationTitle}</p>
            <p className="text-xs text-gray-400 truncate">{restaurantName}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400 text-center">
                No messages yet.<br />Start the conversation.
              </p>
            </div>
          )}

          {messages.map((m) => {
            const mine = m.senderId === currentUser.id;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <p className="text-xs text-gray-400 mb-1">{mine ? "You" : m.senderName}</p>
                <div className={`px-3.5 py-2 rounded-2xl text-sm max-w-[80%] leading-relaxed ${
                  mine
                    ? "bg-green-600 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={send}
          className="flex items-center gap-2 px-3 py-3 border-t border-gray-100"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="w-9 h-9 shrink-0 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
