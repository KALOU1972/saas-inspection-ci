"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CompanyFormData {
  name: string;
  rccm: string;
  cc: string; 
  cnpsNumber: string;
  sectorId: string; 
  subPrefectureId: string; 
  contactPerson: string;
  phoneNumber: string;
  employeeCount: number;
}

const initialFormState: CompanyFormData = {
  name: "",
  rccm: "",
  cc: "",
  cnpsNumber: "",
  sectorId: "", 
  subPrefectureId: "",
  contactPerson: "",
  phoneNumber: "",
  employeeCount: 0,
};

export default function CompanyForm() {
  const [formData, setFormData] = useState<CompanyFormData>(initialFormState);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [allSubPrefectures, setAllSubPrefectures] = useState<{ id: string; name: string; department_id: string }[]>([]);
  const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ÉTAT CRUCIAL : Permet d'éviter le décalage SSR / Client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Le composant est maintenant chargé côté client

    async function loadInitialData() {
      const { data: depts } = await supabase.from("departments").select("*").order("name");
      const { data: subs } = await supabase.from("sub_prefectures").select("*").order("name");
      const { data: sects } = await supabase.from("sectors").select("*").order("name");
      
      if (depts) setDepartments(depts);
      if (subs) setAllSubPrefectures(subs);
      if (sects) setSectors(sects);

      if (depts && depts.length === 1) {
        const uniqueDeptId = depts[0].id;
        setSelectedDeptId(uniqueDeptId);

        if (subs) {
          const linkedSubs = subs.filter(sub => sub.department_id === uniqueDeptId);
          if (linkedSubs.length === 1) {
            setFormData(prev => ({ ...prev, subPrefectureId: linkedSubs[0].id }));
          }
        }
      }
    }
    loadInitialData();
  }, []);

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const filteredSubs = allSubPrefectures.filter(sub => sub.department_id === deptId);
    
    if (filteredSubs.length === 1) {
      setFormData(prev => ({ ...prev, subPrefectureId: filteredSubs[0].id }));
    } else {
      setFormData(prev => ({ ...prev, subPrefectureId: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const { error } = await supabase.from("companies").insert([
        {
          name: formData.name,
          rccm: formData.rccm,
          cc: formData.cc,
          cnps_number: formData.cnpsNumber,
          sector_id: formData.sectorId,         
          sub_prefecture_id: formData.subPrefectureId, 
          contact_person: formData.contactPerson,
          phone_number: formData.phoneNumber,
          employee_count: formData.employeeCount,
        },
      ]);

      if (error) throw error;

      setNotification({
        type: "success",
        message: `L'établissement "${formData.name}" a été enregistré avec succès au registre.`,
      });
      
      setFormData(initialFormState);
      
      if (departments.length === 1) {
        setSelectedDeptId(departments[0].id);
        const linkedSubs = allSubPrefectures.filter(sub => sub.department_id === departments[0].id);
        if (linkedSubs.length === 1) {
          setFormData(prev => ({ ...prev, subPrefectureId: linkedSubs[0].id }));
        }
      } else {
        setSelectedDeptId(""); 
      }

    } catch (error: any) {
      console.error("Erreur Supabase lors de l'insertion :", error);
      setNotification({
        type: "error",
        message: error.message || "Une erreur est survenue lors de l'enregistrement.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "employeeCount" ? parseInt(value) || 0 : value,
    }));
  };

  // Si le composant n'est pas encore monté sur le client, on affiche un squelette neutre pour le SSR
  if (!mounted) {
    return <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-slate-100 h-[500px] animate-pulse" />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-slate-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Enregistrer une Nouvelle Entreprise</h2>
        <p className="text-sm text-slate-500">Ajouter un établissement au registre territorial de l'inspection.</p>
      </div>

      {notification && (
        <div className={`mb-5 p-4 rounded-lg text-sm font-medium ${notification.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section Identité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Raison Sociale / Nom</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              placeholder="Ex: Coopérative Agricole ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Secteur d'Activité</label>
            <select
              name="sectorId"
              required
              value={formData.sectorId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
            >
              <option value="">-- Choisir un secteur d'activité --</option>
              {sectors.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Registres légaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">N° RCCM</label>
            <input
              type="text"
              name="rccm"
              required
              value={formData.rccm}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              placeholder="Ex: CI-ABJ-01-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">N° Compte Contribuable (CC)</label>
            <input
              type="text"
              name="cc"
              value={formData.cc}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              placeholder="Ex: 0123456 X"
            />
          </div>
        </div>

        {/* Section CNPS et Effectifs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">N° CNPS</label>
            <input
              type="text"
              name="cnpsNumber"
              value={formData.cnpsNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              placeholder="Ex: 123456-A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre total de salariés</label>
            <input
              type="number"
              name="employeeCount"
              min="0"
              value={formData.employeeCount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
        </div>

        {/* Section Localisation Dynamique & Automatisée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
            <select
              value={selectedDeptId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
            >
              <option value="">-- Choisir un département --</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sous-Préfecture</label>
            <select
              name="subPrefectureId"
              required
              value={formData.subPrefectureId}
              onChange={handleChange}
              disabled={selectedDeptId === ""}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white disabled:opacity-50"
            >
              <option value="">-- Choisir une sous-préfecture --</option>
              {allSubPrefectures
                .filter(sub => sub.department_id === selectedDeptId)
                .map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du Responsable / RH</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              placeholder="Nom et prénoms"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de Téléphone</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
              placeholder="Ex: +225 07 ..."
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 flex justify-center items-center"
          >
            {loading && <span className="inline-block animate-spin mr-2 border-2 border-white border-t-transparent rounded-full h-4 w-4"></span>}
            Enregistrer l'Établissement
          </button>
        </div>
      </form>
    </div>
  );
}