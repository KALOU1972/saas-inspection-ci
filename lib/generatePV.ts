import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface LitigeData {
  id: string;
  demandeur: string;
  defendeur: string;
  objet: string;
  statut: string;
  date_audition?: string | null;
  etablissements?: {
    nom: string;
  } | null;
}

export const generatePV = (litige: LitigeData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- EN-TÊTE OFFICIEL (STYLE RÉPUBLIQUE) ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("REPUBLIQUE DE COTE D'IVOIRE", 15, 15);
  doc.setFont("helvetica", "oblique");
  doc.setFontSize(8);
  doc.text("Union - Discipline - Travail", 15, 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("MINISTERE DE L'EMPLOI ET DE LA PROTECTION SOCIALE", 110, 15, { align: "left" });
  doc.setFontSize(9);
  doc.text("DIRECTION GENERALE DU TRAVAIL (DGT)", 110, 20);
  doc.setFont("helvetica", "normal");
  doc.text("DIRECTION REGIONALE DE L'INSPECTION", 110, 25);

  // Ligne de séparation de l'en-tête
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  doc.line(15, 30, 195, 30);

  // --- TITRE DU DOCUMENT ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const titre = `PROCES-VERBAL DE CONCILIATION (${litige.statut.toUpperCase()})`;
  doc.text(titre, 105, 45, { align: "center" });

  // Références du dossier
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Dossier Ref : DGT-${litige.id.substring(0, 8).toUpperCase()}`, 15, 55);
  doc.text(`Date d'edition : ${new Date().toLocaleDateString("fr-FR")}`, 195, 55, { align: "right" });

  // --- FAITS ET PARTIES ---
  doc.setFont("helvetica", "bold");
  doc.text("1. IDENTIFICATION DES PARTIES", 15, 68);

  const tableData = [
    ['Employeur / Etablissement', litige.etablissements?.nom || 'Non renseigne'],
    ['Partie Demanderesse (Salarie)', litige.demandeur],
    ['Partie Defenderesse', litige.defendeur],
  ];

  // Injection du tableau via jspdf-autotable sans caractères spéciaux conflictuels dans les clés
  (doc as any).autoTable({
    startY: 72,
    head: [['Element', 'Informations']],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85] }, // Slate-700
    styles: { fontSize: 10, cellPadding: 3 },
  });

  // --- OBJET DU LITIGE ---
  const currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("2. OBJET DU LITIGE & RECLAMATIONS", 15, currentY);
  
  doc.setFont("helvetica", "normal");
  const splitObjet = doc.splitTextToSize(litige.objet, 180);
  doc.text(splitObjet, 15, currentY + 6);

  // --- CONCLUSION / STATUT ---
  const conclusionY = currentY + 12 + (splitObjet.length * 5);
  doc.setFont("helvetica", "bold");
  doc.text("3. CONCLUSION DE L'INSPECTION DU TRAVAIL", 15, conclusionY);

  doc.setFont("helvetica", "normal");
  let texteConclusion = "";
  if (litige.statut === "Concilié") {
    texteConclusion = "Apres audition des parties et examen des pieces justificatives, les parties ont trouve un accord amiable total. Le present proces-verbal vaut titre executoire concernant les engagements financiers et materiels pris ce jour.";
  } else if (litige.statut === "Non concilié") {
    texteConclusion = "Malgre les tentatives de mediation de l'Inspecteur du Travail, aucun accord n'a pu etre etabli entre les parties. Le dossier est clos au niveau de la Direction Generale du Travail et renvoye devant le Tribunal du Travail competent.";
  } else {
    texteConclusion = "Ce dossier est actuellement en cours d'instruction ou en attente d'une audition complementaire par nos services administratifs.";
  }

  const splitConclusion = doc.splitTextToSize(texteConclusion, 180);
  doc.text(splitConclusion, 15, conclusionY + 6);

  // --- ZONE DE SIGNATURES ---
  const signatureY = conclusionY + 15 + (splitConclusion.length * 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  
  doc.text("Le Demandeur\n(Signature)", 25, signatureY);
  doc.text("Le Defendeur\n(Signature)", 95, signatureY);
  doc.text("L'Inspecteur du Travail\n(Cachet & Signature)", 150, signatureY);

  // Sauvegarde automatique du fichier PDF personnalisé
  const nomFichier = `PV_${litige.statut}_${litige.demandeur.replace(/\s+/g, "_")}.pdf`;
  doc.save(nomFichier);
};