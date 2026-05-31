import { supabase } from '../../../lib/supabase';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function DossierDetailPage({ params }: PageProps) {
  // Gestion de la compatibilité Promise des params (Next.js 14/15)
  const resolvedParams = await params;
  const dossierId = parseInt(resolvedParams.id, 10);

  if (isNaN(dossierId)) return notFound();

  // 1. Récupération du dossier avec toutes ses jointures
  const { data: dossier, error } = await supabase
    .from('dossiers_controle')
    .select(`
      *,
      entreprises (*),
      agents_controle (*)
    `)
    .eq('id', dossierId)
    .single();

  if (error || !dossier) {
    console.error("Erreur récupération dossier :", error?.message);
    return notFound();
  }

  // --- ACTION SERVEUR : ENREGISTRER LE RAPPORT & EVOLUTION STATUT ---
  async function mettreAJourDossier(formData: FormData) {
    'use server';
    const statut = formData.get('statut') as string;
    const rapport_observations = formData.get('rapport_observations') as string;

    const { error: updateError } = await supabase
      .from('dossiers_controle')
      .update({
        statut,
        // Si votre colonne s'appelle différemment, ajustez le nom ici
        rapport_observations: rapport_observations || null, 
      })
      .eq('id', dossierId);

    if (updateError) {
      console.error("Erreur mise à jour dossier :", updateError.message);
    } else {
      revalidatePath(`/dossiers/${dossierId}`);
      revalidatePath('/dossiers');
    }
  }

  // Couleurs dynamiques selon le statut de l'inspection
  const getStatutStyle = (statut: string) => {
    switch (statut) {
      case 'En cours': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rapport rédigé': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Mise en demeure': return 'bg-red-100 text-red-800 border-red-200';
      case 'Clôturé': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Fil d'Ariane & Retour */}
        <nav className="flex items-center space-x-2 text-xs md:text-sm text-slate-500">
          <Link href="/dossiers" className="hover:text-blue-600 transition-colors">📂 Liste des visites</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium font-mono">Dossier #{dossier.id}</span>
        </nav>

        {/* En-tête du Dossier */}
        <header className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatutStyle(dossier.statut)}`}>
                • {dossier.statut}
              </span>
              <span className="text-xs font-mono text-slate-400">Créé le {new Date(dossier.date_visite).toLocaleDateString('fr-FR')}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              {dossier.type_visite}
            </h1>
            <p className="text-slate-500 text-sm">Contrôle territorial de l'Inspection du Travail</p>
          </div>
          
          <Link href="/dossiers" className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors w-full md:w-auto text-center">
            ← Revenir au tableau global
          </Link>
        </header>

        {/* Corps de la page : Grid 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLONNE GAUCHE (1/3) : LES ACTEURS (ENTREPRISE & AGENT) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Carte Entreprise */}
            <div className="bg-white p-5 rounded-xl shadow-sm border space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1.5">🏢 Entreprise inspectée</h2>
              {dossier.entreprises ? (
                <div>
                  <div className="font-bold text-slate-900 text-base">{dossier.entreprises.raison_sociale}</div>
                  <div className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mt-1">
                    NCC: {dossier.entreprises.ncc}
                  </div>
                  
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2"><span>📍 Ville :</span> <span className="font-medium text-slate-800">{dossier.entreprises.ville || 'Non spécifiée'}</span></div>
                    {/* Ajoutez ici d'autres colonnes de votre table entreprise si nécessaire (adresse, secteur, etc.) */}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-500 italic">Données de l'entreprise introuvables</p>
              )}
            </div>

            {/* Carte Agent Assigné */}
            <div className="bg-white p-5 rounded-xl shadow-sm border space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-1.5">👮 Agent verbalisateur</h2>
              {dossier.agents_controle ? (
                <div className="flex items-start space-x-3">
                  {dossier.agents_controle.photo_url ? (
                    <img src={dossier.agents_controle.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border uppercase">
                      {dossier.agents_controle.nom_prenoms.charAt(0)}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-sm">{dossier.agents_controle.nom_prenoms}</div>
                    <div className="text-xs text-slate-400 font-mono">Mle: {dossier.agents_controle.matricule}</div>
                    <div className="text-xs text-blue-700 font-semibold mt-1">{dossier.agents_controle.emploi} ({dossier.agents_controle.grade})</div>
                    {dossier.agents_controle.fonction && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-1 rounded border border-dashed mt-1">
                        💼 {dossier.agents_controle.fonction}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Aucun agent assigné à ce dossier.</p>
              )}
            </div>

          </div>

          {/* COLONNE DROITE (2/3) : EDITION DU RAPPORT DE CONTRÔLE */}
          <div className="lg:col-span-2">
            <Link 
            href={`/dossiers/${dossier.id}/imprimer`}
            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
            >
            🖨️ Générer le PV Officiel
            </Link>
            <form action={mettreAJourDossier} className="bg-white p-6 rounded-xl shadow-sm border space-y-5">
              
              <div className="border-b pb-2 flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900">📝 Procès-Verbal & Observations de terrain</h2>
                <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">Sauvegarde manuelle</span>
              </div>

              {/* Sélection du statut juridique */}
              <div className="w-full md:w-1/2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Étape / Statut du Dossier</label>
                <select 
                  name="statut" 
                  defaultValue={dossier.statut} 
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="En cours">En cours (Investigation sur site)</option>
                  <option value="Rapport rédigé">Rapport rédigé (Constatations faites)</option>
                  <option value="Mise en demeure">Mise en demeure (Injonction administrative)</option>
                  <option value="Clôturé">Clôturé (Régularisé / Classé)</option>
                </select>
              </div>

              {/* Zone d'écriture du rapport */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">Observations et Infractions constatées</label>
                <p className="text-xs text-slate-400 mb-2">Notez ici les manquements relevés (ex: Déclaration CNPS, registres d'entreprise, hygiène et sécurité, contrats de travail...).</p>
                <textarea
                  name="rapport_observations"
                  defaultValue={dossier.rapport_observations || ''}
                  rows={12}
                  placeholder="Rédigez le contenu du procès-verbal ou du rapport ici..."
                  className="w-full p-4 border rounded-lg text-sm font-sans bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-slate-400 leading-relaxed shadow-inner"
                />
              </div>

              {/* Bouton de validation */}
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm active:scale-95 transform"
                >
                  Enregistrer les modifications
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </main>
  );
}