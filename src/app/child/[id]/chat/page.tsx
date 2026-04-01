"use client";
import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message { role: "user" | "assistant"; content: string }
interface Child { id: string; name: string; avatar: string; ageGroup: string; level: number }

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
          content: `Salut ${data.name} ! 👋 Je suis Elevo, ton assistant IA. Je suis là pour t'aider à apprendre, répondre à tes questions et t'encourager ! Sur quoi tu veux qu'on travaille aujourd'hui ? 🌟`,
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
    "C&apos;est quoi la dyslexie ?",
    "J&apos;ai peur des examens...",
    "Comment mieux me concentrer ?",
    "Qu&apos;est-ce que je devrais faire plus tard ?",
  ];

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="text-4xl animate-bounce">🤖</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 to-purple-700 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3">
        <Link href={`/child/${id}`} className="text-white/80 hover:text-white p-2">←</Link>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🤖</div>
        <div>
          <h1 className="font-black text-white">Elevo IA</h1>
          <p className="text-white/70 text-xs">Toujours là pour toi ✨</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 bg-slate-50 rounded-t-[2rem] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 mb-2">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-xs bg-violet-100 text-violet-700 font-medium px-3 py-1.5 rounded-full hover:bg-violet-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm shrink-0 mt-1">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-sm"
                    : "bg-white text-slate-700 shadow-sm rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-sm shrink-0 mt-1">
                  {child.avatar}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm">
                🤖
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
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
        <div className="border-t border-slate-100 bg-white px-4 py-4">
          <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Écris ta question, ${child.name}…`}
              className="flex-1 border-2 border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-400 text-slate-800 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-fun bg-gradient-to-r from-violet-500 to-purple-600 text-white w-12 h-12 flex items-center justify-center disabled:opacity-70 shrink-0"
            >
              →
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
