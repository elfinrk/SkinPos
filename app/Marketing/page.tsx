"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Tag, Gift, Users, BarChart3, LogOut, CheckCircle2, 
  Plus, Search, Megaphone, Trash2, Percent, Sparkles, Info, XCircle
} from "lucide-react";

import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// Database Dummy Promo
const INITIAL_PROMOS = [
  { id: "PRM-01", name: "Ramadan Glow Up", type: "Discount", value: "20%", status: "Active", usage: 45 },
  { id: "BND-01", name: "Acne Clear Bundle", type: "Package", value: "Special Price", status: "Active", usage: 12 },
];

export default function MarketingDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"promo" | "analytics" | "customers">("promo");
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error', title: string, subtitle: string} | null>(null);

  // Form State Promo Baru
  const [newPromo, setNewPromo] = useState({ name: "", type: "Discount", value: "" });

  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const role = sessionStorage.getItem("userRole");
    if (isAuth !== "true" || role !== "marketing") {
      router.replace("/"); 
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const showToast = (type: 'success' | 'error', title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const id = (newPromo.type === "Discount" ? "PRM-" : "BND-") + Math.floor(Math.random() * 100);
    setPromos([{ ...newPromo, id, status: "Active", usage: 0 }, ...promos]);
    setNewPromo({ name: "", type: "Discount", value: "" });
    showToast("success", "Promo Diterbitkan", "Promo baru kini tersedia di sistem kasir.");
  };

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#FDFBFB] font-sans text-slate-700 overflow-hidden ${montserrat.className}`}>
      
      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] w-[380px] shadow-2xl border border-pink-50 text-center animate-in zoom-in-95">
             <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6"><LogOut size={32} className="text-rose-400" /></div>
             <h2 className="text-xl font-bold mb-2 text-slate-800">Akhiri Sesi?</h2>
             <p className="text-sm text-slate-500 mb-8">Anda akan keluar dari sistem Marketing.</p>
             <div className="flex gap-3">
               <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3.5 rounded-2xl font-semibold bg-slate-100 text-slate-500">Batal</button>
               <button onClick={() => { sessionStorage.clear(); router.push("/"); }} className="flex-1 py-3.5 rounded-2xl font-semibold bg-rose-500 text-white shadow-lg shadow-rose-200">Keluar</button>
             </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[500] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-xl border border-pink-50 flex items-center gap-4 min-w-[320px]">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>{toast.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}</div>
            <div><h4 className="font-bold text-slate-800 text-sm">{toast.title}</h4><p className="text-xs text-slate-400 mt-0.5">{toast.subtitle}</p></div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-72 bg-white flex flex-col h-full border-r border-pink-50 z-20 shadow-[4px_0_24px_rgba(252,165,165,0.1)]">
        <div className="p-8 border-b border-pink-50 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-400 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-pink-100 mb-4">M</div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Marketing Portal</h1>
          <p className="text-[10px] font-bold text-pink-400 mt-1 uppercase tracking-widest leading-relaxed">Promo & Campaign<br/>Management</p>
        </div>
        <div className="flex-1 py-6 space-y-1.5 px-6 overflow-y-auto">
          {[
            { id: "promo", icon: Tag, label: "Promo & Bundling" },
            { id: "analytics", icon: BarChart3, label: "Performa Promo" },
            { id: "customers", icon: Users, label: "Database Pasien" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-pink-50 text-pink-600 shadow-sm border border-pink-100" : "text-slate-400 hover:text-pink-500 hover:bg-pink-50/30"}`}>
              <div className="flex items-center gap-3"><tab.icon size={20} /> {tab.label}</div>
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-pink-50 bg-white">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex justify-center items-center gap-2 bg-white border border-slate-100 text-slate-400 py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:text-rose-50 hover:border-rose-200 transition-all"><LogOut size={16} /> Keluar</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#FDFBFB]">
        <div className="flex justify-between items-end mb-10 pb-6 border-b border-pink-100">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Marketing Central</h2>
            <p className="text-slate-500 font-medium mt-2">Kelola strategi promosi dan loyalitas pelanggan Klinik Rosereve Japan.</p>
          </div>
        </div>

        {/* --- TAB PROMO & BUNDLING --- */}
        {activeTab === "promo" && (
          <div className="flex gap-10 animate-in fade-in duration-300">
            <div className="w-[400px] shrink-0">
              <div className="bg-white p-8 rounded-[2rem] border border-white shadow-sm h-fit">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Plus size={20} className="text-pink-500" /> Buat Promo Baru</h3>
                <form onSubmit={handleAddPromo} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Nama Promo/Paket</label>
                    <input type="text" value={newPromo.name} onChange={(e)=>setNewPromo({...newPromo, name: e.target.value})} placeholder="Contoh: Paket Glowing Ramadan" className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-pink-300 font-semibold" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Tipe Promosi</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl border">
                      <button type="button" onClick={()=>setNewPromo({...newPromo, type: "Discount"})} className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${newPromo.type === "Discount" ? "bg-white text-pink-600 shadow-sm" : "text-slate-400"}`}>Diskon %</button>
                      <button type="button" onClick={()=>setNewPromo({...newPromo, type: "Package"})} className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${newPromo.type === "Package" ? "bg-white text-pink-600 shadow-sm" : "text-slate-400"}`}>Paket/Bundle</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Nilai Diskon / Harga Paket</label>
                    <input type="text" value={newPromo.value} onChange={(e)=>setNewPromo({...newPromo, value: e.target.value})} placeholder="Contoh: 20% atau Rp 500.000" className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-pink-300 font-bold text-pink-600" required />
                  </div>
                  <button type="submit" className="w-full py-4.5 rounded-2xl font-bold bg-pink-600 text-white shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all uppercase text-[10px] tracking-widest">Terbitkan Promo</button>
                </form>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[2.5rem] border border-white shadow-sm overflow-hidden flex flex-col">
              <div className="p-7 border-b border-slate-50 bg-pink-50/20 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Megaphone size={18} className="text-pink-500" /> Promo Sedang Berjalan</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/90 backdrop-blur-sm sticky top-0"><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"><th className="p-6">Detail Promo</th><th className="p-6">Tipe</th><th className="p-6 text-center">Penggunaan</th><th className="p-6 text-right">Aksi</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {promos.map(p => (
                      <tr key={p.id} className="hover:bg-pink-50/10 transition-colors">
                        <td className="p-6">
                          <p className="text-sm font-bold text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-pink-500 font-bold">{p.id} • {p.value}</p>
                        </td>
                        <td className="p-6">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${p.type === 'Discount' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>{p.type}</span>
                        </td>
                        <td className="p-6 text-center">
                          <p className="text-sm font-black text-slate-700">{p.usage}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Kali Terpakai</p>
                        </td>
                        <td className="p-6 text-right">
                          <button onClick={()=>setPromos(promos.filter(x => x.id !== p.id))} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB ANALYTICS (SUGGESTED FEATURE) --- */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-[2rem] border border-white shadow-sm flex flex-col items-center text-center">
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-3xl mb-6"><BarChart3 size={32}/></div>
              <h3 className="text-2xl font-black text-slate-800">85%</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Peningkatan Reservasi via Promo</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-white shadow-sm flex flex-col items-center text-center">
              <div className="p-4 bg-pink-50 text-pink-600 rounded-3xl mb-6"><Sparkles size={32}/></div>
              <h3 className="text-2xl font-black text-slate-800">Ramadan Glow</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Promo Paling Populer</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-white shadow-sm flex flex-col items-center text-center">
              <div className="p-4 bg-orange-50 text-orange-500 rounded-3xl mb-6"><Users size={32}/></div>
              <h3 className="text-2xl font-black text-slate-800">120+</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Pelanggan Baru Bulan Ini</p>
            </div>
          </div>
        )}

        {/* --- TAB CUSTOMERS --- */}
        {activeTab === "customers" && (
           <div className="bg-white rounded-[2.5rem] border border-white shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-8 text-center py-20 text-slate-300">
                <Users size={64} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold tracking-widest uppercase text-sm">Database Member Terintegrasi dengan Kasir</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}