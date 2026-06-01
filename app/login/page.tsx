"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CompanyForm from "../components/CompanyForm";
import DisputeForm from "../components/DisputeForm";
import TerritoryManager from "../components/TerritoryManager";
import SectorManager from "../components/SectorManager";
import DashboardStats from "../components/DashboardStats";
import DisputeList from "../components/DisputeList";
import LoginForm from "../components/LoginForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // 1. Vérifier la session actuelle au chargement
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      setCheckingSession(false);
    });

    // 2. Écouter les changements d'état (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (confirm("Voulez-vous vous déconnecter de l'application ?")) {
      await supabase.auth.signOut();
    }
  };

  // Affichage d'un écran neutre de chargement pendant la vérification
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="inline-block animate-spin border-4 border-slate-300 border-t-slate-900 rounded-full h-8 w-8"></span>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, on lui présente le formulaire de connexion
  if (!session) {
    return <LoginForm onLoginSuccess={() => window.location.reload()} />;
  }

  // Si connecté, accès complet au tableau de bord
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 space-y-12">
      {/* En-tête avec bouton de déconnexion */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            saas-inspection — Système d'Inspection du Travail
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Région du Tchologo (Côte d'Ivoire) — Inspecteur connecté : <span className="font-semibold text-slate-700">{session.user.email}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-semibold px-4 py-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg hover:bg-rose-100 transition whitespace-nowrap"
        >
          🚪 Déconnexion
        </button>
      </div>
      
      {/* SECTION DASHBOARD */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-slate-700 mb-4 px-2">📊 Tableau de Bord Régional</h2>
        <DashboardStats />
      </div>

      <hr className="max-w-6xl mx-auto border-slate-200" />
      
      {/* Configuration globale */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-700 px-2">🔧 Configuration du Territoire</h2>
          <TerritoryManager />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-700 px-2">💼 Secteurs Référencés</h2>
          <SectorManager />
        </div>
      </div>

      <hr className="max-w-6xl mx-auto border-slate-200" />

      {/* Saisie métier */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-4 px-2">🏢 Registre des Établissements</h2>
          <CompanyForm />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-4 px-2">⚖️ Traitement des Conflits</h2>
          <DisputeForm />
        </div>
      </div>

      <hr className="max-w-6xl mx-auto border-slate-200" />

      {/* SECTION SUIVI ET TRAITEMENT DES LITIGES */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-slate-700 mb-4 px-2">📋 Suivi des Procédures Métier</h2>
        <DisputeList />
      </div>
    </main>
  );
}