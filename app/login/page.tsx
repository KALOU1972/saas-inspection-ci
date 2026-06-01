"use client";

import { useRouter } from "next/navigation";
import LoginForm from "../../components/LoginForm"; // <-- Correction du chemin relatif (../../ au lieu de ../)

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginForm 
      onLoginSuccess={() => {
        // Rediriger automatiquement vers l'accueil après une connexion réussie
        router.push("/");
        router.refresh();
      }} 
    />
  );
}