"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface Stats {
  totalCompanies: number;
  totalEmployees: number;
  openDisputes: number;
  totalClaimsAmount: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalCompanies: 0,
    totalEmployees: 0,
    openDisputes: 0,
    totalClaimsAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. Nombre d'entreprises et somme des employés
        const { data: companiesData, error: compError } = await supabase
          .from("companies")
          .select("employee_count");

        if (compError) throw compError;

        const totalCompanies = companiesData?.length || 0;
        const totalEmployees = companiesData?.reduce((sum, item) => sum + (item.employee_count || 0), 0) || 0;

        // 2. Nombre de litiges ouverts
        const { count: openDisputesCount, error: dispError } = await supabase
          .from("disputes")
          .select("*", { count: "exact", head: true })
          .eq("status", "OPEN");

        if (dispError) throw dispError;

        // 3. Somme totale des réclamations financières
        const { data: claimsData, error: claimsError } = await supabase
          .from("disputes")
          .select("claim_amount");

        if (claimsError) throw claimsError;

        const totalClaimsAmount = claimsData?.reduce((sum, item) => sum + (item.claim_amount || 0), 0) || 0;

        setStats({
          totalCompanies,
          totalEmployees,
          openDisputes: openDisputesCount || 0,
          totalClaimsAmount,
        });

      } catch (error) {
        console.error("Erreur lors du calcul des statistiques :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();

    // Optionnel : Mettre en place un système de rafraîchissement si nécessaire ou laisser l'utilisateur recharger
  }, []);

  // Fonction utilitaire pour formater les montants en FCFA
  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(amount).replace("XOF", "FCFA");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl border border-slate-100"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Carte 1 : Établissements */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Établissements</span>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalCompanies}</h3>
        </div>
        <p className="text-xs text-emerald-600 mt-2 font-medium">🏢 Enregistrés dans le Tchologo</p>
      </div>

      {/* Carte 2 : Salariés Couverts */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Salariés Protégés</span>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalEmployees.toLocaleString("fr-FR")}</h3>
        </div>
        <p className="text-xs text-blue-600 mt-2 font-medium">👥 Effectif total suivi</p>
      </div>

      {/* Carte 3 : Litiges Actifs */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dossiers Ouverts</span>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.openDisputes}</h3>
        </div>
        <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ Conflits en attente de médiation</p>
      </div>

      {/* Carte 4 : Enjeux Financiers */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Réclamations Globales</span>
          <h3 className="text-xl font-bold text-rose-600 mt-1 truncate">{formatFCFA(stats.totalClaimsAmount)}</h3>
        </div>
        <p className="text-xs text-rose-500 mt-2 font-medium">💰 Total des droits réclamés</p>
      </div>
    </div>
  );
}