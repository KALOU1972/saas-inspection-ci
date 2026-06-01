"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Importations strictes par défaut de vos composants métiers
import CompanyForm from "../components/CompanyForm";
import DisputeForm from "../components/DisputeForm";
import TerritoryManager from "../components/TerritoryManager";
import SectorManager from "../components/SectorManager";
import DashboardStats from "../components/DashboardStats";
import DisputeList from "../components/DisputeList";
import LoginForm from "../components/LoginForm"; 

// Initialisation globale du client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Vérifier la session active au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Écouter les changements d'état d'authentification (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, on affiche l'écran de connexion exclusif
  if (!session) {
    return <LoginForm onLoginSuccess={() => window.location.reload()} />;
  }

  // Si connecté, accès complet au tableau de bord MUDEKO
  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Barre de navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-black text-slate-900 tracking-tight">DGT</span>
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">
              Inspecteur
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 hidden sm:inline-block">
              {session.user?.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Statistiques générales */}
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Établissements */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 px-2">🏢 Registre des Établissements</h2>
            <CompanyForm />
          </div>

          {/* Section Conflits et Litiges */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 px-2">⚖️ Suivi des Litiges Professionnels</h2>
            <DisputeForm />
          </div>
        </div>

        {/* Section Listes complètes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">📋 Historique des Recours & Auditions</h2>
          <DisputeList />
        </div>

        {/* Section Paramétrage Territorial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200">
          <TerritoryManager />
          <SectorManager />
        </div>
      </div>
    </main>
  );
}