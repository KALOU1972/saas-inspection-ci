"use client";

import { useState } from "react";
import DashboardAnalytics from "@/components/DashboardAnalytics";
import DisputeList from "@/components/DisputeList";
import DisputeForm from "@/components/DisputeForm";
import CompanyForm from "@/components/CompanyForm";
import SectorManager from "@/components/SectorManager";
import InspectionVisits from "@/components/InspectionVisits";

export default function Home() {
  // Gestion de l'onglet actif pour une navigation fluide
  const [activeTab, setActiveTab] = useState<"analytics" | "litiges" | "visites" | "configuration">("analytics");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      
      {/* --- BANDEAU ET HEADER OFFICIEL --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-amber-400 p-2.5 rounded-xl font-black tracking-wider text-xl shadow-inner">
              DGT
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800 uppercase">
                DGT — Inspection du Travail
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Plateforme Territoriale de Gestion et de Suivi des Recours
              </p>
            </div>
          </div>
          
          {/* Badge de localisation de l'antenne régionale */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600 font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Région du Tchologo • Côte d'Ivoire
          </div>
        </div>

        {/* --- BARRE DE NAVIGATION (ONGLETS) --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
          <nav className="flex space-x-6 -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-3.5 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition ${
                activeTab === "analytics"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📈 Tableau de Bord
            </button>
            <button
              onClick={() => setActiveTab("litiges")}
              className={`py-3.5 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition ${
                activeTab === "litiges"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              ⚖️ Litiges & Recours
            </button>
            <button
              onClick={() => setActiveTab("visites")}
              className={`py-3.5 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition ${
                activeTab === "visites"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📆 Contrôles de Terrain
            </button>
            <button
              onClick={() => setActiveTab("configuration")}
              className={`py-3.5 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition ${
                activeTab === "configuration"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              ⚙️ Établissements & Secteurs
            </button>
          </nav>
        </div>
      </header>

      {/* --- CONTENU PRINCIPAL DYNAMIQUE --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ONGLET 1 : STATISTIQUES ET GRAPHIQUES */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fadeIn">
            <DashboardAnalytics />
          </div>
        )}

        {/* ONGLET 2 : ENREGISTREMENT ET SUIVI DES LITIGES */}
        {activeTab === "litiges" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-1 space-y-4 sticky top-24">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">
                  Ouvrir un Dossier
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Saisissez les réclamations d'un travailleur ou d'une organisation syndicale pour générer un numéro de recours.
                </p>
                <DisputeForm />
              </div>
            </div>
            <div className="lg:col-span-2">
              <DisputeList />
            </div>
          </div>
        )}

        {/* ONGLET 3 : PLANIFICATION ET RAPPORTS DE VISITES */}
        {activeTab === "visites" && (
          <div className="animate-fadeIn">
            <InspectionVisits />
          </div>
        )}

        {/* ONGLET 4 : CONFIGURATION DES ÉTABLISSEMENTS ET SECTEURS D'ACTIVITÉ */}
        {activeTab === "configuration" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">
                  Nouveau Secteur
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Ajouter des branches d'activité (BTP, Industrie, etc.)
                </p>
                <SectorManager />
              </div>
            </div>
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">
                Enregistrer un Établissement
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Déclarez les entreprises locales pour les lier aux futurs litiges et contrôles de routine.
              </p>
              <CompanyForm />
            </div>
          </div>
        )}

      </main>

      {/* --- FOOTER ADMINISTRATIF --- */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 font-medium">
          DGT v2.1 — Système d'Information Intégré de l'Inspection du Travail • Ministère de l'Emploi et de la Protection Sociale.
        </div>
      </footer>
    </div>
  );
}