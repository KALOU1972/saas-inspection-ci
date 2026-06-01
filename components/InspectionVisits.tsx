"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function InspectionVisits() {
  // États pour les données
  const [visites, setVisites] = useState<any[]>([]);
  const [etablissements, setEtablissements] = useState<any[]>([]);

  // États du formulaire de planification
  const [etablissementId, setEtablissementId] = useState("");
  const [dateVisite, setDateVisite] = useState("");
  const [typeVisite, setTypeVisite] = useState("Routine");
  const [inspecteurNom, setInspecteurNom] = useState("");

  // États pour la rédaction du rapport d'observations
  const [editingVisiteId, setEditingVisiteId] = useState<string | null>(null);
  const [observations, setObservations] = useState("");

  const [loading, setLoading] = useState(false);

  // Charger les données initiales
  const loadData = async () => {
    const { data: etabs } = await supabase.from("etablissements").select("id, nom").order("nom");
    if (etabs) setEtablissements(etabs);

    const { data: vits } = await supabase
      .from("visites")
      .select(`id, date_visite, type_visite, statut, inspecteur_nom, observations, etablissements(nom)`)
      .order("date_visite", { ascending: false });
    if (vits) setVisites(vits);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Planifier une nouvelle visite
  const handlePlanify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!etablissementId || !dateVisite || !inspecteurNom) return;
    setLoading(true);

    const { error } = await supabase.from("visites").insert([
      {
        etablissement_id: etablissementId,
        date_visite: dateVisite,
        type_visite: typeVisite,
        inspecteur_nom: inspecteurNom.trim(),
        statut: "Planifiée"
      }
    ]);

    if (!error) {
      setEtablissementId("");
      setDateVisite("");
      setInspecteurNom("");
      loadData();
    }
    setLoading(false);
  };

  // Clôturer une visite et enregistrer le rapport d'observations
  const handleSaveReport = async (id: string) => {
    const { error } = await supabase
      .from("visites")
      .update({
        observations: observations.trim(),
        statut: "Effectuée"
      })
      .eq("id", id);

    if (!error) {
      setEditingVisiteId(null);
      setObservations("");
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Formulaire de planification */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider mb-4">📆 Planifier une Nouvelle Visite de Terrain</h3>
        <form onSubmit={handlePlanify} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Établissement</label>
            <select
              required
              value={etablissementId}
              onChange={(e) => setEtablissementId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">-- Choisir --</option>
              {etablissements.map((e) => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date d'intervention</label>
            <input
              type="date"
              required
              value={dateVisite}
              onChange={(e) => setDateVisite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Motif / Type</label>
            <select
              value={typeVisite}
              onChange={(e) => setTypeVisite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="Routine">Contrôle de Routine</option>
              <option value="Contre-enquête">Contre-enquête</option>
              <option value="Accident du travail">Accident du travail</option>
              <option value="Plainte">Suite à une Plainte</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Inspecteur en Charge</label>
            <input
              type="text"
              required
              placeholder="Nom de l'agent"
              value={inspecteurNom}
              onChange={(e) => setInspecteurNom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-6 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Planification..." : "Ajouter à l'agenda de contrôle"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Liste de suivi et Rédaction des rapports */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">📋 Registre des Visites et Suivi des Rapports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="p-3">Établissement</th>
                <th className="p-3">Date & Type</th>
                <th className="p-3">Agent</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Rapport d'observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">Aucune visite programmée.</td>
                </tr>
              ) : (
                visites.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition valign-top">
                    <td className="p-3 font-semibold text-slate-800">{v.etablissements?.nom}</td>
                    <td className="p-3">
                      <div className="font-medium text-slate-700">{new Date(v.date_visite).toLocaleDateString("fr-FR")}</div>
                      <div className="text-xs text-slate-400 font-mono">{v.type_visite}</div>
                    </td>
                    <td className="p-3 text-slate-600 text-xs">👤 {v.inspecteur_nom}</td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        v.statut === "Effectuée" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {v.statut}
                      </span>
                    </td>
                    <td className="p-3 text-right max-w-xs">
                      {editingVisiteId === v.id ? (
                        <div className="space-y-2 text-left">
                          <textarea
                            rows={3}
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            placeholder="Saisissez ici les infractions constatées ou l'état de conformité..."
                            className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 outline-none resize-none bg-slate-50 text-slate-800"
                          />
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setEditingVisiteId(null)} className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-100 rounded">Annuler</button>
                            <button onClick={() => handleSaveReport(v.id)} className="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium">Valider le Rapport</button>
                          </div>
                        </div>
                      ) : v.observations ? (
                        <p className="text-xs text-slate-500 italic line-clamp-2 text-left bg-slate-50 p-2 rounded border border-slate-100" title={v.observations}>
                          {v.observations}
                        </p>
                      ) : (
                        <button
                          onClick={() => { setEditingVisiteId(v.id); setObservations(""); }}
                          className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-md border border-amber-200 transition"
                        >
                          ✍️ Rédiger le rapport
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}