import { supabase } from '../../lib/supabase';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ statut?: string; type_visite?: string; agent_id?: string }>;
}

export default async function DossiersPage({ searchParams }: PageProps) {
  // 1. Récupération des paramètres de filtrage de l'URL (Next.js 15)
  const queryParams = await searchParams;
  const filtreStatut = queryParams.statut || '';
  const filtreType = queryParams.type_visite || '';
  const filtreAgent = queryParams.agent_id || '';

  // 2. Construction de la requête Supabase filtrée pour le tableau
  let queryDossiers = supabase
    .from('dossiers_controle')
    .select('*, entreprises(raison_sociale, ncc, ville), agents_controle(nom_prenoms, emploi, fonction)')
    .order('date_visite', { ascending: false });

  if (filtreStatut) queryDossiers = queryDossiers.eq('statut', filtreStatut);
  if (filtreType) queryDossiers = queryDossiers.eq('type_visite', filtreType);
  if (filtreAgent) queryDossiers = queryDossiers.eq('agent_id', parseInt(filtreAgent, 10));

  const { data: dossiers, error: errorDossiers } = await queryDossiers;

  // 3. Récupération globale pour calculer les statistiques
  const { data: tousLesDossiers } = await supabase.from('dossiers_controle').select('statut');
  
  const stats = {
    total: tousLesDossiers?.length || 0,
    enCours: tousLesDossiers?.filter(d => d.statut === 'En cours').length || 0,
    rapportRédigé: tousLesDossiers?.filter(d => d.statut === 'Rapport rédigé').length || 0,
    miseEnDemeure: tousLesDossiers?.filter(d => d.statut === 'Mise en demeure').length || 0,
    clotures: tousLesDossiers?.filter(d => d.statut === 'Clôturé').length || 0,
  };

  // 4. Récupération des données annexes
  const { data: entreprises, error: errorEntreprises } = await supabase
    .from('entreprises')
    .select('id, raison_sociale, ncc')
    .order('raison_sociale', { ascending: true });

  const { data: agents, error: errorAgents } = await supabase
    .from('agents_controle')
    .select('*')
    .order('nom_prenoms', { ascending: true });

  const { data: emploisRef } = await supabase.from('emplois_referentiel').select('*').order('libelle');
  const { data: fonctionsRef } = await supabase.from('fonctions_referentiel').select('*').order('libelle');

  // Regroupement sécurisé des agents par emploi
  const agentsGroupes: Record<string, any[]> = {};
  if (agents && agents.length > 0) {
    agents.forEach((agent) => {
      const categ = agent.emploi || "Autres personnels";
      if (!agentsGroupes[categ]) agentsGroupes[categ] = [];
      agentsGroupes[categ].push(agent);
    });
  }

  const listeGrades = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2'];
  const globalError = errorDossiers || errorEntreprises || errorAgents;

  // --- ACTIONS SERVEUR ---
  async function ouvrirDossier(formData: FormData) {
    'use server';
    const entreprise_id = formData.get('entreprise_id') as string;
    const type_visite = formData.get('type_visite') as string;
    const agent_id = formData.get('agent_id') as string;
    const date_visite = formData.get('date_visite') as string;

    await supabase.from('dossiers_controle').insert([{
      entreprise_id: parseInt(entreprise_id, 10),
      type_visite,
      agent_id: agent_id ? parseInt(agent_id, 10) : null,
      date_visite: date_visite || new Date().toISOString().split('T')[0],
      statut: 'En cours'
    }]);
    revalidatePath('/dossiers');
  }

  async function ajouterAgent(formData: FormData) {
    'use server';
    const matricule = formData.get('matricule') as string;
    const nom_prenoms = formData.get('nom_prenoms') as string;
    const emploi = formData.get('emploi') as string;
    const grade = formData.get('grade') as string;
    const fonction = formData.get('fonction') as string;
    const telephone = formData.get('telephone') as string;
    const email = formData.get('email') as string;
    
    await supabase.from('agents_controle').insert([{ 
      matricule, 
      nom_prenoms, 
      emploi, 
      grade, 
      fonction: fonction || null, 
      telephone: telephone || null, 
      email: email || null 
    }]);
    revalidatePath('/dossiers');
  }

  async function changerStatutRapide(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const nouveauStatut = formData.get('statut') as string;
    await supabase.from('dossiers_controle').update({ statut: nouveauStatut }).eq('id', parseInt(id, 10));
    revalidatePath('/dossiers');
  }

  async function supprimerDossier(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await supabase.from('dossiers_controle').delete().eq('id', parseInt(id, 10));
    revalidatePath('/dossiers');
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation */}
        <nav className="flex space-x-4 text-sm font-medium border-b pb-3">
          <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">🏢 Référentiel Entreprises</Link>
          <span className="text-slate-300">/</span>
          <Link href="/dossiers" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-3 -mb-3.5">📂 Gestion des Visites & Agents</Link>
        </nav>

        {/* En-tête */}
        <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestion des Contrôles & Équipes</h1>
          <p className="text-slate-500 text-sm mt-1">Suivi des dossiers de visite sur le terrain et fiches agents de l'Inspection</p>
        </header>

        {globalError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">⚠️ Erreur Supabase : {globalError.message}</div>
        )}

        {/* Blocs KPI */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Total Dossiers</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 shadow-sm">
            <div className="text-xs font-bold uppercase text-amber-600">🕵️ En Cours</div>
            <div className="text-2xl font-extrabold text-amber-800 mt-1">{stats.enCours}</div>
          </div>
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 shadow-sm">
            <div className="text-xs font-bold uppercase text-blue-600">📝 Rapports Rédigés</div>
            <div className="text-2xl font-extrabold text-blue-800 mt-1">{stats.rapportRédigé}</div>
          </div>
          <div className="bg-red-50/60 p-4 rounded-xl border border-red-100 shadow-sm">
            <div className="text-xs font-bold uppercase text-red-600">⚠️ Mises en Demeure</div>
            <div className="text-2xl font-extrabold text-red-800 mt-1">{stats.miseEnDemeure}</div>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 shadow-sm col-span-2 lg:col-span-1">
            <div className="text-xs font-bold uppercase text-emerald-600">🛡️ Clôturés</div>
            <div className="text-2xl font-extrabold text-emerald-800 mt-1">{stats.clotures}</div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
          
          {/* Formulaires */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <h2 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b">1. Ouvrir un Dossier de Contrôle</h2>
              <form action={ouvrirDossier} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-0.5">Entreprise Cible</label>
                  <select name="entreprise_id" required className="w-full px-3 py-1.5 border rounded text-sm bg-slate-50 text-slate-700">
                    <option value="">-- Choisir l'entreprise --</option>
                    {entreprises?.map((ent) => <option key={ent.id} value={ent.id}>{ent.raison_sociale} ({ent.ncc})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-0.5">Type de Contrôle</label>
                  <select name="type_visite" required className="w-full px-3 py-1.5 border rounded text-sm bg-slate-50 text-slate-700">
                    <option value="Contrôle inopiné">Contrôle inopiné</option>
                    <option value="Contrôle sollicité">Contrôle sollicité</option>
                    <option value="Contrôle général">Contrôle général</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-0.5">Date effective</label>
                  <input type="date" name="date_visite" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-1.5 border rounded text-sm bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-0.5">Agent Assigné</label>
                  <select name="agent_id" required className="w-full px-3 py-1.5 border rounded text-sm bg-slate-50 text-slate-700">
                    <option value="">-- Sélectionner l'agent --</option>
                    {Object.entries(agentsGroupes).map(([group, list]) => (
                      <optgroup key={group} label={`💼 ${group}s`}>
                        {list.map((a) => <option key={a.id} value={a.id}>{a.nom_prenoms}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded text-sm">Créer le dossier</button>
              </form>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <h2 className="text-base font-bold text-slate-900 mb-3 pb-1 border-b">2. Nouvel Agent</h2>
              <form action={ajouterAgent} className="space-y-3">
                <input type="text" name="nom_prenoms" required placeholder="Nom et Prénoms" className="w-full px-3 py-1.5 border rounded text-sm bg-slate-50" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" name="matricule" required placeholder="Matricule" className="w-full px-3 py-1.5 border rounded text-sm bg-slate-50" />
                  <select name="grade" required className="w-full px-3 py-1.5 border rounded text-sm bg-slate-50 text-slate-700">
                    <option value="">Grade</option>
                    {listeGrades.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select name="emploi" required className="w-full px-3 py-1.5 border rounded text-sm bg-slate-50 text-slate-700">
                    <option value="">Emploi</option>
                    {emploisRef?.map((e) => <option key={e.id} value={e.libelle}>{e.libelle}</option>)}
                  </select>
                  <select name="fonction" className="w-full px-3 py-1.5 border rounded text-sm bg-slate-50 text-slate-700">
                    <option value="">Fonction</option>
                    {fonctionsRef?.map((f) => <option key={f.id} value={f.libelle}>{f.libelle}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white font-medium py-1.5 rounded text-xs">+ Enregistrer l'Agent</button>
              </form>
            </div>
          </div>

          {/* Filtres & Tableau */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Statut juridique</label>
                  <select name="statut" defaultValue={filtreStatut} className="w-full px-2 py-1.5 border rounded text-xs bg-slate-50 font-medium text-slate-700">
                    <option value="">Tous les statuts</option>
                    <option value="En cours">En cours</option>
                    <option value="Rapport rédigé">Rapport rédigé</option>
                    <option value="Mise en demeure">Mise en demeure</option>
                    <option value="Clôturé">Clôturé</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type de contrôle</label>
                  <select name="type_visite" defaultValue={filtreType} className="w-full px-2 py-1.5 border rounded text-xs bg-slate-50 font-medium text-slate-700">
                    <option value="">Tous les types</option>
                    <option value="Contrôle inopiné">Contrôle inopiné</option>
                    <option value="Contrôle sollicité">Contrôle sollicité</option>
                    <option value="Contrôle général">Contrôle général</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Par inspecteur</label>
                  <select name="agent_id" defaultValue={filtreAgent} className="w-full px-2 py-1.5 border rounded text-xs bg-slate-50 font-medium text-slate-700">
                    <option value="">Tous les agents</option>
                    {agents?.map(a => <option key={a.id} value={a.id}>{a.nom_prenoms}</option>)}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-1.5 rounded text-xs transition-colors shadow-sm">
                    🔍 Filtrer
                  </button>
                  {String(filtreStatut || filtreType || filtreAgent) !== "" && (
                    <Link href="/dossiers" title="Réinitialiser" className="bg-slate-100 hover:bg-slate-200 text-slate-600 border px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-center">
                      ❌
                    </Link>
                  )}
                </div>
              </form>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b text-xs font-semibold uppercase text-slate-600">
                      <th className="p-4">Entreprise visée</th>
                      <th className="p-4">Détails du contrôle</th>
                      <th className="p-4">Agent en charge</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions rapides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {dossiers && dossiers.length > 0 ? (
                      dossiers.map((dossier: any) => (
                        <tr key={dossier.id} className="hover:bg-slate-50 transition-colors group/row">
                          <td className="p-4">
                            <Link href={`/dossiers/${dossier.id}`} className="group block">
                              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center">
                                {dossier.entreprises?.raison_sociale} <span className="ml-1.5 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity text-xs">➔</span>
                              </div>
                            </Link>
                            <div className="text-xs text-slate-400 font-mono">NCC: {dossier.entreprises?.ncc}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-800">{dossier.type_visite}</div>
                            <div className="text-xs text-slate-400">{new Date(dossier.date_visite).toLocaleDateString('fr-FR')}</div>
                          </td>
                          <td className="p-4">
                            {dossier.agents_controle ? (
                              <div>
                                <div className="text-slate-900 font-semibold text-xs">{dossier.agents_controle.nom_prenoms}</div>
                                <div className="text-[10px] text-blue-600 font-semibold">{dossier.agents_controle.emploi}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Non assigné</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              dossier.statut === 'En cours' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              dossier.statut === 'Mise en demeure' ? 'bg-red-100 text-red-800 border-red-200' :
                              dossier.statut === 'Rapport rédigé' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}>
                              • {dossier.statut}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {dossier.statut !== 'Clôturé' && (
                                <>
                                  {dossier.statut !== 'Mise en demeure' && (
                                    <form action={changerStatutRapide}>
                                      <input type="hidden" name="id" value={dossier.id} />
                                      <input type="hidden" name="statut" value="Mise en demeure" />
                                      <button type="submit" className="bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold px-2 py-1 rounded">⚠️ Injonction</button>
                                    </form>
                                  )}
                                  <form action={changerStatutRapide}>
                                    <input type="hidden" name="id" value={dossier.id} />
                                    <input type="hidden" name="statut" value="Clôturé" />
                                    <button type="submit" className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-1 rounded">✓ Clore</button>
                                  </form>
                                </>
                              )}
                              <form action={supprimerDossier} onSubmit={(e) => { if(!confirm("Supprimer ce dossier ?")) e.preventDefault(); }}>
                                <input type="hidden" name="id" value={dossier.id} />
                                <button type="submit" className="text-slate-300 hover:text-red-600 opacity-0 group-hover/row:opacity-100 text-xs ml-1">🗑️</button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">Aucun dossier ne correspond aux filtres appliqués.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}