"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface DysAssessment {
  id: string;
  createdAt: string;
  risk: "low" | "medium" | "high";
  results: {
    reading?: { mclm: number; percentile: string; duration: number; errors: number; wordCount: number };
    phoneme?: { correct: number; total: number; accuracy: number; avgRT: number; difficulties: string[] };
    subitization?: { correct: number; total: number; accuracy: number; avgRT: number; maxSubitized: number };
    dictation?: { totalWords: number; orthographicCorrect: number; phoneticCorrect: number; avgTimePerWord: number; regularErrors: number; irregularErrors: number };
  };
  flags: string[];
}

interface Child {
  id: string;
  name: string;
  ageGroup: string;
}

const FLAG_LABELS: Record<string, { label: string; domain: string; advice: string }> = {
  reading_speed: {
    label: "Vitesse de lecture",
    domain: "Dyslexie possible",
    advice: "Une vitesse de lecture lente par rapport à l'âge peut être un signe précoce de dyslexie. Il est recommandé de consulter un orthophoniste pour un bilan complet.",
  },
  phoneme_discrimination: {
    label: "Discrimination phonémique",
    domain: "Trouble phonologique / dyslexie",
    advice: "Des difficultés à distinguer les sons proches (/p/-/b/, /t/-/d/…) sont fortement associées aux troubles phonologiques et à la dyslexie. Un bilan orthophonique est conseillé.",
  },
  number_sense: {
    label: "Sens du nombre",
    domain: "Dyscalculie possible",
    advice: "Un déficit de subitisation (perception rapide des petites quantités) est un marqueur de dyscalculie. Consulter un neuropsychologue pour confirmer.",
  },
  spelling: {
    label: "Orthographe",
    domain: "Dysorthographie possible",
    advice: "De nombreuses erreurs d'orthographe, surtout sur des mots réguliers, peuvent indiquer une dysorthographie. Bilan orthophonique recommandé.",
  },
};

export default function DysReportPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const [assessments, setAssessments] = useState<DysAssessment[]>([]);
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/children/${childId}`).then((r) => r.json()),
      fetch(`/api/dys-assessment?childId=${childId}`).then((r) => r.json()),
    ]).then(([childData, assessmentData]) => {
      setChild(childData);
      setAssessments(assessmentData.assessments || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [childId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-5xl animate-pulse">📊</div>
      </div>
    );
  }

  const latest = assessments[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-6 text-white">
        <div className="max-w-2xl mx-auto">
          <Link href={`/parent/child/${childId}`} className="text-white/70 text-sm font-bold mb-3 inline-block">← Profil</Link>
          <h1 className="text-2xl font-black">Rapport de dépistage dys</h1>
          <p className="text-white/80 text-sm mt-1">
            {child?.name} · {assessments.length} bilan{assessments.length > 1 ? "s" : ""} enregistré{assessments.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-4">
        {!latest ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <div className="text-5xl mb-3">🔍</div>
            <h2 className="text-lg font-black text-slate-700 mb-2">Aucun bilan disponible</h2>
            <p className="text-sm text-slate-500 mb-4">
              Votre enfant n&apos;a pas encore fait de bilan de dépistage.
            </p>
            <Link
              href={`/child/${childId}/dys-assessment`}
              className="inline-block px-6 py-3 rounded-xl bg-indigo-500 text-white font-black shadow-lg"
            >
              Faire un bilan maintenant
            </Link>
          </div>
        ) : (
          <>
            {/* Global risk */}
            <div className={`bg-white rounded-2xl p-5 border-l-4 shadow-sm ${
              latest.risk === "low" ? "border-green-400" :
              latest.risk === "medium" ? "border-amber-400" : "border-red-400"
            }`}>
              <p className="text-xs font-black text-slate-500 uppercase mb-1">Dernier bilan · {new Date(latest.createdAt).toLocaleDateString("fr-FR")}</p>
              <h2 className={`text-2xl font-black ${
                latest.risk === "low" ? "text-green-600" :
                latest.risk === "medium" ? "text-amber-600" : "text-red-600"
              }`}>
                {latest.risk === "low" ? "✓ Profil sans alerte" :
                 latest.risk === "medium" ? "⚠️ Points d'attention" : "🚨 Consulter un professionnel"}
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                {latest.risk === "low" ? "Aucun indicateur préoccupant n'a été détecté. Votre enfant peut continuer à progresser normalement." :
                 latest.risk === "medium" ? "Quelques indicateurs méritent d'être surveillés. Pas d'urgence mais restez attentif." :
                 "Plusieurs indicateurs suggèrent qu'un bilan professionnel serait bénéfique pour votre enfant."}
              </p>
            </div>

            {/* Flagged areas */}
            {latest.flags.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-black text-slate-700 px-1">Points d&apos;alerte</h3>
                {latest.flags.map((flag) => {
                  const info = FLAG_LABELS[flag];
                  if (!info) return null;
                  return (
                    <div key={flag} className="bg-white rounded-2xl p-4 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">⚠️</div>
                        <div className="flex-1">
                          <p className="font-black text-slate-800">{info.label}</p>
                          <p className="text-xs text-amber-600 font-bold mb-2">{info.domain}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{info.advice}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed results */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-700 px-1">Résultats détaillés</h3>

              {latest.results.reading && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📖</span>
                      <span className="font-black text-slate-700">Vitesse de lecture</span>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded-full ${
                      latest.results.reading.percentile === "low" ? "bg-red-100 text-red-700" :
                      latest.results.reading.percentile === "high" ? "bg-green-100 text-green-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {latest.results.reading.percentile.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{latest.results.reading.mclm} <span className="text-sm text-slate-500 font-normal">mots/min</span></p>
                  <p className="text-xs text-slate-500 mt-1">
                    {latest.results.reading.wordCount} mots · {latest.results.reading.errors} erreur(s) · {Math.round(latest.results.reading.duration)}s
                  </p>
                </div>
              )}

              {latest.results.phoneme && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎧</span>
                    <span className="font-black text-slate-700">Discrimination phonémique</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{latest.results.phoneme.accuracy}%</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {latest.results.phoneme.correct}/{latest.results.phoneme.total} corrects · {(latest.results.phoneme.avgRT / 1000).toFixed(1)}s moy.
                  </p>
                  {latest.results.phoneme.difficulties.length > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                      <span className="font-bold">Sons difficiles :</span> {latest.results.phoneme.difficulties.join(", ")}
                    </div>
                  )}
                </div>
              )}

              {latest.results.subitization && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="font-black text-slate-700">Perception du nombre</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{latest.results.subitization.accuracy}%</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Perçoit instantanément jusqu&apos;à <span className="font-bold">{latest.results.subitization.maxSubitized}</span> · RT {(latest.results.subitization.avgRT / 1000).toFixed(1)}s
                  </p>
                </div>
              )}

              {latest.results.dictation && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✍️</span>
                    <span className="font-black text-slate-700">Dictée</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{latest.results.dictation.orthographicCorrect}/{latest.results.dictation.totalWords}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mots réguliers : {latest.results.dictation.regularErrors} erreur(s) · Irréguliers : {latest.results.dictation.irregularErrors} erreur(s)
                  </p>
                </div>
              )}
            </div>

            {/* History */}
            {assessments.length > 1 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                <h3 className="font-black text-slate-700 mb-3">Évolution</h3>
                <div className="space-y-2">
                  {assessments.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <span className="text-xs text-slate-600">{new Date(a.createdAt).toLocaleDateString("fr-FR")}</span>
                      <span className={`text-xs font-black px-2 py-1 rounded-full ${
                        a.risk === "low" ? "bg-green-100 text-green-700" :
                        a.risk === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>
                        {a.risk === "low" ? "OK" : a.risk === "medium" ? "Attention" : "Alerte"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-slate-100 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed">
              <p className="font-black text-slate-700 mb-2">⚠️ Avis important</p>
              <p>
                Ce rapport est un outil d&apos;alerte basé sur des tests simplifiés. Il ne constitue <span className="font-bold">pas un diagnostic médical</span>.
                Seul un professionnel (orthophoniste, neuropsychologue, médecin) peut poser un diagnostic de dys après un bilan complet.
                Si le rapport signale des points d&apos;alerte, nous recommandons fortement de consulter.
              </p>
            </div>

            {/* New assessment button */}
            <Link
              href={`/child/${childId}/dys-assessment`}
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-center shadow-lg active:scale-95 transition-transform"
            >
              🔄 Refaire un bilan
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
