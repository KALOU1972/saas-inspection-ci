"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface Department {
  id: string;
  name: string;
}

interface SubPrefecture {
  id: string;
  name: string;
  department_id: string;
}

export default function TerritoryManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subPrefectures, setSubPrefectures] = useState<SubPrefecture[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  // États pour les formulaires
  const [deptName, setDeptName] = useState("");
  const [subPrefName, setSubPrefName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: depts } = await supabase.from("departments").select("*").order("name");
    const { data: subs } = await supabase.from("sub_prefectures").select("*").order("name");
    if (depts) setDepartments(depts);
    if (subs) setSubPrefectures(subs);
  };

  // --- ACTIONS DÉPARTEMENT ---
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    const { error } = await supabase.from("departments").insert([{ name: deptName.trim() }]);
    if (!error) { setDeptName(""); fetchData(); }
  };

  const handleUpdateDept = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase.from("departments").update({ name: editingName.trim() }).eq("id", id);
    if (!error) { setEditingId(null); fetchData(); }
  };

  const handleDeleteDept = async (id: string) => {
    if (confirm("Supprimer ce département supprimera toutes ses sous-préfectures. Confirmer ?")) {
      await supabase.from("departments").delete().eq("id", id);
      fetchData();
    }
  };

  // --- ACTIONS SOUS-PRÉFECTURE ---
  const handleAddSubPref = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subPrefName.trim() || !selectedDeptId) return;
    const { error } = await supabase.from("sub_prefectures").insert([
      { name: subPrefName.trim(), department_id: selectedDeptId }
    ]);
    if (!error) { setSubPrefName(""); fetchData(); }
  };

  const handleUpdateSubPref = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase.from("sub_prefectures").update({ name: editingName.trim() }).eq("id", id);
    if (!error) { setEditingId(null); fetchData(); }
  };

  const handleDeleteSubPref = async (id: string) => {
    if (confirm("Voulez-vous supprimer cette sous-préfecture ?")) {
      await supabase.from("sub_prefectures").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* BLOC DEPARTEMENTS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Gestion des Départements</h3>
        
        <form onSubmit={handleAddDept} className="flex gap-2">
          <input
            type="text"
            placeholder="Nouveau département"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800"
          />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">Ajouter</button>
        </form>

        <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {departments.map((dept) => (
            <li key={dept.id} className={`flex items-center justify-between p-2 rounded-lg text-sm border ${selectedDeptId === dept.id ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`}>
              {editingId === dept.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="px-2 py-0.5 border rounded text-slate-800"
                />
              ) : (
                <span onClick={() => setSelectedDeptId(dept.id)} className="cursor-pointer font-medium text-slate-700 flex-1">{dept.name}</span>
              )}

              <div className="flex gap-1 ml-2">
                {editingId === dept.id ? (
                  <button onClick={() => handleUpdateDept(dept.id)} className="text-emerald-600 text-xs font-bold px-1">OK</button>
                ) : (
                  <button onClick={() => { setEditingId(dept.id); setEditingName(dept.name); }} className="text-slate-500 text-xs px-1">Modifier</button>
                )}
                <button onClick={() => handleDeleteDept(dept.id)} className="text-rose-600 text-xs px-1">Suppr.</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* BLOC SOUS-PREFECTURES */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
          Sous-Préfectures {selectedDeptId ? `(${departments.find(d => d.id === selectedDeptId)?.name})` : ""}
        </h3>

        {selectedDeptId ? (
          <form onSubmit={handleAddSubPref} className="flex gap-2">
            <input
              type="text"
              placeholder="Nouvelle sous-préfecture"
              value={subPrefName}
              onChange={(e) => setSubPrefName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800"
            />
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700">Ajouter</button>
          </form>
        ) : (
          <p className="text-xs text-slate-400 bg-amber-50 p-2 rounded border border-amber-100">Sélectionnez un département à gauche pour lui ajouter des sous-préfectures.</p>
        )}

        <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {subPrefectures
            .filter((sub) => sub.department_id === selectedDeptId)
            .map((sub) => (
              <li key={sub.id} className="flex items-center justify-between p-2 rounded-lg text-sm bg-slate-50 border border-slate-200">
                {editingId === sub.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="px-2 py-0.5 border rounded text-slate-800"
                  />
                ) : (
                  <span className="text-slate-700">{sub.name}</span>
                )}

                <div className="flex gap-1">
                  {editingId === sub.id ? (
                    <button onClick={() => handleUpdateSubPref(sub.id)} className="text-emerald-600 text-xs font-bold px-1">OK</button>
                  ) : (
                    <button onClick={() => { setEditingId(sub.id); setEditingName(sub.name); }} className="text-slate-500 text-xs px-1">Modifier</button>
                  )}
                  <button onClick={() => handleDeleteSubPref(sub.id)} className="text-rose-600 text-xs px-1">Suppr.</button>
                </div>
              </li>
            ))}
        </ul>
      </div>

    </div>
  );
}