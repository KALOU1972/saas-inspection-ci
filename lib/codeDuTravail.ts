export interface InfractionPredefinie {
  id: string;
  categorie: string;
  libelle: string;
  articles: string;
  textePv: string;
}

export const REFERENTIEL_INFRACTIONS: InfractionPredefinie[] = [
  {
    id: "inf-001",
    categorie: "📜 Contrats & Embauche",
    libelle: "Défaut de déclaration des travailleurs (CNPS)",
    articles: "Articles 3, 4 et suivants du Code du Travail / Législation de la Prévoyance Sociale",
    textePv: "Manquement constaté : Défaut d'immatriculation et de déclaration de l'ensemble du personnel à la Caisse Nationale de Prévoyance Sociale (CNPS)."
  },
  {
    id: "inf-002",
    categorie: "📜 Contrats & Embauche",
    libelle: "Absence de contrats de travail écrits (CDD)",
    articles: "Article 14.3 du Code du Travail",
    textePv: "Manquement constaté : Embauche de travailleurs sous contrat à durée déterminée (CDD) sans l'établissement d'un contrat écrit formalisé."
  },
  {
    id: "⏱️ Temps de travail & Rémunération",
    categorie: "⏱️ Temps de travail & Rémunération",
    libelle: "Dépassement de la durée légale du travail sans heures supplémentaires",
    articles: "Articles 22.1 et 22.2 du Code du Travail",
    textePv: "Manquement constaté : Constat d'exécution d'horaires au-delà de la durée légale hebdomadaire (40 heures) sans suivi, décompte, ni majoration de salaire au titre des heures supplémentaires."
  },
  {
    id: "inf-004",
    categorie: "⏱️ Temps de travail & Rémunération",
    libelle: "Non-respect du Salaire Minimum Interprofessionnel Garanti (SMIG)",
    articles: "Article 31.1 et suivants du Code du Travail",
    textePv: "Manquement constaté : Rémunération de certains agents à un taux inférieur au Salaire Minimum Interprofessionnel Garanti (SMIG) en vigueur."
  },
  {
    id: "🛡️ Santé, Hygiène & Sécurité",
    categorie: "🛡️ Santé, Hygiène & Sécurité",
    libelle: "Absence de Comité de Santé et Sécurité au Travail (CSST)",
    articles: "Article 42.1 du Code du Travail",
    textePv: "Manquement constaté : Défaut de constitution et de fonctionnement d'un Comité de Santé et de Sécurité au Travail (CSST) au sein de l'établissement, en dépit du franchissement du seuil d'effectif requis."
  },
  {
    id: "inf-006",
    categorie: "🛡️ Santé, Hygiène & Sécurité",
    libelle: "Défaut d'Équipements de Protection Individuelle (EPI)",
    articles: "Article 41.2 du Code du Travail",
    textePv: "Manquement constaté : Non-mise à disposition d'Équipements de Protection Individuelle (EPI) adaptés aux risques spécifiques des postes de travail identifiés (chaussures de sécurité, gants, casques, masques)."
  },
  {
    id: "📁 Registres Obligatoires",
    categorie: "📁 Registres Obligatoires",
    libelle: "Absence ou non-tenue du Registre d'Employeur",
    articles: "Article 92.1 du Code du Travail",
    textePv: "Manquement constaté : Absence de présentation ou défaut de tenue réglementaire du Registre d'Employeur (ex-Registre du Travail) obligatoire lors du contrôle."
  }
];