"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface Sector {
  id: string;
  name: string;
}

export default function SectorManager() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorName, setSectorName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    const { data } = await supabase.from("sectors").select("*").order("name");
    if (data) setSectors(data);
  };

  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorName.trim()) return;
    const { error } = await supabase.from("sectors").insert([{ name: sectorName.trim() }]);
    if (!error) {
      setSectorName("");
      fetchSectors();
    }
  };

  const handleUpdateSector = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase.from("sectors").update({ name: editingName.trim() }).eq("id", id);
    if (!error) {
      setEditingId(null);
      fetchSectors();
    }
  };

  const handleDeleteSector = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce secteur d'activité ? Cela impactera les entreprises liées.")) {
      await supabase.from("sectors").delete().eq("id", id);
      fetchSectors();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-slate-100 space-y-4">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Gestion des Secteurs d'Activité</h3>
      
      <form onSubmit={handleAddSector} className="flex gap-2">
        <input
          type="text"
          placeholder="Ex: Mines & Énergie, Agro-industrie..."
          value={sectorName}
          onChange={(e) => setSectorName(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
          Ajouter
        </button>
      </form>

      <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {sectors.map((sector) => (
          <li key={sector.id} className="flex items-center justify-between p-2.5 rounded-lg text-sm bg-slate-50 border border-slate-200">
            {editingId === sector.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="px-2 py-1 border rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <span className="text-slate-700 font-medium">{sector.name}</span>
            )}

            <div className="flex gap-2">
              {editingId === sector.id ? (
                <button onClick={() => handleUpdateSector(sector.id)} className="text-emerald-600 text-xs font-bold px-2 py-1 bg-emerald-50 rounded border border-emerald-200">OK</button>
              ) : (
                <button onClick={() => { setEditingId(sector.id); setEditingName(sector.name); }} className="text-slate-500 text-xs px-2 py-1 bg-white rounded border border-slate-200 hover:bg-slate-100">Modifier</button>
              )}
              <button onClick={() => handleDeleteSector(sector.id)} className="text-rose-600 text-xs px-2 py-1 bg-rose-50 rounded border border-rose-100 hover:bg-rose-100">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}