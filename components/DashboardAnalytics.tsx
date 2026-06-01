"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function DashboardAnalytics() {
  const [statutData, setStatutData] = useState<any[]>([]);
  const [secteurData, setSecteurData] = useState<any[]>([]);
  const [tauxConciliation, setTauxConciliation] = useState<number>(0);

  const calculateStats = async () => {
    // 1. Récupérer tous les litiges avec le secteur de l'établissement rattaché
    const { data: litiges } = await supabase
      .from("litiges")
      .select("statut, etablissements(secteur)");

    if (!litiges) return;

    // 2. Traitement des données par Statut
    const statutsCount = litiges.reduce((acc: any, curr: any) => {
      acc[curr.statut] = (acc[curr.statut] || 0) + 1;
      return acc;
    }, {});

    const formattedStatut = Object.keys(statutsCount).map(key => ({
      name: key,
      value: statutsCount[key]
    }));
    setStatutData(formattedStatut);

    // Calc du taux de réussite (Concilié / (Concilié + Non concilié))
    const concilies = statutsCount["Concilié"] || 0;
    const nonConcilies = statutsCount["Non concilié"] || 0;
    const totalClos = concilies + nonConcilies;
    setTauxConciliation(totalClos > 0 ? Math.round((concilies / totalClos) * 100) : 0);

    // 3. Traitement des données par Secteur d'activité
    const secteursCount = litiges.reduce((acc: any, curr: any) => {
      const sectNom = curr.etablissements?.secteur || "Non spécifié";
      acc[sectNom] = (acc[sectNom] || 0) + 1;
      return acc;
    }, {});

    const formattedSecteur = Object.keys(secteursCount).map(key => ({
      secteur: key,
      "Nombre de conflits": secteursCount[key]
    })).sort((a, b) => b["Nombre de conflits"] - a["Nombre de conflits"]).slice(0, 5); // Top 5
    
    setSecteurData(formattedSecteur);
  };

  useEffect(() => {
    calculateStats();

    // Re-calculer les stats en temps réel si un dossier change de statut
    const channel = supabase
      .channel("analytics-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "litiges" }, () => {
        calculateStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Couleurs pour le graphique en camembert
  const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"]; // Amber, Blue, Emerald, Rose

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Carte KPI : Taux de conciliation */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Performance Régionale</span>
          <h4 className="text-2xl font-black mt-2">Taux de Conciliation</h4>
          <p className="text-xs text-slate-400 mt-1">Pourcentage de conflits résolus à l'amiable sans recours aux tribunaux.</p>
        </div>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-5xl font-black tracking-tight text-amber-400">{tauxConciliation}%</span>
          <span className="text-xs text-emerald-400 font-medium">des dossiers clos</span>
        </div>
        <div className="w-full bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
          <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${tauxConciliation}%` }}></div>
        </div>
      </div>

      {/* Graphique 1 : Volume par secteurs d'activité */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">🔥 Top Secteurs les plus Conflictuels</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={secteurData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="secteur" type="category" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} width={100} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="Nombre de conflits" fill="#0f172a" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique 2 : Répartition des statuts */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📊 État d'avancement des Recours Émis</h4>
        <div className="flex flex-col md:flex-row items-center justify-around">
          <div className="h-44 w-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {statutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-4 md:mt-0">
            {statutData.map((item, index) => (
              <div key={item.name} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="text-xs font-bold text-slate-500">{item.name}</div>
                <div className="text-2xl font-black mt-1" style={{ color: COLORS[index % COLORS.length] }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}