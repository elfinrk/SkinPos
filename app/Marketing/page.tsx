"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Tag, Users, BarChart3, LogOut, CheckCircle2, 
  Plus, Search, Megaphone, Trash2, Info, XCircle,
  TrendingDown, TrendingUp, Flame, Send, PackageOpen,
  PanelLeftClose, PanelLeftOpen, Sparkles
} from "lucide-react";

// --- MENGGUNAKAN FONT PLUS JAKARTA SANS (SAMA DENGAN KASIR/MANAGER) ---
import { Plus_Jakarta_Sans } from "next/font/google";
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"] 
});

// Database Dummy Promo Awal
const INITIAL_PROMOS = [
  { id: "PRM-01", name: "Ramadan Glow Up", type: "Discount", value: "20%", status: "Active", usage: 145 },
  { id: "BND-01", name: "Acne Clear Bundle", type: "Package", value: "Special Price", status: "Active", usage: 82 },
];

export default function MarketingDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "promo" | "broadcast">("analytics");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [inventory, setInventory] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', title: string, subtitle: string} | null>(null);

  // Form State Promo Baru
  const [newPromo, setNewPromo] = useState({ name: "", type: "Discount", value: "" });

  // CRM Campaign State
  const [broadcastSegment, setBroadcastSegment] = useState<"all" | "birthday">("all");
  const [campaignMessage, setCampaignMessage] = useState(
    "Halo [Nama], nikmati promo spesial [Promo] dari Esthetic Rosereve Japan khusus untuk Anda bulan ini! Hubungi kami untuk reservasi."
  );

  const getMemberSegmentBadge = (memberPhone: string) => {
    const completed = orders.filter(
      o => o.status === "completed" && o.member && o.member.phone === memberPhone
    );
    const count = completed.length;
    if (count >= 5) {
      return (
        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black border border-emerald-100 uppercase tracking-widest" title="Kunjungan >= 5 kali">
          Loyal (Setia)
        </span>
      );
    } else {
      return (
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black border border-blue-100 uppercase tracking-widest" title="Kunjungan < 5 kali">
          Baru / Biasa
        </span>
      );
    }
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const role = sessionStorage.getItem("userRole");
    if (isAuth !== "true" || role !== "marketing") {
      router.replace("/"); 
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Sinkronisasi Data Inventory, Member, & Promo dari Global Storage
  useEffect(() => {
    if (!isAuthorized) return;
    const syncData = () => {
      const savedInv = localStorage.getItem("skinpos_inventory");
      const savedMembers = localStorage.getItem("skinpos_members");
      const savedPromos = localStorage.getItem("skinpos_promos");
      const savedOrders = localStorage.getItem("skinpos_orders");
      if (savedInv) setInventory(JSON.parse(savedInv));
      if (savedMembers) setMembers(JSON.parse(savedMembers));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedPromos) {
        setPromos(JSON.parse(savedPromos));
      } else {
        localStorage.setItem("skinpos_promos", JSON.stringify(INITIAL_PROMOS));
        setPromos(INITIAL_PROMOS);
      }
    };
    syncData(); 
    const interval = setInterval(syncData, 2000); 
    window.addEventListener("storage", syncData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncData);
    };
  }, [isAuthorized]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newPromo.name || !newPromo.value) return showToast("error", "Data Tidak Lengkap", "Silakan isi semua field promo.");
    
    const id = (newPromo.type === "Discount" ? "PRM-" : "BND-") + Math.floor(100 + Math.random() * 900);
    const updated = [{ ...newPromo, id, status: "Active", usage: 0 }, ...promos];
    setPromos(updated);
    localStorage.setItem("skinpos_promos", JSON.stringify(updated));
    setNewPromo({ name: "", type: "Discount", value: "" });
    showToast("success", "Promo Diterbitkan", "Kode promo baru kini tersedia di sistem kasir.");
  };

  const handleDeletePromo = (id: string) => {
    const updated = promos.filter(x => x.id !== id);
    setPromos(updated);
    localStorage.setItem("skinpos_promos", JSON.stringify(updated));
    showToast("info", "Promo Dihapus", "Promo telah dihapus dari sistem.");
  };

  const getTargetMembers = () => {
    if (broadcastSegment === "all") return members;
    const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
    return members.filter(m => {
      if (!m.dob) return false;
      const parts = m.dob.split("-");
      return parts[1] === currentMonthStr;
    });
  };

  /* ───────── MULTI SHARE WA ───────── */
  const handleShareMultiWA = () => {
    const personalizedMsg = campaignMessage
      .replace(/\[Nama\]/g, "Kak")
      .replace(/\[Promo\]/g, promos[0]?.name || "Diskon Khusus");

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(personalizedMsg)}`;
    window.open(waUrl, "_blank");
    showToast("success", "Share WhatsApp", "Silakan pilih kontak di WhatsApp Web untuk meneruskan pesan.");
  };

  // Data Analytics Calculations
  const bestSellers = [...inventory].sort((a,b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3);
  // Dead stock: Barang dengan stok banyak tapi penjualan sangat rendah
  const deadStock = [...inventory].filter(i => i.type === "Produk" || i.type === "Product").sort((a,b) => (a.sold || 0) - (b.sold || 0)).slice(0, 3);

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden ${jakarta.className}`}>
      
      {/* SIDEBAR DENGAN TOGGLE */}
      <aside className={`bg-white flex flex-col h-full shrink-0 border-r border-slate-200 z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[260px]" : "w-0 opacity-0 overflow-hidden border-none"}`}>
        
        {/* LOGO AREA */}
        <div className="h-24 flex items-center px-8 border-b border-slate-100 shrink-0 w-[260px]">
          <div className="w-10 h-10 rounded-2xl bg-[#FF0055] flex items-center justify-center shadow-lg shadow-rose-500/20 mr-3">
            <Megaphone size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-slate-800 text-xl tracking-tight">
            Marketing<span className="text-[#FF0055]">.</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto w-[260px]">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu Utama</p>
          {[
            { id: "analytics", icon: BarChart3, label: "Analisis Bisnis" },
            { id: "promo", icon: Tag, label: "Promo & Bundling" },
            { id: "broadcast", icon: Megaphone, label: "Hubungan Pelanggan" },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                activeTab === tab.id 
                  ? "bg-[#FF0055] text-white shadow-lg shadow-rose-500/25"
                  : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? "text-white" : "text-slate-400"} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="p-6 border-t border-slate-100 shrink-0 w-[260px]">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all text-sm font-bold">
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7FA] transition-all duration-300">
        
        {/* HEADER DENGAN TOMBOL TOGGLE */}
        <header className="h-24 bg-white border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
               className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
               title={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            >
               {isSidebarOpen ? <PanelLeftClose size={22} strokeWidth={2}/> : <PanelLeftOpen size={22} strokeWidth={2}/>}
            </button>
            <div>
              <h1 className="text-[18px] lg:text-[22px] font-extrabold text-slate-800 tracking-tight capitalize">
                {activeTab === "analytics" ? "Analisis Bisnis" : activeTab === "promo" ? "Manajemen Kampanye" : "Hubungan Pelanggan"}
              </h1>
              <p className="text-[10px] lg:text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Klinik Rosereve Japan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 items-center gap-3 shadow-sm">
                <span className="text-[12px] font-bold text-slate-700 tracking-wide">Tim Promosi</span>
             </div>
             <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 pl-3 pr-4 py-1.5 rounded-full">
               <div className="w-8 h-8 rounded-full bg-[#FF0055] flex items-center justify-center text-white shrink-0">
                 <Users size={16} />
               </div>
               <div className="text-left hidden md:block">
                 <p className="text-[11px] font-black text-slate-800 leading-none">Marketing</p>
                 <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-none">SkinPOS</p>
               </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          
          {/* TAB 1: PRODUCT INSIGHT & ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in duration-300">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="w-14 h-14 bg-pink-50 text-[#FF0055] rounded-2xl flex items-center justify-center"><Tag size={24}/></div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Promo Aktif</p>
                        <h3 className="text-2xl font-black text-slate-800">{promos.length} <span className="text-xs font-semibold text-slate-400">Kampanye</span></h3>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><Users size={24}/></div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Anggota</p>
                        <h3 className="text-2xl font-black text-slate-800">{members.length} <span className="text-xs font-semibold text-slate-400">Orang</span></h3>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><BarChart3 size={24}/></div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Kupon Terpakai</p>
                        <h3 className="text-2xl font-black text-slate-800">{promos.reduce((s, p) => s + p.usage, 0)} <span className="text-xs font-semibold text-slate-400">Transaksi</span></h3>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* BEST SELLER */}
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-[1rem]"><Flame size={20}/></div>
                        <div>
                           <h3 className="font-bold text-slate-800 text-sm">Paling Laris (Best Seller)</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gunakan sebagai pancingan Bundle</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        {bestSellers.map((item, index) => (
                           <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                              <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-xs text-slate-500 shadow-sm">#{index+1}</div>
                                 <div>
                                    <p className="text-[13px] font-bold text-slate-800">{item.name}</p>
                                    <p className="text-[10px] font-bold text-[#FF0055] uppercase">{item.type === "Product" ? "Produk" : item.type === "Treatment" ? "Layanan" : item.type}</p>
                                 </div>
                              </div>
                              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">{item.sold || 0} Terjual</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* DEAD STOCK */}
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-slate-100 text-slate-500 rounded-[1rem]"><TrendingDown size={20}/></div>
                        <div>
                           <h3 className="font-bold text-slate-800 text-sm">Stok Mati / Tidak Laku</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rekomendasi untuk diberi Diskon</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        {deadStock.map((item, index) => (
                           <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                              <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm"><PackageOpen size={14}/></div>
                                 <div>
                                    <p className="text-[13px] font-bold text-slate-800">{item.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Sisa Stok: {item.stock}</p>
                                 </div>
                              </div>
                              <span className="text-xs font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">Hanya {item.sold || 0} Terjual</span>
                           </div>
                        ))}
                        {deadStock.length === 0 && <p className="text-center text-xs text-slate-400 py-4 font-semibold">Semua produk terjual dengan baik.</p>}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* TAB 2: PROMO & BUNDLING */}
          {activeTab === "promo" && (
            <div className="h-full p-6 lg:p-10 flex flex-col gap-6 animate-in fade-in duration-300 overflow-y-auto bg-[#F4F7FA]">
               {/* Voucher Performance Analytics Dashboard Row */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full shrink-0">
                  {/* Card 1: Most Active Voucher */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-50 text-[#FF0055] rounded-2xl">
                           <Sparkles size={20} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Voucher Paling Efektif</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Penggunaan Kupon Tertinggi</p>
                        </div>
                     </div>
                     <div>
                        {(() => {
                          const sorted = [...promos].sort((a,b) => b.usage - a.usage);
                          const best = sorted[0];
                          if (!best || best.usage === 0) return <p className="text-xs font-bold text-slate-400">Belum ada klaim</p>;
                          return (
                            <div className="text-right">
                               <h3 className="text-sm font-black text-slate-850 uppercase">{best.name}</h3>
                               <p className="text-[10px] font-black text-[#FF0055] uppercase tracking-wider mt-0.5">{best.usage} Kali Digunakan</p>
                            </div>
                          );
                        })()}
                     </div>
                  </div>

                  {/* Card 2: Total Campaign Conversion */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                           <TrendingUp size={20} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Total Klaim Promo</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Konversi Kampanye Aktif</p>
                        </div>
                     </div>
                     <h2 className="text-2xl font-black text-emerald-600">
                        {promos.reduce((s,p) => s + (p.usage || 0), 0)}{" "}
                        <span className="text-[10px] text-slate-450 font-bold">Klaim</span>
                     </h2>
                  </div>
               </div>

               <div className="flex flex-col lg:flex-row gap-8 w-full">
                  <div className="w-full lg:w-[380px] shrink-0">
                     <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                        <h3 className="font-extrabold text-slate-800 mb-6 text-sm flex items-center gap-2"><Plus size={18} className="text-[#FF0055]" /> Rilis Promo Baru</h3>
                        <form onSubmit={handleAddPromo} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Nama Kampanye</label>
                      <input type="text" value={newPromo.name} onChange={(e)=>setNewPromo({...newPromo, name: e.target.value})} placeholder="Contoh: Flash Sale Gajian" className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Jenis Promosi</label>
                      <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <button type="button" onClick={()=>setNewPromo({...newPromo, type: "Discount"})} className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${newPromo.type === "Discount" ? "bg-white text-[#FF0055] shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Diskon %</button>
                        <button type="button" onClick={()=>setNewPromo({...newPromo, type: "Package"})} className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${newPromo.type === "Package" ? "bg-white text-[#FF0055] shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Paket</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Nilai Diskon / Harga Spesial</label>
                      <input type="text" value={newPromo.value} onChange={(e)=>setNewPromo({...newPromo, value: e.target.value})} placeholder="Contoh: 15% atau Rp200.000" className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]" required />
                    </div>
                    <button type="submit" className="w-full py-5 bg-[#FF0055] text-white rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase hover:bg-[#D40048] shadow-lg shadow-rose-500/20 transition-all mt-4">Terbitkan Promo</button>
                  </form>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-extrabold text-slate-800 text-sm">Daftar Promo Aktif</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">Aktif / Terkini</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 sticky top-0"><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100"><th className="px-8 py-5">DETAIL KAMPANYE</th><th className="px-8 py-5 text-center">Tipe</th><th className="px-8 py-5 text-center">Penggunaan</th><th className="px-8 py-5 text-center">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {promos.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="text-[13px] font-bold text-slate-800 mb-1">{p.name}</p>
                            <p className="text-[10px] text-[#FF0055] font-black uppercase tracking-wider">{p.id} • {p.value}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${p.type === 'Discount' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{p.type === 'Discount' ? 'Diskon' : 'Paket'}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <p className="text-[15px] font-black text-slate-800">{p.usage}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Kali Diklaim</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button onClick={()=>handleDeletePromo(p.id)} className="p-2.5 bg-rose-50 text-[#FF0055] rounded-xl hover:bg-[#FF0055] hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
               </div>
            </div>
          )}

          {/* TAB 3: CRM & BROADCAST */}
          {activeTab === "broadcast" && (
             <div className="h-full p-6 lg:p-10 flex flex-col lg:flex-row gap-8 animate-in fade-in duration-300 bg-[#F4F7FA] overflow-y-auto">
               {/* Column 1: Campaign Composer */}
               <div className="w-full lg:w-[380px] shrink-0">
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                       <Megaphone size={18} className="text-[#FF0055]" /> Komposer Pesan
                    </h3>
                    
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">Sasaran Pelanggan</label>
                       <select
                          value={broadcastSegment}
                          onChange={(e) => setBroadcastSegment(e.target.value as any)}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]"
                       >
                          <option value="all">Semua Anggota VIP ({members.length} Orang)</option>
                          <option value="birthday">Ulang Tahun Bulan Ini ({getTargetMembers().length} Orang)</option>
                       </select>
                    </div>

                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">Isi Pesan Promosi</label>
                       <textarea
                          rows={5}
                          value={campaignMessage}
                          onChange={(e) => setCampaignMessage(e.target.value)}
                          placeholder="Tulis pesan..."
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA] resize-none"
                       />
                       <p className="text-[9px] text-slate-400 font-semibold mt-2 leading-relaxed">
                          * Gunakan <code className="bg-slate-100 px-1 py-0.5 rounded font-black text-rose-500">[Nama]</code> untuk menyisipkan nama pelanggan dan <code className="bg-slate-100 px-1 py-0.5 rounded font-black text-rose-500">[Promo]</code> untuk nama promo.
                       </p>
                    </div>

                    <div className="space-y-3">
                        <button
                           onClick={handleShareMultiWA}
                           className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[11px] tracking-[0.15em] uppercase shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                           title="Bagikan pesan umum (tanpa nama) ke WhatsApp"
                        >
                           <Send size={16}/> Bagikan Pesan (Share WA)
                        </button>
                    </div>
                 </div>
               </div>

               {/* Column 2: Targeted Members List */}
               <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                     <div>
                        <h3 className="font-extrabold text-slate-800 text-sm">Daftar Anggota Sasaran</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Segmen: {broadcastSegment === "all" ? "Semua VIP" : "Ultah Bulan Ini"}</p>
                     </div>
                     <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">
                        {getTargetMembers().length} Penerima
                     </span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-8 py-5">Nama Pelanggan</th>
                            <th className="px-8 py-5">No. WhatsApp</th>
                            <th className="px-8 py-5 text-center">Status Anggota</th>
                            <th className="px-8 py-5 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {getTargetMembers().length === 0 ? (
                              <tr>
                                 <td colSpan={4} className="text-center py-12 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Tidak ada anggota dalam segmen ini.
                                 </td>
                              </tr>
                           ) : getTargetMembers().map((m, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="px-8 py-6 font-bold text-slate-800 text-[13px]">{m.name}</td>
                                 <td className="px-8 py-6 font-semibold text-slate-500 text-[12px]">{m.phone}</td>
                                 <td className="px-8 py-6 text-center flex items-center justify-center gap-2">
                                     <span className="bg-rose-50 text-[#FF0055] px-3 py-1 rounded-lg text-[9px] font-black border border-rose-100 uppercase tracking-widest">VIP ({m.discount * 100}%)</span>
                                     {getMemberSegmentBadge(m.phone)}
                                  </td>
                                 <td className="px-8 py-6 text-right">
                                    <button
                                       onClick={() => {
                                          const personalizedMsg = campaignMessage
                                             .replace(/\[Nama\]/g, m.name)
                                             .replace(/\[Promo\]/g, promos[0]?.name || "Diskon Khusus");
                                          
                                          let phone = m.phone.replace(/\D/g, "");
                                          if (phone.startsWith("0")) {
                                             phone = "62" + phone.slice(1);
                                          } else if (!phone.startsWith("62")) {
                                             phone = "62" + phone;
                                          }
                                          
                                          const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(personalizedMsg)}`;
                                          window.open(waUrl, "_blank");
                                          setToast({type: "success", title: "Terbuka", subtitle: `WhatsApp Web terbuka untuk ${m.name}`});
                                       }}
                                       className="px-4 py-2 bg-[#FF0055] hover:bg-[#D40048] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
                                    >
                                       <Send size={12}/> Kirim WA
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
             </div>
          )}

        </div>

        {/* MODAL LOGOUT CONFIRM */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowLogoutConfirm(false)}>
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-xs shadow-2xl text-center border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <LogOut size={32} className="mx-auto text-[#FF0055] mb-4" />
              <h2 className="text-xl font-black text-slate-800 mb-2">Keluar Sesi Marketing?</h2>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-xs font-bold">Batal</button>
                <button onClick={() => { sessionStorage.clear(); router.push("/"); }} className="flex-1 py-3 rounded-xl bg-[#FF0055] text-white hover:bg-[#D40048] transition-all text-xs font-bold shadow-md">Keluar</button>
              </div>
            </div>
          </div>
        )}



        {/* TOAST NOTIFICATION */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-[1000] animate-in slide-in-from-bottom-5">
            <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border ${toast.type === 'error' ? 'bg-rose-50 border-rose-200' : 'bg-slate-900 border-slate-800'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={24} /> : toast.type === 'error' ? <XCircle className="text-[#FF0055]" size={24} /> : <Info className="text-blue-400" size={24} />}
              <div>
                <h4 className={`font-bold text-[13px] tracking-wide mb-0.5 ${toast.type === 'error' ? 'text-rose-700' : 'text-white'}`}>{toast.title}</h4>
                <p className={`text-[11px] font-medium ${toast.type === 'error' ? 'text-rose-500' : 'text-slate-400'}`}>{toast.subtitle}</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}