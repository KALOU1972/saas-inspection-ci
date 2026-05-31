import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default async function DashboardPage() {
  // 1. Récupération simultanée de toutes les données nécessaires
  const [
    { data: dossiers },
    { data: entreprises },
    { data: agents }
  ] = await Promise.all([
    supabase.from('dossiers_controle').select('*, entreprises(raison_sociale, ville)'),
    supabase.from('entreprises').select('id, raison_sociale, ville'),
    supabase.from('agents_controle').select('id, nom_prenoms, emploi')
  ]);

  // 2. Calculs des indicateurs de performance (KPI)
  const totalDossiers = dossiers?.length || 0;
  const totalEntreprises = entreprises?.length || 0;
  const totalAgents = agents?.length || 0;

  const enCours = dossiers?.filter(d => d.statut === 'En cours').length || 0;
  const misesEnDemeure = dossiers?.filter(d => d.statut === 'Mise en demeure').length || 0;
  const clotures = dossiers?.filter(d => d.statut === 'Clôturé').length || 0;
  
  // Taux de résolution des contrôles
  const tauxCloture = totalDossiers > 0 ? Math.round((clotures / totalDossiers) * 100) : 0;

  // 3. Extraction des actions urgentes (Mises en demeure non réglées)
  const alertesUrgentes = dossiers?.filter(d => d.statut === 'Mise en demeure').slice(0, 5) || [];

  // 4. Extraction des derniers contrôles effectués sur le terrain
  const derniersControles = dossiers?.slice(0, 5) || [];

  // 5. Répartition géographique rapide (Top Villes)
  const villesRapport = dossiers?.reduce((acc: Record<string, number>, curr) => {
    const ville = curr.entreprises?.ville || 'Non spécifiée';
    acc[ville] = (acc[ville] || 0) + 1;
    return acc;
  }, {});
  
  const topVilles = Object.entries(villesRapport || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Barre de Notification Haute */}
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Système de Supervision National <strong>saas-inspection</strong> opérationnel.</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* En-tête du Dashboard */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tableau de Bord</h1>
            <p className="text-slate-500 text-sm mt-0.5">Pilotez les activités d'inspection du travail et le suivi de conformité légale.</p>
          </div>
          
          {/* Actions Rapides Globale */}
          <div className="flex flex-wrap gap-2">
            <Link href="/dossiers" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm">
              ➕ Ouvrir une Visite
            </Link>
          </div>
        </header>

        {/* Section 1 : Métriques Clés */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volume des Missions</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{totalDossiers}</span>
            </div>
            <Link href="/dossiers" className="text-xs font-semibold text-blue-600 hover:underline mt-4 inline-block">Voir les dossiers ➔</Link>
          </div>

          <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Instructions en Cours</span>
              <span className="text-3xl font-black text-amber-600 mt-1 block">{enCours}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-4 block">En attente de rapport de visite</span>
          </div>

          <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Mises en Demeure</span>
              <span className="text-3xl font-black text-red-600 mt-1 block">{misesEnDemeure}</span>
            </div>
            <span className="text-[11px] text-red-700 font-medium bg-red-50 px-2 py-0.5 rounded-md w-max mt-4 block">⚠️ Risque de contentieux</span>
          </div>

          <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Taux de Clôture</span>
              <span className="text-3xl font-black text-emerald-600 mt-1 block">{tauxCloture}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${tauxCloture}%` }}></div>
            </div>
          </div>
        </section>

        {/* Section 2 : Coeur Opérationnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne de gauche : Alertes et données d'équipe */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Boîte d'alertes */}
            <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <span className="text-red-500">🚨</span> Alertes de Conformité
              </h2>
              {alertesUrgentes.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Aucune mise en demeure en attente actuellement.</p>
              ) : (
                <div className="space-y-3">
                  {alertesUrgentes.map((alerte) => (
                    <Link key={alerte.id} href={`/dossiers/${alerte.id}`} className="block p-3 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-lg transition-colors group">
                      <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">{alerte.entreprises?.raison_sociale}</div>
                      <div className="text-[11px] text-red-700 font-medium mt-0.5">Procédure d'injonction ouverte</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">Visite du : {new Date(alerte.date_visite).toLocaleDateString('fr-FR')}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Statistiques Rapides Équipe & Territoire */}
            <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">📍 Répartition Géographique</h2>
              <div className="space-y-2">
                {topVilles.map(([ville, count]) => (
                  <div key={ville} className="flex justify-between items-center text-xs border-b pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-slate-700">🏢 {ville}</span>
                    <span className="font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono">{count} visite(s)</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-center border-t text-[11px] text-slate-400">
                Effectif total de contrôle déployé : <strong>{totalAgents} agents</strong>
              </div>
            </div>

          </div>

          {/* Colonne de droite : Journal des derniers contrôles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-5 border-b flex items-center justify-between bg-slate-50/60">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">📋 Journal des Récentes Inspections</h2>
                <Link href="/dossiers" className="text-xs font-bold text-blue-600 hover:underline">Tout voir ➔</Link>
              </div>

              <div className="divide-y overflow-y-auto flex-1">
                {derniersControles.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-8 text-center">Aucune activité enregistrée sur le terrain pour le moment.</p>
                ) : (
                  derniersControles.map((dossier) => (
                    <div key={dossier.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Link href={`/dossiers/${dossier.id}`} className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors block">
                          {dossier.entreprises?.raison_sociale}
                        </Link>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>📍 {dossier.entreprises?.ville}</span>
                          <span>•</span>
                          <span>{dossier.type_visite}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          dossier.statut === 'En cours' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          dossier.statut === 'Mise en demeure' ? 'bg-red-100 text-red-800 border-red-200' :
                          dossier.statut === 'Rapport rédigé' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {dossier.statut}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          {new Date(dossier.date_visite).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}