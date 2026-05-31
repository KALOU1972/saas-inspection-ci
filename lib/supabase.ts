import { createClient } from '@supabase/supabase-js';

// Plan de secours : On écrit directement les clés ici pour débloquer l'application
const supabaseUrl = "https://dkaxhrpaloaroiupjhky.supabase.co"; // <-- Mettez votre URL Supabase ici
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrYXhocnBhbG9hcm9pdXBqaGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMjQyNTAsImV4cCI6MjA5NTgwMDI1MH0.M4kx8pNfobS9z507wBAayfbgbpf18vZDYv-Vxv67xlw";     // <-- Mettez votre clé Anon ici

export const supabase = createClient(supabaseUrl, supabaseAnonKey);