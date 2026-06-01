"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CompanyOption {
  id: string;
  name: string;
  sub_prefectures: {
    name: string;
  } | null; // Pour récupérer le nom de la sous-préfecture liée
}

interface DisputeFormData {
  companyId: string;
  plaintiffName: string;
  reason: string;
  customReason: string;
  details: string;
  claimAmount: number;
}

const initialFormState: DisputeFormData = {
  companyId: "",
  plaintiffName: "",
  reason: "Licenciement",
  customReason: "",
  details: "",
  claimAmount: 0,
};

export default function DisputeForm() {
  const [formData, setFormData] = useState<DisputeFormData>(initialFormState);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [reasonsList, setReasonsList] = useState<string[]>([
    "Licenciement",
    "Salaires",
    "Heures Supplémentaires",
    "Congés",
    "Accident"
  ]);

  useEffect(() => {
    async function loadCompaniesAndReasons() {
      try {
        // 1. CORRECTION : Jointure pour récupérer le nom de la sous-préfecture liée via son ID
        const { data: companiesData, error: compError } = await supabase
          .from("companies")
          .select(`
            id, 
            name, 
            sub_prefectures ( name )
          `)
          .order("name", { ascending: true });

        if (compError) throw compError;
        if (companiesData) setCompanies(companiesData as any);

        // 2. Charger dynamiquement les motifs existants
        const { data: disputesData, error: dispError } = await supabase
          .from("disputes")
          .select("reason");

        if (dispError) throw dispError;
        
        if (disputesData) {
          const uniqueExistingReasons = Array.from(new Set(disputesData.map(d => d.reason)));
          setReasonsList(prev => Array.from(new Set([...prev, ...uniqueExistingReasons])));
        }

      } catch (error) {
        console.error("Erreur lors du chargement initial :", error);
      } finally {
        setFetchingCompanies(false);
      }
    }
    loadCompaniesAndReasons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const finalReason = formData.reason === "AUTRE" ? formData.customReason.trim() : formData.reason;

    if (!finalReason) {
      setNotification({ type: "error", message: "Veuillez spécifier le motif du litige." });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from("disputes").insert([
        {
          company_id: formData.companyId,
          plaintiff_name: formData.plaintiffName,
          reason: finalReason,
          details: formData.details,
          claim_amount: formData.claimAmount,
          status: "OPEN",
        },
      ]);

      if (error) throw error;

      setNotification({
        type: "success",
        message: `Le litige initié par ${formData.plaintiffName} a été enregistré.`,
      });

      if (formData.reason === "AUTRE" && !reasonsList.includes(finalReason)) {
        setReasonsList(prev => [...prev, finalReason]);
      }

      setFormData(initialFormState);
    } catch (error: any) {
      console.error("Erreur Supabase:", error);
      setNotification({ type: "error", message: error.message || "Impossible d'enregistrer le litige." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "claimAmount" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-slate-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Ouvrir un Dossier de Litige</h2>
        <p className="text-sm text-slate-500">Enregistrer la plainte et synchroniser dynamiquement les motifs.</p>
      </div>

      {notification && (
        <div className={`mb-5 p-4 rounded-lg text-sm font-medium ${notification.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sélection Entreprise avec affichage de la sous-préfecture liée */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Entreprise mise en cause</label>
          <select
            name="companyId"
            required
            value={formData.companyId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
          >
            <option value="">-- Sélectionner l'établissement --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} {company.sub_prefectures ? `(${company.sub_prefectures.name})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Plaignant & Motif */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom & Prénoms du Plaignant</label>
            <input
              type="text"
              name="plaintiffName"
              required
              value={formData.plaintiffName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              placeholder="Ex: Kouamé Koffi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motif principal</label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
            >
              {reasonsList.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
              <option value="AUTRE" className="text-amber-600 font-bold">+ Ajouter un autre motif...</option>
            </select>
          </div>
        </div>

        {formData.reason === "AUTRE" && (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <label className="block text-sm font-medium text-amber-900 mb-1">Saisir le nouveau motif de plainte</label>
            <input
              type="text"
              name="customReason"
              required
              value={formData.customReason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg text-slate-800"
              placeholder="Ex: Non-respect du repos hebdomadaire"
            />
          </div>
        )}

        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Montant réclamé (FCFA)</label>
          <input
            type="number"
            name="claimAmount"
            value={formData.claimAmount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
          />
        </div>

        {/* Détails */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Détails et faits relatés</label>
          <textarea
            name="details"
            rows={3}
            value={formData.details}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            placeholder="Résumé des faits..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.companyId}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
        >
          Enregistrer et Ouvrir le Dossier
        </button>
      </form>
    </div>
  );
}