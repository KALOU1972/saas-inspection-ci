"use client";

import { useMemo, useState } from "react";
import {
  buildMegaPrompt,
  CONFIG_DEFAUT,
  CONFIDENTIALITES,
  COUCHES,
  ECHELLES,
  FORMATS,
  type PromptStackConfig,
} from "@/lib/promptStack";

const INPUT_CLASS =
  "w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none";

export default function PromptStackStudio() {
  const [cfg, setCfg] = useState<PromptStackConfig>(CONFIG_DEFAUT);
  const [copie, setCopie] = useState(false);

  const prompt = useMemo(() => buildMegaPrompt(cfg), [cfg]);
  const nbCaracteres = prompt.length;
  const nbJetons = Math.round(nbCaracteres / 4);

  const set =
    (champ: keyof PromptStackConfig) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setCfg((c) => ({ ...c, [champ]: e.target.value }));

  const handleCopier = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Repli pour navigateurs sans Clipboard API
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopie(true);
    setTimeout(() => setCopie(false), 2500);
  };

  const handleTelecharger = () => {
    const blob = new Blob([prompt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt-stack-drt.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* --- INTRO MÉTHODE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              🧠 Prompt Stack 7 Couches — Assistant IA de la DRT
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Générateur de mega-prompt professionnel pour piloter une Direction
              Régionale du Travail avec un LLM : persona stratifiée, compression
              de contexte, échelle d&apos;objectifs, chain-of-thought, gabarits
              de sortie, cascade de contraintes et protocole 3 rounds.
              Méthode détaillée : <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">docs/prompt-stack-drt.md</code>
            </p>
          </div>
          <div className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            {COUCHES.length} couches · {FORMATS.length} gabarits · {ECHELLES.length} échelles
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {COUCHES.map((couche) => (
            <div
              key={couche.num}
              className="bg-slate-50 border border-slate-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-slate-900 text-amber-400 text-[10px] font-black rounded px-1.5 py-0.5">
                  C{couche.num}
                </span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  {couche.nom}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{couche.role}</p>
              <p className="text-[10px] text-rose-600 mt-1.5 leading-snug">
                Sans elle : {couche.risque}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* --- COLONNE GAUCHE : CARTOUCHE DE SESSION --- */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                1 · Cartouche (couche 2)
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Contexte densifié — à rafraîchir à chaque session.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Région
              </label>
              <input type="text" value={cfg.region} onChange={set("region")}
                className={INPUT_CLASS} placeholder="Ex. : Région du Tchologo" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Juridiction de référence
              </label>
              <input type="text" value={cfg.juridiction} onChange={set("juridiction")}
                className={INPUT_CLASS} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Équipe
                </label>
                <input type="text" value={cfg.equipe} onChange={set("equipe")}
                  className={INPUT_CLASS}
                  placeholder="Ex. : 12 inspecteurs (3 seniors)" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Période
                </label>
                <input type="text" value={cfg.periode} onChange={set("periode")}
                  className={INPUT_CLASS} placeholder="Ex. : T4 2026" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Portefeuille
              </label>
              <input type="text" value={cfg.portefeuille} onChange={set("portefeuille")}
                className={INPUT_CLASS}
                placeholder="Ex. : 1 450 entreprises · 87 dossiers · 9 conflits" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Faits bloquants (MUST-KNOW — 1 par ligne, ≤ 5)
              </label>
              <textarea value={cfg.mustKnow} onChange={set("mustKnow")} rows={3}
                className={INPUT_CLASS}
                placeholder="Ex. : escalade salariale en cours chez X (dossier #23)" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Contexte utile (NICE-TO-KNOW — 1 par ligne, ≤ 5)
              </label>
              <textarea value={cfg.niceToKnow} onChange={set("niceToKnow")} rows={2}
                className={INPUT_CLASS}
                placeholder="Ex. : visite ministérielle annoncée en novembre" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Conflits en cours
                </label>
                <textarea value={cfg.conflits} onChange={set("conflits")} rows={2}
                  className={INPUT_CLASS}
                  placeholder="Entreprise · effectif · état · échéance" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Échéances
                </label>
                <textarea value={cfg.echeances} onChange={set("echeances")} rows={2}
                  className={INPUT_CLASS}
                  placeholder="Date · livrable · destinataire" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                2 · Session (couches 3 & 5)
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Échelle d&apos;objectifs et gabarit de sortie demandé.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Tâche immédiate (E1)
              </label>
              <textarea value={cfg.tacheImmediate} onChange={set("tacheImmediate")} rows={3}
                className={INPUT_CLASS}
                placeholder="Ex. : Préparer le PV de manquement suite à la visite du 18/09 (établissement #12)" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Échelle active
              </label>
              <select value={cfg.echelleActive} onChange={set("echelleActive")}
                className={INPUT_CLASS}>
                {ECHELLES.map((e) => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Format de sortie
              </label>
              <select value={cfg.formatSortie} onChange={set("formatSortie")}
                className={INPUT_CLASS}>
                {FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {FORMATS.find((f) => f.id === cfg.formatSortie)?.desc}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Niveau de confidentialité (contrainte C1)
              </label>
              <select value={cfg.niveauConfidentialite}
                onChange={set("niveauConfidentialite")} className={INPUT_CLASS}>
                {CONFIDENTIALITES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setCfg(CONFIG_DEFAUT)}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition">
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* --- COLONNE DROITE : MEGA-PROMPT GÉNÉRÉ --- */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-700">
              <div>
                <span className="text-amber-400 font-black text-sm uppercase tracking-wider">
                  ⚡ Mega-Prompt assemblé
                </span>
                <span className="text-slate-400 text-xs ml-3">
                  {nbCaracteres.toLocaleString("fr-FR")} caractères · ≈ {nbJetons.toLocaleString("fr-FR")} jetons
                </span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleCopier}
                  className={`text-xs font-bold px-3 py-2 rounded-lg transition border ${
                    copie
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : "bg-amber-400 border-amber-300 text-slate-900 hover:bg-amber-300"
                  }`}>
                  {copie ? "✓ Copié !" : "📋 Copier le prompt"}
                </button>
                <button type="button" onClick={handleTelecharger}
                  className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 transition">
                  ⬇ .txt
                </button>
              </div>
            </div>
            <pre className="max-h-[70vh] overflow-auto px-4 py-4 text-[11.5px] leading-relaxed text-slate-100 font-mono whitespace-pre-wrap">
              {prompt}
            </pre>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-2">
              Mode d&apos;emploi (protocole 3 rounds)
            </h4>
            <ol className="text-xs text-amber-900 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Remplir le cartouche et la session à gauche — le prompt se met à jour en direct.</li>
              <li><strong>Copier</strong> et coller comme premier message dans votre LLM (ChatGPT, Claude, Gemini…).</li>
              <li>Envoyer <code className="bg-amber-100 px-1 rounded font-bold">R1</code> : production du livrable.</li>
              <li>Envoyer <code className="bg-amber-100 px-1 rounded font-bold">R2</code> : auto-audit + questions bloquantes — répondez-y.</li>
              <li>Envoyer <code className="bg-amber-100 px-1 rounded font-bold">R3</code> (ou « valide ») : version <strong>[FINAL]</strong> avec checklist de conformité.</li>
            </ol>
            <p className="text-[11px] text-amber-800 mt-2">
              ⚠️ Ne sautez jamais le Round 2 pour les documents signables
              (note de service, PV de manquement, CR de conciliation) : c&apos;est
              le seul garde-fou anti-hallucination juridique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
