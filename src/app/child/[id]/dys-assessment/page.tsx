"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ReadingSpeedTest from "@/components/dys-tests/ReadingSpeedTest";
import PhonemeTest from "@/components/dys-tests/PhonemeTest";
import SubitizationTest from "@/components/dys-tests/SubitizationTest";
import DictationTest from "@/components/dys-tests/DictationTest";
import LumoCompanion from "@/components/LumoCompanion";

type TestId = "intro" | "reading" | "phoneme" | "subitization" | "dictation" | "result";

interface Results {
  reading?: { mclm: number; percentile: "low" | "normal" | "high"; duration: number; errors: number; wordCount: number };
  phoneme?: { correct: number; total: number; accuracy: number; avgRT: number; difficulties: string[] };
  subitization?: { correct: number; total: number; accuracy: number; avgRT: number; maxSubitized: number };
  dictation?: { totalWords: number; orthographicCorrect: number; phoneticCorrect: number; avgTimePerWord: number; regularErrors: number; irregularErrors: number };
}

interface Child {
  id: string;
  name: string;
  ageGroup: string;
}

const TESTS: { id: TestId; label: string; icon: string; desc: string }[] = [
  { id: "reading", label: "Vitesse de lecture", icon: "📖", desc: "Lis un texte à voix haute" },
  { id: "phoneme", label: "Discrimination des sons", icon: "🎧", desc: "Écoute et compare des mots" },
  { id: "subitization", label: "Perception des quantités", icon: "🎯", desc: "Compte rapidement des points" },
  { id: "dictation", label: "Dictée", icon: "✍️", desc: "Écris des mots dictés" },
];

export default function DysAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const [child, setChild] = useState<Child | null>(null);
  const [currentTest, setCurrentTest] = useState<TestId>("intro");
  const [results, setResults] = useState<Results>({});

  useEffect(() => {
    fetch(`/api/children/${childId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setChild(data); })
      .catch(() => router.push("/parent"));
  }, [childId, router]);

  const handleTestComplete = (testId: Exclude<TestId, "intro" | "result">, result: unknown) => {
    const newResults = { ...results, [testId]: result };
    setResults(newResults);
    const currentIdx = TESTS.findIndex((t) => t.id === testId);
    if (currentIdx < TESTS.length - 1) {
      setCurrentTest(TESTS[currentIdx + 1].id);
    } else {
      // Save to backend
      saveResults(newResults);
      setCurrentTest("result");
    }
  };

  const saveResults = async (finalResults: Results) => {
    try {
      await fetch("/api/dys-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, results: finalResults }),
      });
    } catch (e) {
      console.error("Failed to save dys results", e);
    }
  };

  if (!child) {
    return <div className="min-h-screen flex items-center justify-center"><LumoCompanion mood="happy" size="lg" /></div>;
  }

  // INTRO
  if (currentTest === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
        <div className="max-w-md mx-auto pt-6">
          <div className="text-center text-white mb-6">
            <div className="text-6xl mb-2">🔍</div>
            <h1 className="text-2xl font-black">Bilan d&apos;apprentissage</h1>
            <p className="text-sm text-white/80 mt-1">Découvre tes super-pouvoirs d&apos;apprenant</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xl">
            <p className="text-sm text-slate-600 mb-4">
              Ce bilan comporte <span className="font-black">4 tests rapides</span> qui vont aider Lumo à mieux te connaître.
            </p>
            <div className="space-y-2 mb-5">
              {TESTS.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black">
                    {i + 1}
                  </div>
                  <span className="text-2xl">{t.icon}</span>
                  <div className="flex-1">
                    <p className="font-black text-slate-700 text-sm">{t.label}</p>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-800">
                💡 Il n&apos;y a pas de bonnes ou mauvaises réponses. Fais comme tu peux ! Le bilan dure environ 10 minutes.
              </p>
            </div>
            <button
              onClick={() => setCurrentTest("reading")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg shadow-lg active:scale-95 transition-transform"
            >
              Commencer 🚀
            </button>
            <button
              onClick={() => router.push(`/child/${childId}`)}
              className="w-full mt-2 py-2 text-sm text-slate-500 font-bold"
            >
              ← Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RESULT
  if (currentTest === "result") {
    const dysRisk = analyzeDysRisk(results);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
        <div className="max-w-md mx-auto pt-6">
          <div className="text-center text-white mb-6">
            <div className="text-6xl mb-2">🎉</div>
            <h1 className="text-2xl font-black">Bilan terminé !</h1>
            <p className="text-sm text-white/80">Merci {child.name.split(" ")[0]} !</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xl space-y-4">
            <div className="text-center pb-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Profil global</p>
              <p className={`text-xl font-black mt-1 ${
                dysRisk.level === "low" ? "text-green-600" :
                dysRisk.level === "medium" ? "text-amber-600" : "text-red-600"
              }`}>
                {dysRisk.level === "low" ? "Profil sans alerte" :
                 dysRisk.level === "medium" ? "À surveiller" : "Consulter un professionnel"}
              </p>
            </div>

            {/* Reading speed */}
            {results.reading && (
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📖</span>
                  <span className="font-black text-sky-700 text-sm">Lecture</span>
                </div>
                <p className="text-2xl font-black text-slate-800">{results.reading.mclm} <span className="text-xs text-slate-500 font-normal">mots/min</span></p>
                <p className="text-xs text-slate-500">{results.reading.errors} erreur(s) · {Math.round(results.reading.duration)}s</p>
              </div>
            )}

            {/* Phoneme */}
            {results.phoneme && (
              <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🎧</span>
                  <span className="font-black text-violet-700 text-sm">Sons</span>
                </div>
                <p className="text-2xl font-black text-slate-800">{results.phoneme.accuracy}%</p>
                <p className="text-xs text-slate-500">{results.phoneme.correct}/{results.phoneme.total} corrects · {Math.round(results.phoneme.avgRT / 1000 * 10) / 10}s moy.</p>
                {results.phoneme.difficulties.length > 0 && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ Sons : {results.phoneme.difficulties.join(", ")}</p>
                )}
              </div>
            )}

            {/* Subitization */}
            {results.subitization && (
              <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🎯</span>
                  <span className="font-black text-cyan-700 text-sm">Nombres</span>
                </div>
                <p className="text-2xl font-black text-slate-800">{results.subitization.accuracy}%</p>
                <p className="text-xs text-slate-500">Perçoit instantanément jusqu&apos;à {results.subitization.maxSubitized}</p>
              </div>
            )}

            {/* Dictation */}
            {results.dictation && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">✍️</span>
                  <span className="font-black text-purple-700 text-sm">Dictée</span>
                </div>
                <p className="text-2xl font-black text-slate-800">{results.dictation.orthographicCorrect}/{results.dictation.totalWords}</p>
                <p className="text-xs text-slate-500">Réguliers : {results.dictation.totalWords - results.dictation.regularErrors - results.dictation.irregularErrors + results.dictation.regularErrors} OK</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] text-slate-500 leading-relaxed">
                <span className="font-black">⚠️ Important :</span> Ce bilan est un outil d&apos;alerte, pas un diagnostic médical. Si des difficultés sont détectées, consulte un orthophoniste ou un neuropsychologue pour un bilan complet.
              </p>
            </div>

            <button
              onClick={() => router.push(`/child/${childId}`)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg shadow-lg"
            >
              Retour à la maison 🏠
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TEST PAGES
  const TestComponent = () => {
    switch (currentTest) {
      case "reading":
        return <ReadingSpeedTest ageGroup={child.ageGroup} onComplete={(r) => handleTestComplete("reading", r)} />;
      case "phoneme":
        return <PhonemeTest ageGroup={child.ageGroup} onComplete={(r) => handleTestComplete("phoneme", r)} />;
      case "subitization":
        return <SubitizationTest ageGroup={child.ageGroup} onComplete={(r) => handleTestComplete("subitization", r)} />;
      case "dictation":
        return <DictationTest ageGroup={child.ageGroup} onComplete={(r) => handleTestComplete("dictation", r)} />;
      default:
        return null;
    }
  };

  const currentIdx = TESTS.findIndex((t) => t.id === currentTest);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => router.push(`/child/${childId}`)} className="text-white/80 text-sm font-bold">← Quitter</button>
            <p className="text-white font-black text-sm">Test {currentIdx + 1}/{TESTS.length}</p>
          </div>
          <div className="flex gap-1">
            {TESTS.map((t, i) => (
              <div key={t.id} className={`flex-1 h-1.5 rounded-full ${i <= currentIdx ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Test */}
      <main className="p-4 max-w-md mx-auto">
        <TestComponent />
      </main>
    </div>
  );
}

// Analyze dys risk level from all test results
function analyzeDysRisk(results: Results): { level: "low" | "medium" | "high"; flags: string[] } {
  const flags: string[] = [];

  if (results.reading?.percentile === "low") flags.push("Vitesse de lecture");
  if (results.phoneme && results.phoneme.accuracy < 70) flags.push("Discrimination phonémique");
  if (results.subitization && results.subitization.accuracy < 60) flags.push("Perception du nombre");
  if (results.dictation) {
    const errorRate = ((results.dictation.totalWords - results.dictation.orthographicCorrect) / results.dictation.totalWords) * 100;
    if (errorRate > 60) flags.push("Orthographe");
  }

  let level: "low" | "medium" | "high" = "low";
  if (flags.length >= 3) level = "high";
  else if (flags.length >= 1) level = "medium";

  return { level, flags };
}
