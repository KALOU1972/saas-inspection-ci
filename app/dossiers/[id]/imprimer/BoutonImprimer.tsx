'use client';

export default function BoutonImprimer() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
    >
      🖨️ Imprimer / Enregistrer en PDF
    </button>
  );
}