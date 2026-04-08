"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message { role: "user" | "assistant"; content: string }
interface Child { id: string; name: string; avatar: string; ageGroup: string; level: number }

export default function ChatPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => { if (!r.ok) { router.push("/parent"); return null; } return r.json(); })
      .then((data) => {
        if (!data) return;
        setChild(data);
        setMessages([{
          role: "assistant",
          content: `Salut ${data.name} ! Je suis Elevo, ton assistant IA. Je suis là pour t'aider à apprendre, répondre à tes questions et t'encourager. Sur quoi tu veux qu'on travaille aujourd'hui ?`,
        }]);
      });
  }, [id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || !child) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMsg],
        childProfile: { name: child.name, age: 10, ageGroup: child.ageGroup, level: child.level },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    }
    setLoading(false);
  }

  const suggestedQuestions = [
    "Comment faire une division ?",
    "C'est quoi la dyslexie ?",
    "J'ai peur des examens...",
    "Comment mieux me concentrer ?",
    "Qu'est-ce que je devrais faire plus tard ?",
  ];

  const accentGradient =
    child?.ageGroup === "maternelle" ? "from-amber-500 to-orange-500" :
    child?.ageGroup === "primaire" ? "from-emerald-500 to-teal-600" :
    "from-violet-600 to-purple-700";

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FEFCF9" }}>
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${accentGradient} flex flex-col`} style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3">
        <Link
          href={`/child/${id}`}
          className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-lg">
          {child.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white text-sm">Elevo IA</h1>
          <p className="text-white/60 text-[11px]">Assistant de {child.name}</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 bg-stone-50 rounded-t-[1.5rem] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-stone-400 mb-2.5 uppercase tracking-wider">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-[13px] bg-white border border-stone-200 text-stone-600 font-medium px-3.5 py-2 rounded-full hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2.5`}>
              {msg.role === "assistant" && (
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${accentGradient} flex items-center justify-center text-[11px] text-white font-bold shrink-0 mt-1`}>
                  E
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? `bg-gradient-to-br ${accentGradient} text-white rounded-br-sm shadow-sm`
                    : "bg-white text-stone-700 border border-stone-200/80 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-sm shrink-0 mt-1">
                  {child.avatar}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${accentGradient} flex items-center justify-center text-[11px] text-white font-bold`}>
                E
              </div>
              <div className="bg-white border border-stone-200/80 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-stone-200/60 bg-white px-4 py-3">
          <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message...`}
              className="flex-1 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 text-stone-800 text-sm bg-stone-50/50 transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`bg-gradient-to-br ${accentGradient} text-white w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40 shrink-0 hover:shadow-lg transition-all`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
