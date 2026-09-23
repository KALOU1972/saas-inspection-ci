import { createClient } from '@supabase/supabase-js';

// Client Supabase partagé par toute l'application (une seule instance).
// Priorité aux variables d'environnement ; à défaut, plan de secours :
// clés de développement écrites directement pour débloquer l'application.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://dkaxhrpaloaroiupjhky.supabase.co"; // <-- URL Supabase de secours
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrYXhocnBhbG9hcm9pdXBqaGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMjQyNTAsImV4cCI6MjA5NTgwMDI1MH0.M4kx8pNfobS9z507wBAayfbgbpf18vZDYv-Vxv67xlw"; // <-- Clé Anon de secours

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
