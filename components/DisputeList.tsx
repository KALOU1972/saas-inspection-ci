"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { generatePV } from "../lib/generatePV";

// Initialisation du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface Litige {
  id: string;
  demandeur: string;
  defendeur: string;
  objet: string;
  statut: string;
  date_audition: string | null;
  etablissements: {
    nom: string;
  } | null;
}

export default function DisputeList() {
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fonction pour charger les litiges depuis la base de données
  const fetchLitiges = async () => {
    try {
      const { data, error } = await supabase
        .from("litiges")
        .select(`
          id, 
          demandeur, 
          defendeur, 
          objet, 
          statut, 
          date_audition,
          etablissements ( nom )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setLitiges(data as unknown as Litige[]);
    } catch (error) {
      console.error("Erreur lors du chargement des litiges :", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fonction pour mettre à jour le statut d'un litige en direct
  const updateStatut = async (id: string, nouveauStatut: string) => {
    const { error } = await supabase
      .from("litiges")
      .update({ statut: nouveauStatut })
      .eq("id", id);

    if (!error) {
      // Mise à jour de l'état local pour éviter un rechargement complet
      setLitiges((prev) =>
        prev.map((l) => (l.id === id ? { ...l, statut: nouveauStatut } : l))
      );
    } else {
      console.error("Erreur de mise à jour du statut :", error.message);
    }
  };

  useEffect(() => {
    fetchLitiges();

    // 3. Écouteur en temps réel (Realtime) pour synchroniser la liste à chaque ajout/modification
    const disputeChannel = supabase
      .channel("realtime-disputes-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "litiges" },
        () => {
          fetchLitiges();
        }
      )
      .subscribe();

    // Nettoyage du canal au démontage du composant
    return () => {
      supabase.removeChannel(disputeChannel);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 animate-pulse">
        Chargement de l'historique des recours de la DGT...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          ⚖️ Registre et Suivi des Recours
        </h3>
        <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
          {litiges.length} Dossier(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600 font-medium">
              <th className="p-3">Établissement</th>
              <th className="p-3">Parties (Demandeur / Défendeur)</th>
              <th className="p-3">Objet du Litige</th>
              <th className="p-3">Audition</th>
              <th className="p-3">Statut & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {litiges.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                  Aucun recours ou litige enregistré pour le moment.
                </td>
              </tr>
            ) : (
              litiges.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition valign-top">
                  {/* Entreprise rattachée */}
                  <td className="p-3 font-semibold text-slate-800">
                    {l.etablissements?.nom || "Non spécifié"}
                  </td>

                  {/* Identification des parties */}
                  <td className="p-3">
                    <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                      🙋‍♂️ {l.demandeur}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      🏢 {l.defendeur}
                    </div>
                  </td>

                  {/* Description des faits */}
                  <td className="p-3 max-w-xs">
                    <p className="text-xs text-slate-600 line-clamp-2" title={l.objet}>
                      {l.objet}
                    </p>
                  </td>

                  {/* Date d'audition programmée */}
                  <td className="p-3 text-xs text-slate-500 font-medium">
                    {l.date_audition ? (
                      <span className="bg-slate-100 px-2 py-1 rounded">
                        🗓️ {new Date(l.date_audition).toLocaleDateString("fr-FR")}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Non planifiée</span>
                    )}
                  </td>

                  {/* Gestion du statut et Génération du PV */}
                  <td className="p-3">
                    <div className="flex flex-col gap-2 w-36">
                      <select
                        value={l.statut}
                        onChange={(e) => updateStatut(l.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1.5 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer transition ${
                          l.statut === "Concilié"
                            ? "text-emerald-700 border-emerald-200 bg-emerald-50/50"
                            : l.statut === "Non concilié"
                            ? "text-rose-700 border-rose-200 bg-rose-50/50"
                            : l.statut === "En cours"
                            ? "text-blue-700 border-blue-200 bg-blue-50/50"
                            : "text-amber-700 border-amber-200 bg-amber-50/50"
                        }`}
                      >
                        <option value="En attente">En attente</option>
                        <option value="En cours">En cours</option>
                        <option value="Concilié">Concilié</option>
                        <option value="Non concilié">Non concilié</option>
                      </select>

                      {/* Déclencheur du PDF officiel */}
                      <button
                        onClick={() => generatePV(l)}
                        className="text-left text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 p-1 rounded hover:bg-slate-100 transition"
                        title="Générer le Procès-Verbal officiel"
                      >
                        📄 Télécharger le PV
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}