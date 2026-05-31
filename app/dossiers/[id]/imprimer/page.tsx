import { supabase } from '../../../../lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BoutonImprimer from './BoutonImprimer'; // Import du bouton client qu'on va créer

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ImprimerDossierPage({ params }: PageProps) {
  const { id } = await params;
  const dossierId = parseInt(id, 10);

  if (isNaN(dossierId)) return notFound();

  // Récupération des données complètes pour le rapport
  const { data: dossier, error } = await supabase
    .from('dossiers_controle')
    .select(`
      *,
      entreprises(raison_sociale, ncc, ville, adresse, telephone),
      agents_controle(nom_prenoms, emploi, fonction, matricule)
    `)
    .eq('id', dossierId)
    .single();

  if (error || !dossier) return notFound();

  return (
    <div className="min-h-screen bg-slate-100 p-0 sm:p-8 print:bg-white print:p-0">
      
      {/* Zone de contrôle / Navigation - Cachée à l'impression */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between print:hidden">
        <Link href={`/dossiers/${dossierId}`} className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1">
          ⬅️ Retour au dossier
        </Link>
        
        {/* Utilisation du bouton isolé côté client */}
        <BoutonImprimer />
      </div>

      {/* Feuille A4 Officielle */}
      <article className="max-w-4xl mx-auto bg-white p-12 shadow-md border rounded-sm print:shadow-none print:border-none print:p-4 font-serif text-slate-900 text-sm leading-relaxed">
        
        {/* En-tête Administratif */}
        <div className="grid grid-cols-2 gap-4 text-center border-b-2 border-slate-900 pb-6 mb-8">
          <div className="space-y-1">
            <h2 className="font-bold uppercase tracking-wide text-xs">République de Côte d'Ivoire</h2>
            <p className="text-[11px] italic font-sans">Union - Discipline - Travail</p>
            <div className="pt-2 border-t border-dashed w-24 mx-auto"></div>
            <p className="text-[11px] font-sans font-bold uppercase text-slate-600">Ministère de l'Emploi<br />et de la Protection Sociale</p>
            <p className="text-[10px] font-sans uppercase">Inspection Générale du Travail</p>
          </div>
          
          <div className="text-xs font-sans space-y-1 text-right flex flex-col justify-between">
            <div>
              <p className="font-bold">Réf : MEPS/IGT/N° {dossier.id}-{new Date(dossier.date_visite).getFullYear()}</p>
              <p className="text-[11px] text-slate-500">Date d'édition : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="text-[11px] text-slate-700 italic">
              Fait à {dossier.entreprises?.ville || "...................."}, le {new Date(dossier.date_visite).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Titre du document */}
        <div className="text-center my-8">
          <h1 className="text-xl font-black uppercase tracking-wider underline underline-offset-4">
            Rapport de Visite d'Inspection
          </h1>
          <p className="text-xs font-sans font-bold text-slate-500 mt-1 uppercase">Cadre : {dossier.type_visite}</p>
        </div>

        {/* Section 1 : L'autorité d'inspection */}
        <section className="space-y-2 mb-6">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-slate-500 border-b pb-1">1. Inspecteur Assermenté</h3>
          <p>
            Nous soussigné(e), <strong className="font-sans">{dossier.agents_controle?.nom_prenoms || ".................................................."}</strong>, 
            {dossier.agents_controle?.emploi} à l'Inspection du Travail, agissant en vertu des pouvoirs qui nous sont conférés par le Code du Travail de la République de Côte d'Ivoire, avons procédé ce jour à une visite de contrôle au sein de l'établissement désigné ci-après.
          </p>
        </section>

        {/* Section 2 : L'Établissement */}
        <section className="space-y-3 mb-6">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-slate-500 border-b pb-1">2. Identification de l'Établissement</h3>
          <table className="w-full border-collapse text-xs font-sans">
            <tbody>
              <tr className="border-b"><td className="py-2 font-bold w-1/3">Raison Sociale :</td><td className="py-2 text-sm font-serif">{dossier.entreprises?.raison_sociale}</td></tr>
              <tr className="border-b"><td className="py-2 font-bold">Numéro de Compte Contribuable (NCC) :</td><td className="py-2 font-mono">{dossier.entreprises?.ncc || "Non renseigné"}</td></tr>
              <tr className="border-b"><td className="py-2 font-bold">Adresse / Localisation :</td><td className="py-2">{dossier.entreprises?.adresse || "N/A"}, {dossier.entreprises?.ville}</td></tr>
              <tr className="border-b"><td className="py-2 font-bold">Téléphone de l'employeur :</td><td className="py-2">{dossier.entreprises?.telephone || "...................................."}</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 3 : Constatations */}
        <section className="space-y-2 mb-6 break-inside-avoid">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-slate-500 border-b pb-1">3. Constatations et Situations Observées</h3>
          <div className="p-4 bg-slate-50 border rounded-lg min-h-[120px] print:bg-white print:p-0 print:border-none font-serif text-sm whitespace-pre-wrap">
            {dossier.observations || "Aucune observation manuscrite consignée dans ce rapport."}
          </div>
        </section>

        {/* Section 4 : Infractions */}
        <section className="space-y-2 mb-8 break-inside-avoid">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-red-600 border-b border-red-200 pb-1">4. Infractions Relevées / Manquements au Code du Travail</h3>
          <div className="p-4 bg-red-50/30 border border-red-100 rounded-lg min-h-[80px] print:bg-white print:p-0 print:border-none font-mono text-xs text-red-900 whitespace-pre-wrap">
            {dossier.infractions_constatees || "Aucune infraction relevée à la date de la présente visite."}
          </div>
        </section>

        {/* Section 5 : Conclusion & Décision */}
        <section className="space-y-1 mb-12 font-sans text-xs">
          <p><span className="font-bold uppercase">Statut final de la procédure :</span> <span className="underline font-bold font-serif text-sm">{dossier.statut}</span></p>
          {dossier.statut === 'Mise en demeure' && (
            <p className="text-red-700 font-bold italic">⚠️ Cet acte vaut notification formelle d'une mise en demeure de conformité assortie des délais légaux.</p>
          )}
        </section>

        {/* Blocs de signatures */}
        <div className="grid grid-cols-2 gap-12 text-center text-xs font-sans mt-16 break-inside-avoid">
          <div>
            <p className="font-bold underline uppercase mb-16">Le Représentant de l'Entreprise</p>
            <p className="text-slate-400 text-[10px] italic">(Nom, Signature précédée de "Lu et approuvé" et Cachet)</p>
          </div>
          <div>
            <p className="font-bold underline uppercase mb-16">L'Inspecteur du Travail</p>
            <p className="font-bold text-slate-900">{dossier.agents_controle?.nom_prenoms || "L'Inspecteur"}</p>
            <p className="text-slate-500 text-[10px]">{dossier.agents_controle?.fonction || "Contrôleur assermenté"}</p>
          </div>
        </div>

      </article>

      {/* Style CSS injecté pour l'impression */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background-color: #fff !important; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}} />
    </div>
  );
}