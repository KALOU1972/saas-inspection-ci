"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface Dispute {
  id: string;
  plaintiff_name: string;
  reason: string;
  claim_amount: number;
  status: "OPEN" | "MEDIATION" | "RESOLVED" | "CLOSED";
  created_at: string;
  companies: {
    name: string;
    sub_prefectures: {
      name: string;
    } | null;
  } | null;
}

export default function DisputeList() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("disputes")
        .select(`
          id,
          plaintiff_name,
          reason,
          claim_amount,
          status,
          created_at,
          companies (
            name,
            sub_prefectures ( name )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setDisputes(data as any);
    } catch (error) {
      console.error("Erreur lors du chargement des litiges :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    let nextStatus: "OPEN" | "MEDIATION" | "RESOLVED" | "CLOSED" = "OPEN";
    
    if (currentStatus === "OPEN") nextStatus = "MEDIATION";
    else if (currentStatus === "MEDIATION") nextStatus = "RESOLVED";
    else if (currentStatus === "RESOLVED") nextStatus = "CLOSED";

    const { error } = await supabase
      .from("disputes")
      .update({ status: nextStatus })
      .eq("id", id);

    if (!error) {
      fetchDisputes(); // Recharger la liste
    }
  };

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(amount).replace("XOF", "FCFA");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">Ouvert</span>;
      case "MEDIATION":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200">Médiation</span>;
      case "RESOLVED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Résolu</span>;
      case "CLOSED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">Classé</span>;
      default:
        return null;
    }
  };

  const getActionButtonText = (status: string) => {
    if (status === "OPEN") return "Convoquer (Médiation)";
    if (status === "MEDIATION") return "Marquer comme Résolu";
    if (status === "RESOLVED") return "Archiver le dossier";
    return "Réouvrir";
  };

  if (loading) {
    return <div className="text-center py-6 text-sm text-slate-500 animate-pulse">Chargement du registre des conflits...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Registre des Plaintes & Conflits</h3>
          <p className="text-xs text-slate-500 mt-0.5">Suivi des procédures d'arbitrage et conciliation en cours.</p>
        </div>
        <button 
          onClick={fetchDisputes}
          className="text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition"
        >
          🔄 Actualiser
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-4">Paignant / Motif</th>
              <th className="py-3 px-4">Établissement</th>
              <th className="py-3 px-4">Droits Réclamés</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400 font-medium">
                  Aucun dossier de litige enregistré pour le moment.
                </td>
              </tr>
            ) : (
              disputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{dispute.plaintiff_name}</div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">{dispute.reason}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-700">{dispute.companies?.name || "Inconnue"}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      📍 {dispute.companies?.sub_prefectures?.name || "N/A"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">
                    {formatFCFA(dispute.claim_amount)}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(dispute.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleStatusChange(dispute.id, dispute.status)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border transition ${
                        dispute.status === "OPEN"
                          ? "bg-amber-600 border-amber-600 text-white hover:bg-amber-700"
                          : dispute.status === "MEDIATION"
                          ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {getActionButtonText(dispute.status)}
                    </button>
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