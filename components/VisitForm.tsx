"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function VisitForm() {
  const [etablissementId, setEtablissementId] = useState("");
  const [dateVisite, setDateVisite] = useState("");
  const [typeVisite, setTypeVisite] = useState("Contrôle de routine");
  const [inspecteurNom, setInspecteurNom] = useState("");
  const [constats, setConstats] = useState("");
  const [recommandations, setRecommandations] = useState("");
  const [delai, setDelai] = useState("");

  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Charger les établissements pour le ciblage de la visite
  useEffect(() => {
    const loadEtablissements = async () => {
      const { data } = await supabase.from("etablissements").select("id, nom").order("nom");
      if (data) setEtablissements(data);
    };
    loadEtablissements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from("visites").insert([
      {
        etablissement_id: etablissementId,
        date_visite: dateVisite,
        type_visite: typeVisite,
        inspecteur_nom: inspecteurNom.trim(),
        constats: constats.trim(),
        recommandations: recommandations.trim() || null,
        delai_mise_en_demeure: delai ? parseInt(delai, 10) : null,
      }
    ]);

    if (error) {
      setMessage(`❌ Erreur : ${error.message}`);
    } else {
      setMessage("✅ Rapport de visite enregistré avec succès !");
      setEtablissementId("");
      setDateVisite("");
      setTypeVisite("Contrôle de routine");
      setInspecteurNom("");
      setConstats("");
      setRecommandations("");
      setDelai("");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">📋 Nouveau Rapport de Visite</h3>
      
      {message && (
        <div className="p-3 text-sm rounded-lg font-medium bg-slate-50 border border-slate-200 text-slate-800">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Établissement Inspecté</label>
          <select
            required
            value={etablissementId}
            onChange={(e) => setEtablissementId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="">-- Choisir l'entreprise --</option>
            {etablissements.map((etab) => (
              <option key={etab.id} value={etab.id}>{etab.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Inspecteur / Contrôleur</label>
          <input
            type="text"
            required
            value={inspecteurNom}
            onChange={(e) => setInspecteurNom(e.target.value)}
            placeholder="Nom de l'agent"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date de la Visite</label>
          <input
            type="date"
            required
            value={dateVisite}
            onChange={(e) => setDateVisite(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Type d'Intervention</label>
          <select
            value={typeVisite}
            onChange={(e) => setTypeVisite(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="Contrôle de routine">Contrôle de routine</option>
            <option value="Contre-visite">Contre-visite</option>
            <option value="Accident du travail">Accident du travail</option>
            <option value="Enquête de grève">Enquête de grève</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Constats et Observations (Infractions)</label>
        <textarea
          required
          rows={3}
          value={constats}
          onChange={(e) => setConstats(e.target.value)}
          placeholder="Ex: Défaut de déclaration de 5 travailleurs, absence d'équipements de protection individuelle (EPI) sur le chantier..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Recommandations / Demandes de mise en conformité</label>
          <input
            type="text"
            value={recommandations}
            onChange={(e) => setRecommandations(e.target.value)}
            placeholder="Ex: Régulariser la situation CNPS, fournir les casques"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Délai accordé (Jours)</label>
          <input
            type="number"
            value={delai}
            onChange={(e) => setDelai(e.target.value)}
            placeholder="Ex: 15"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
      >
        {loading ? "Enregistrement du rapport..." : "Clôturer et Enregistrer la Visite"}
      </button>
    </form>
  );
}