# 🏛️ DGT — Inspection du Travail

**Plateforme Territoriale de Gestion et de Suivi des Recours** — écosystème numérique de l'inspection du travail (Côte d'Ivoire) : dossiers d'entreprises, litiges & recours, contrôles de terrain, PV de manquement, et studio d'assistance IA « Prompt Stack 7 couches ».

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKALOU1972%2Fsaas-inspection-ci&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=dgt-inspection&repository-name=saas-inspection-ci)

> 💡 Le bouton ci-dessus clone le dépôt dans votre compte GitHub/Vercel et vous demande les 2 variables Supabase pendant l'assistant — aucun réglage manuel ensuite.

## ✨ Fonctionnalités

| Onglet | Contenu |
|--------|---------|
| 📈 Tableau de Bord | Statistiques et graphiques (recharts) |
| ⚖️ Litiges & Recours | Ouverture de dossiers, suivi, génération de PV (jsPDF) |
| 📆 Contrôles de Terrain | Planification et rapports de visites d'inspection |
| ⚙️ Établissements & Secteurs | Entreprises, secteurs d'activité, territoires |
| 🧠 Prompt Stack IA | Générateur de mega-prompt 7 couches pour assister une Direction Régionale du Travail (méthode : [`docs/prompt-stack-drt.md`](docs/prompt-stack-drt.md)) |

## 🚀 Démarrage local

```bash
npm install
cp .env.example .env.local   # renseigner les clés Supabase
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## 🔧 Variables d'environnement

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase (protégée par RLS) |

Un plan de secours (clés de développement) est intégré dans `lib/supabase.ts` si les variables sont absentes — à réserver au développement.

## ☁️ Déploiement sur Vercel

L'application est un Next.js standard, **prête pour Vercel sans configuration** (polices auto-hébergées, build vérifié).

### Option A — En un clic (recommandé)

Cliquer le bouton **Deploy** en haut de ce README et suivre l'assistant (connexion GitHub → nom du projet → valeurs Supabase → Deploy).

### Option B — Manuellement

1. Pousser le dépôt sur GitHub (déjà fait — voir la branche `main`) ;
2. Aller sur [vercel.com/new](https://vercel.com/new) et **se connecter avec GitHub** ;
3. **Importer** le dépôt `KALOU1972/saas-inspection-ci` ;
4. Dans **Environment Variables**, ajouter `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valeurs dans `.env.example`) ;
5. Cliquer **Deploy** — l'application est en ligne sur `https://<projet>.vercel.app`.

Chaque push sur `main` redéploie automatiquement ; chaque pull request génère un aperçu (preview) dédié.

## 🗄️ Base de données (Supabase)

Tables utilisées : `etablissements`, `sectors`, `departments`, `sub_prefectures`, `visites`, dossiers/litiges. Le référentiel des infractions (Code du travail : CNPS, SMIG, CSST, EPI, registres) est embarqué dans [`lib/codeDuTravail.ts`](lib/codeDuTravail.ts).

> ⚠️ Activer **Row Level Security** sur toutes les tables avant toute mise en production réelle.
