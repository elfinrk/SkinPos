"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Tag, Users, BarChart3, LogOut, CheckCircle2, 
  Plus, Search, Megaphone, Trash2, Info, XCircle,
  TrendingDown, TrendingUp, Flame, Send, PackageOpen
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
  
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [inventory, setInventory] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', title: string, subtitle: string} | null>(null);

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

  // Sinkronisasi Data Inventory & Member dari Global Storage
  useEffect(() => {
    if (!isAuthorized) return;
    const syncData = () => {
      const savedInv = localStorage.getItem("skinpos_inventory");
      const savedMembers = localStorage.getItem("skinpos_members");
      if (savedInv) setInventory(JSON.parse(savedInv));
      if (savedMembers) setMembers(JSON.parse(savedMembers));
    };
    syncData(); 
    const interval = setInterval(syncData, 2000); 
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newPromo.name || !newPromo.value) return showToast("error", "Data Tidak Lengkap", "Silakan isi semua field promo.");
    
    const id = (newPromo.type === "Discount" ? "PRM-" : "BND-") + Math.floor(100 + Math.random() * 900);
    setPromos([{ ...newPromo, id, status: "Active", usage: 0 }, ...promos]);
    setNewPromo({ name: "", type: "Discount", value: "" });
    showToast("success", "Promo Diterbitkan", "Kode promo baru kini tersedia di sistem kasir.");
  };

  const handleBroadcast = () => {
    if(members.length === 0) return showToast("error", "Database Kosong", "Belum ada member untuk dikirim pesan.");
    showToast("info", "Mengirim Pesan...", `Sistem sedang mengirim broadcast ke ${members.length} pelanggan.`);
    setTimeout(() => {
      showToast("success", "Broadcast Sukses", "Pesan promo telah berhasil dikirim ke WhatsApp member.");
    }, 2000);
  }

  // Data Analytics Calculations
  const bestSellers = [...inventory].sort((a,b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3);
  // Dead stock: Barang dengan stok banyak tapi penjualan sangat rendah
  const deadStock = [...inventory].filter(i => i.type === "product").sort((a,b) => (a.sold || 0) - (b.sold || 0)).slice(0, 3);

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden ${jakarta.className}`}>
      
      {/* SIDEBAR - CLEAN WHITE (Sesuai Kasir & Manager) */}
      <aside className="w-[260px] bg-white flex flex-col h-full shrink-0 border-r border-slate-200 z-20">
        
        {/* LOGO AREA */}
        <div className="h-24 flex items-center px-8 border-b border-slate-100 shrink-0">
          <img 
            src="image_b6c0b9.png" 
            alt="Logo" 
            className="w-10 h-10 mr-3 object-contain drop-shadow-sm" 
          />
          <span className="font-extrabold text-slate-800 text-xl tracking-tight">
            Marketing<span className="text-[#FF0055]">.</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu Campaign</p>
          {[
            { id: "analytics", icon: BarChart3, label: "Insight Produk" },
            { id: "promo", icon: Tag, label: "Promo & Bundling" },
            { id: "broadcast", icon: Megaphone, label: "CRM & Broadcast" },
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

        {/* USER PROFILE & LOGOUT */}
        <div className="p-6 border-t border-slate-100 shrink-0">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all text-sm font-bold">
            <LogOut size={18} />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7FA]">
        
        {/* HEADER SAAS CLEAN */}
        <header className="h-24 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-800 tracking-tight capitalize">
              {activeTab === "analytics" ? "Marketing & Product Insight" : activeTab === "promo" ? "Campaign Management" : "Customer Relationship"}
            </h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Klinik Rosereve Japan
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 flex items-center gap-3 shadow-sm">
                <span className="text-[12px] font-bold text-slate-700 tracking-wide">Tim Promosi</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-[#FF0055] text-sm">MK</div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          
          {/* TAB 1: PRODUCT INSIGHT & ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="h-full p-10 overflow-y-auto animate-in fade-in duration-300">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="w-14 h-14 bg-pink-50 text-[#FF0055] rounded-2xl flex items-center justify-center"><Tag size={24}/></div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Promo Aktif</p>
                        <h3 className="text-2xl font-black text-slate-800">{promos.length} <span className="text-xs font-semibold text-slate-400">Campaign</span></h3>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><Users size={24}/></div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Member</p>
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
                           <h3 className="font-bold text-slate-800 text-sm">High Demand (Best Seller)</h3>
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
                                    <p className="text-[10px] font-bold text-[#FF0055] uppercase">{item.type}</p>
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
                           <h3 className="font-bold text-slate-800 text-sm">Slow Moving (Dead Stock)</h3>
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
            <div className="h-full p-10 flex gap-8 animate-in fade-in duration-300 overflow-y-auto bg-[#F4F7FA]">
              <div className="w-[380px] shrink-0">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 mb-6 text-sm flex items-center gap-2"><Plus size={18} className="text-[#FF0055]" /> Rilis Promo Baru</h3>
                  <form onSubmit={handleAddPromo} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Nama Campaign</label>
                      <input type="text" value={newPromo.name} onChange={(e)=>setNewPromo({...newPromo, name: e.target.value})} placeholder="Contoh: Flash Sale Gajian" className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Jenis Promosi</label>
                      <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <button type="button" onClick={()=>setNewPromo({...newPromo, type: "Discount"})} className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${newPromo.type === "Discount" ? "bg-white text-[#FF0055] shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Diskon %</button>
                        <button type="button" onClick={()=>setNewPromo({...newPromo, type: "Package"})} className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${newPromo.type === "Package" ? "bg-white text-[#FF0055] shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Bundling</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Nilai Diskon / Harga Spesial</label>
                      <input type="text" value={newPromo.value} onChange={(e)=>setNewPromo({...newPromo, value: e.target.value})} placeholder="Contoh: 15% atau Rp 200K" className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]" required />
                    </div>
                    <button type="submit" className="w-full py-5 bg-[#FF0055] text-white rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase hover:bg-[#D40048] shadow-lg shadow-rose-500/20 transition-all mt-4">Aktifkan Kode</button>
                  </form>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-extrabold text-slate-800 text-sm">Daftar Promo Aktif</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">Live Server</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 sticky top-0"><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100"><th className="px-8 py-5">Detail Campaign</th><th className="px-8 py-5 text-center">Tipe</th><th className="px-8 py-5 text-center">Penggunaan</th><th className="px-8 py-5 text-center">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {promos.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="text-[13px] font-bold text-slate-800 mb-1">{p.name}</p>
                            <p className="text-[10px] text-[#FF0055] font-black uppercase tracking-wider">{p.id} • {p.value}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${p.type === 'Discount' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{p.type}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <p className="text-[15px] font-black text-slate-800">{p.usage}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Kali Klaim</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button onClick={()=>setPromos(promos.filter(x => x.id !== p.id))} className="p-2.5 bg-rose-50 text-[#FF0055] rounded-xl hover:bg-[#FF0055] hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CRM & BROADCAST */}
          {activeTab === "broadcast" && (
             <div className="h-full p-10 overflow-y-auto animate-in fade-in duration-300 bg-[#F4F7FA]">
               <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-8 flex items-center justify-between p-8">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#FF0055] text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-rose-500/25"><Megaphone size={28}/></div>
                        <div>
                           <h2 className="text-xl font-extrabold text-slate-800 mb-1">Pemasaran Langsung (Broadcast)</h2>
                           <p className="text-[12px] font-medium text-slate-500">Kirim pesan WhatsApp massal ke {members.length} pelanggan setia Anda.</p>
                        </div>
                     </div>
                     <button onClick={handleBroadcast} className="px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase hover:bg-[#FF0055] shadow-lg transition-all flex items-center gap-2">
                        <Send size={16}/> Kirim Sekarang
                     </button>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                     <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 className="font-extrabold text-slate-800 text-sm">Target Database Pelanggan</h3>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">Tersinkronisasi</span>
                     </div>
                     <div className="max-h-[50vh] overflow-y-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 sticky top-0"><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100"><th className="px-8 py-5">Nama Pelanggan</th><th className="px-8 py-5">No. WhatsApp</th><th className="px-8 py-5 text-center">Status Member</th></tr></thead>
                          <tbody className="divide-y divide-slate-100">
                             {members.length === 0 ? (
                                <tr>
                                   <td colSpan={3} className="text-center py-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Belum ada pelanggan terdaftar di Kasir.</td>
                                </tr>
                             ) : members.map((m, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                   <td className="px-8 py-6 font-bold text-slate-800 text-[13px]">{m.name}</td>
                                   <td className="px-8 py-6 font-semibold text-slate-500 text-[12px]">{m.phone}</td>
                                   <td className="px-8 py-6 text-center">
                                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black border border-emerald-100 uppercase tracking-widest">VIP ({m.discount * 100}%)</span>
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

        </div>

        {/* MODAL LOGOUT CONFIRM */}
        {showLogoutConfirm && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in">
             <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl text-center border border-slate-100">
                <div className="w-20 h-20 bg-rose-50 text-[#FF0055] rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={36}/></div>
                <h2 className="text-2xl font-black text-slate-800 mb-4">Keluar Sistem?</h2>
                <p className="text-[12px] font-bold text-slate-500 mb-10 leading-relaxed uppercase tracking-wider">Anda akan keluar dari Portal Marketing.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest">Batal</button>
                  <button onClick={() => { sessionStorage.clear(); router.push("/"); }} className="flex-1 py-4 rounded-2xl font-bold bg-[#FF0055] text-white hover:bg-[#D40048] transition-all text-[11px] uppercase tracking-widest shadow-xl shadow-rose-500/20">Keluar</button>
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