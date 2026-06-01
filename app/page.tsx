import CompanyForm from "../components/CompanyForm";
import DisputeForm from "../components/DisputeForm";
import TerritoryManager from "../components/TerritoryManager";
import SectorManager from "../components/SectorManager";
import DashboardStats from "../components/DashboardStats";
import DisputeList from "../components/DisputeList"; // <-- Importation de la liste

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 space-y-12">
      {/* En-tête */}
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          saas-inspection — Système d'Inspection du Travail
        </h1>
        <p className="text-slate-600 mt-2">Région du Tchologo (Côte d'Ivoire)</p>
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

      {/* SECTION SUIVI ET TRAITEMENT DES LITIGES (Toute la largeur en bas) */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-slate-700 mb-4 px-2">📋 Suivi des Procédures Métier</h2>
        <DisputeList />
      </div>
    </main>
  );
}