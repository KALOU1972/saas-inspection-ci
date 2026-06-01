const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); // Charge vos variables locales

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Erreur : Les variables d'environnement ne sont pas détectées dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testerConnexion() {
  console.log("🔄 Connexion à Supabase en cours...");
  
  // Tentative de lecture rapide sur une table système ou une de vos tables
  const { data, error } = await supabase
    .from('etablissements') // Remplacez par une de vos tables si nécessaire (ex: 'companies')
    .select('*')
    .limit(1);

  if (error) {
    console.error("❌ Échec de la connexion à la base de données :", error.message);
  } else {
    console.log("✅ Connexion réussie ! Vos identifiants Supabase sont parfaitement configurés.");
    console.log("Données reçues (test) :", data);
  }
}

testerConnexion();