"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShieldAlert, TrendingUp, Receipt, Users, 
  LogOut, CheckCircle2, Clock, RefreshCw, LockKeyhole,
  XCircle, Trash2, History, Info, FileWarning, HelpCircle,
  FileDown, FileSpreadsheet, Flame, ClipboardList, UsersRound, 
  CalendarRange, UserCheck, AlertTriangle, PanelLeftClose, PanelLeftOpen
} from "lucide-react";

import { Plus_Jakarta_Sans } from "next/font/google";
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"] 
});

const INITIAL_STOCK_LOGS = [
  { id: "LOG-001", time: "08:15 AM", item: "Serum Vitamin C", type: "masuk", qty: 50, reason: "Restock Mingguan", user: "Gudang" },
  { id: "LOG-002", time: "10:30 AM", item: "Facial Wash Acne", type: "keluar", qty: 2, reason: "Barang Rusak (Bocor)", user: "Elberth" },
];

export default function ManagerDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "voids" | "history" | "audit">("dashboard");
  const [dateFilter, setDateFilter] = useState("today");
  
  const [dynamicPin, setDynamicPin] = useState("------");
  const [countdown, setCountdown] = useState(60);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info' | 'warning', title: string, subtitle: string} | null>(null);

  const [voidPromptTarget, setVoidPromptTarget] = useState<string | null>(null);
  const [voidReasonInput, setVoidReasonInput] = useState("Salah input kasir");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const role = sessionStorage.getItem("userRole");
    if (isAuth !== "true" || role !== "manager") {
      router.replace("/"); 
    } else {
      setIsAuthorized(true);
      if (!localStorage.getItem("skinpos_stock_logs")) localStorage.setItem("skinpos_stock_logs", JSON.stringify(INITIAL_STOCK_LOGS));
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    const syncData = () => {
      setOrders(JSON.parse(localStorage.getItem("skinpos_orders") || "[]"));
      setInventory(JSON.parse(localStorage.getItem("skinpos_inventory") || "[]"));
      setStockLogs(JSON.parse(localStorage.getItem("skinpos_stock_logs") || "[]"));
    };
    syncData(); 
    const interval = setInterval(syncData, 1000); 
    return () => clearInterval(interval);
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthorized) return;
    const generateNewPin = () => {
      const newPin = Math.floor(100000 + Math.random() * 900000).toString();
      setDynamicPin(newPin);
      setCountdown(60); 
      localStorage.setItem("manager_live_pin", newPin);
    };
    generateNewPin();
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { generateNewPin(); return 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAuthorized]);

  // FUNGSI YANG SEBELUMNYA HILANG
  const handleTolakPesanan = (orderId: string) => {
    setVoidPromptTarget(orderId);
    setVoidReasonInput("Salah input kasir");
  };

  const submitTolakPesanan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidPromptTarget) return;

    const orderToVoid = orders.find(o => o.id === voidPromptTarget);
    if(orderToVoid) {
      const currentInvRaw = localStorage.getItem("skinpos_inventory");
      if(currentInvRaw) {
        let currentInv = JSON.parse(currentInvRaw);
        const updatedInv = currentInv.map((item: any) => {
          const totalQtyToReturn = orderToVoid.items.filter((c: any) => c.id === item.id).reduce((sum:number, current:any) => sum + current.qty, 0);
          return totalQtyToReturn > 0 ? { ...item, stock: item.stock + totalQtyToReturn } : item;
        });
        localStorage.setItem("skinpos_inventory", JSON.stringify(updatedInv));
      }
      
      const updatedOrders = orders.map(o => o.id === voidPromptTarget ? { ...o, status: "voided", voidReason: voidReasonInput } : o);
      setOrders(updatedOrders);
      localStorage.setItem("skinpos_orders", JSON.stringify(updatedOrders));
      showToast("success", "Pesanan Ditolak", "Status diubah menjadi Batal dan stok dikembalikan.");
    }
    setVoidPromptTarget(null);
  };

  const completedOrders = orders.filter(o => o.status === "completed");
  const voidedOrders = orders.filter(o => o.status === "voided");
  const pendingOrders = orders.filter(o => o.status === "pending");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#F4F7FA] text-slate-800 overflow-hidden ${jakarta.className}`}>
      
      {/* SIDEBAR DENGAN TRANSISI BUKA TUTUP */}
      <aside className={`bg-white flex flex-col h-full shrink-0 border-r border-slate-200 z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[260px]" : "w-0 opacity-0 overflow-hidden border-none"}`}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100 shrink-0">
          <img src="image_b6c0b9.png" alt="Logo" className="w-10 h-10 mr-3 object-contain drop-shadow-sm" />
          <span className="font-extrabold text-slate-800 text-xl tracking-tight whitespace-nowrap">Manager<span className="text-[#FF0055]">.</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto scrollbar-hide w-[260px]">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Akses Supervisi</p>
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Analisis Bisnis" },
            { id: "voids", icon: ShieldAlert, label: "Live Antrean", count: pendingOrders.length },
            { id: "history", icon: History, label: "Riwayat & Laporan" },
            { id: "audit", icon: ClipboardList, label: "Audit Stok" }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeTab === tab.id ? "bg-[#FF0055] text-white shadow-lg shadow-rose-500/25" : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? "text-white" : "text-slate-400"} />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.count ? <span className={`ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-rose-50 text-[#FF0055]'}`}>{tab.count}</span> : null}
            </button>
          ))}

          <div className="mt-8 mx-2 mb-4 p-5 rounded-2xl bg-rose-50 border border-rose-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-3 -mt-3 text-rose-200/50"><LockKeyhole size={80} /></div>
             <div className="relative z-10">
               <p className="text-[10px] font-black text-[#FF0055] uppercase tracking-widest flex items-center gap-1.5 mb-3"><RefreshCw size={12} className={countdown < 5 ? "animate-spin text-[#FF0055]" : ""} /> Live Void PIN</p>
               <div className="bg-white px-3 py-3 rounded-xl shadow-sm border border-rose-100 flex items-center justify-center mb-3">
                 <h2 className="text-2xl font-black text-[#FF0055] tracking-[0.2em] ml-1 font-mono">{dynamicPin}</h2>
               </div>
               <div className="w-full bg-rose-200/50 rounded-full h-1.5 mb-1.5 overflow-hidden">
                 <div className={`h-1.5 transition-all duration-1000 ${countdown < 10 ? "bg-rose-400" : "bg-[#FF0055]"}`} style={{ width: `${(countdown / 60) * 100}%` }}></div>
               </div>
               <p className="text-[9px] font-bold text-center uppercase tracking-widest text-rose-400">Kedaluwarsa {countdown}s</p>
             </div>
          </div>

          <div className="pt-2 pb-6 border-t border-slate-100 mx-2">
             <button onClick={() => setShowHelpCenter(true)} className="w-full flex items-center gap-3 px-2 py-3 rounded-xl transition-all font-bold text-sm bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50">
                <HelpCircle size={18} strokeWidth={2} className="text-slate-400"/>
                <span className="whitespace-nowrap">Pusat Bantuan</span>
             </button>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100 shrink-0 w-[260px]">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all text-sm font-bold">
            <LogOut size={18} />
            <span className="whitespace-nowrap">Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7FA] transition-all duration-300">
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
              <h1 className="text-[18px] lg:text-[22px] font-extrabold text-slate-800 tracking-tight capitalize">{activeTab === "dashboard" ? "Analisis Bisnis" : activeTab === "voids" ? "Live Antrean Kasir" : activeTab === "audit" ? "Audit Inventaris" : "Riwayat & Laporan"}</h1>
              <p className="text-[10px] lg:text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pantauan Operasional Terpadu</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                <CalendarRange size={16} className="text-slate-400" />
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-transparent text-[11px] font-bold text-slate-700 outline-none uppercase tracking-widest cursor-pointer">
                   <option value="today">Hari Ini</option>
                   <option value="week">Minggu Ini</option>
                   <option value="month">Bulan Ini</option>
                </select>
             </div>
             <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-[#FF0055] text-sm">M</div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {/* TAB DASHBOARD */}
          {activeTab === "dashboard" && (
             <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in duration-300 bg-[#F4F7FA]">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   <div className="space-y-8">
                     <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="p-3 bg-emerald-50 text-emerald-500 rounded-[1rem]"><TrendingUp size={24}/></div>
                           <div><h3 className="font-bold text-slate-800">Performa Keuangan</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Penjualan Bersih</p></div>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 tracking-tighter">Rp{totalRevenue.toLocaleString('id-ID')}</h2>
                        <div className="pt-6 border-t border-slate-100 flex gap-10">
                           <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Sukses</p><p className="text-lg lg:text-xl font-black text-slate-700 flex items-center gap-2"><Receipt size={16} className="text-emerald-500"/> {completedOrders.length} Struk</p></div>
                           <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Batal</p><p className="text-lg lg:text-xl font-black text-slate-700 flex items-center gap-2"><XCircle size={16} className="text-rose-500"/> {voidedOrders.length} Kasus</p></div>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
                         <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><Users size={28}/></div>
                         <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Kasir Shift Saat Ini (Elberth)</p><h3 className="text-xl font-black text-slate-800">{completedOrders.length + pendingOrders.length} <span className="text-sm font-bold text-slate-400">Transaksi dilayani</span></h3></div>
                     </div>
                   </div>
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-3 bg-amber-50 text-amber-500 rounded-[1rem]"><Flame size={24}/></div>
                         <div><h3 className="font-bold text-slate-800">Produk Paling Laris</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Berdasarkan Total Terjual</p></div>
                      </div>
                      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                         {[...inventory].sort((a,b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5).map((item, index) => (
                           <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-[#FF0055] hover:shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>#{index+1}</div>
                                <div><p className="font-bold text-sm text-slate-800 leading-tight mb-0.5">{item.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.type === "Product" ? "Produk" : item.type === "Treatment" ? "Layanan" : item.type}</p></div>
                              </div>
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">{item.sold || 0} Produk / Pcs</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* TAB LIVE ANTREAN */}
          {activeTab === "voids" && (
            <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in duration-300 bg-[#F4F7FA]">
               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="p-6 lg:p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                     <h3 className="font-extrabold text-slate-800 text-lg">Pesanan Menggantung</h3>
                     <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-amber-100">Aktif / Terkini</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {pendingOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20"><CheckCircle2 size={64} className="mb-4 opacity-30" strokeWidth={1.5} /><p className="font-bold tracking-[0.2em] uppercase text-xs opacity-60">Tidak ada antrean kasir</p></div>
                    ) : (
                      <table className="w-full text-left">
                        <thead><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100"><th className="px-8 py-5">Waktu & ID</th><th className="px-8 py-5">Detail Pesanan</th><th className="px-8 py-5 text-right">Total Tagihan</th><th className="px-8 py-5 text-center">Tindakan Khusus</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {pendingOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-6"><span className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-rose-50 text-[#FF0055] border border-rose-100">{order.id}</span><p className="text-[11px] font-semibold text-slate-500 mt-2 flex items-center gap-1.5"><Clock size={12}/> {order.time ? order.time.replace(':', '.') : ''}</p></td>
                              <td className="px-8 py-6"><div className="space-y-1.5">{order.items.map((it: any, i: number) => (<p key={i} className="text-xs font-bold text-slate-700">{it.qty}x {it.name} <span className="text-slate-400 font-medium">({it.variant || 'Normal'})</span></p>))}</div></td>
                              <td className="px-8 py-6 text-right font-black text-slate-800 text-lg">Rp{order.grandTotal.toLocaleString('id-ID')}</td>
                              <td className="px-8 py-6 text-center"><button onClick={() => handleTolakPesanan(order.id)} className="px-4 py-2.5 bg-rose-50 text-[#FF0055] text-[11px] font-bold tracking-wider uppercase rounded-xl hover:bg-[#FF0055] hover:text-white transition-all shadow-sm border border-rose-100 hover:border-transparent flex items-center justify-center gap-2 mx-auto"><Trash2 size={14}/> Tolak / Batalkan</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
               </div>
            </div>
          )}

          {/* TAB RIWAYAT & LAPORAN */}
          {activeTab === "history" && (
            <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                 <h2 className="text-xl font-extrabold text-slate-800">Database Transaksi</h2>
                 <div className="flex gap-3">
                    <button onClick={() => showToast("success", "Unduh Laporan PDF", "Laporan siap dicetak.")} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#FF0055] transition-all shadow-md hover:-translate-y-0.5"><FileDown size={16} /> Unduh PDF</button>
                    <button onClick={() => showToast("success", "Unduh Excel", "Rekapitulasi Excel berhasil diunduh.")} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md hover:-translate-y-0.5"><FileSpreadsheet size={16} /> Data Excel</button>
                 </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[70vh] flex flex-col">
                {completedOrders.length === 0 && voidedOrders.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-300"><FileWarning size={64} className="mx-auto mb-6 opacity-30" strokeWidth={1.5} /><p className="font-bold tracking-[0.2em] uppercase text-xs opacity-70">Belum ada riwayat terekam</p></div>
                ) : (
                  <div className="overflow-y-auto flex-1">
                     <table className="w-full text-left">
                       <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10"><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]"><th className="px-8 py-5">ID Pesanan</th><th className="px-8 py-5">Pelanggan</th><th className="px-8 py-5 text-right">Nilai Tagihan</th><th className="px-8 py-5">Status & Keterangan</th></tr></thead>
                       <tbody className="divide-y divide-slate-100">
                         {[...completedOrders, ...voidedOrders].map((order, idx) => (
                           <tr key={`${order.id}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-6"><span className="font-bold text-slate-800 text-[13px]">{order.id}</span><p className="text-[10px] font-semibold text-slate-400 mt-1">{order.time ? order.time.replace(':', '.') : ''}</p></td>
                             <td className="px-8 py-6"><span className="text-[13px] font-bold text-slate-700">{order.member ? order.member.name : "Umum"}</span></td>
                             <td className="px-8 py-6 text-right font-black text-slate-800 text-[15px]">Rp{order.grandTotal.toLocaleString('id-ID')}</td>
                             <td className="px-8 py-6">
                                <div className="flex flex-col items-start gap-1.5">
                                  {order.status === "completed" ? <span className="bg-emerald-50 text-emerald-600 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100 inline-block">Selesai</span> : <span className="bg-rose-50 text-[#FF0055] px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-rose-100 inline-block">Batal</span>}
                                  {order.status === "voided" && order.voidReason && (<span className="text-[10px] font-bold text-rose-400">"{order.voidReason}"</span>)}
                                </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB AUDIT STOK */}
          {activeTab === "audit" && (
            <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA]">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4"><h2 className="text-xl font-extrabold text-slate-800">Log Audit Inventaris</h2><p className="text-[11px] text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-full border border-slate-200">Record Terakhir: {stockLogs.length} Entri</p></div>
               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[70vh] flex flex-col">
                  <div className="overflow-y-auto flex-1">
                     <table className="w-full text-left">
                       <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10"><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]"><th className="px-8 py-5">Waktu & User</th><th className="px-8 py-5">Item Produk</th><th className="px-8 py-5 text-center">Tipe Mutasi</th><th className="px-8 py-5">Alasan / Keterangan</th></tr></thead>
                       <tbody className="divide-y divide-slate-100">
                         {stockLogs.map((log, idx) => (
                           <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-5"><span className="font-bold text-slate-800 text-[12px]">{log.time}</span><p className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1"><UserCheck size={10}/> {log.user}</p></td>
                             <td className="px-8 py-5"><span className="text-[13px] font-bold text-slate-800">{log.item}</span></td>
                             <td className="px-8 py-5 text-center">{log.type === "masuk" ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg uppercase tracking-wider">+{log.qty} Masuk</span> : <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1 rounded-lg uppercase tracking-wider">-{log.qty} Keluar</span>}</td>
                             <td className="px-8 py-5 text-[11px] font-bold text-slate-500 italic">"{log.reason}"</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* MODAL ALASAN TOLAK PESANAN */}
        {voidPromptTarget && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[900] flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 border border-slate-100">
                 <div className="w-16 h-16 bg-rose-50 text-[#FF0055] rounded-full flex items-center justify-center mx-auto mb-6"><ShieldAlert size={32}/></div>
                 <h3 className="text-center font-black text-slate-800 text-xl mb-2">Alasan Pembatalan</h3>
                 <p className="text-center text-[12px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Pesanan {voidPromptTarget}</p>
                 <form onSubmit={submitTolakPesanan} className="space-y-6">
                    <div>
                       <input type="text" value={voidReasonInput} onChange={(e)=>setVoidReasonInput(e.target.value)} placeholder="Masukkan alasan..." className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]" required autoFocus />
                    </div>
                    <div className="flex gap-4">
                       <button type="button" onClick={() => setVoidPromptTarget(null)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest">Batal</button>
                       <button type="submit" className="flex-1 py-4 rounded-2xl font-bold bg-[#FF0055] text-white hover:bg-[#D40048] transition-all text-[11px] uppercase tracking-widest shadow-md">Tolak Pesanan</button>
                    </div>
                 </form>
              </div>
           </div>
        )}

        {/* MODAL PUSAT BANTUAN */}
        {showHelpCenter && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[800] flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 border border-slate-100">
                 <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"><HelpCircle size={32}/></div>
                 <h3 className="text-center font-black text-slate-800 text-xl mb-6">Pusat Bantuan Manager</h3>
                 <div className="space-y-3 mb-8">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="font-bold text-sm text-slate-800 mb-1">Otorisasi Void Gagal?</p><p className="text-xs text-slate-500 leading-relaxed">Pastikan kasir memasukkan "Live Void PIN" yang tertera di sidebar kiri Anda. PIN akan berganti setiap 60 detik.</p></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="font-bold text-sm text-slate-800 mb-1">Laporan Excel Error?</p><p className="text-xs text-slate-500 leading-relaxed">Pastikan perangkat Anda terkoneksi internet. Jika masih terkendala, hubungi IT Support.</p></div>
                 </div>
                 <button onClick={() => setShowHelpCenter(false)} className="w-full py-4 rounded-2xl font-bold bg-slate-800 text-white hover:bg-[#FF0055] transition-all text-[11px] uppercase tracking-widest shadow-md">Tutup</button>
              </div>
           </div>
        )}

        {/* MODAL LOGOUT */}
        {showLogoutConfirm && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in">
             <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl text-center border border-slate-100">
                <div className="w-20 h-20 bg-rose-50 text-[#FF0055] rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={36}/></div>
                <h2 className="text-2xl font-black text-slate-800 mb-4">Keluar Sistem?</h2>
                <p className="text-[12px] font-bold text-slate-500 mb-10 leading-relaxed uppercase tracking-wider">Sesi supervisi manager akan diakhiri.</p>
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
            <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border ${toast.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-slate-900 border-slate-800'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={24} /> : toast.type === 'error' ? <XCircle className="text-rose-500" size={24} /> : toast.type === 'warning' ? <AlertTriangle className="text-amber-500" size={24}/> : <Info className="text-blue-400" size={24} />}
              <div>
                <h4 className={`font-bold text-[13px] tracking-wide mb-0.5 ${toast.type === 'warning' ? 'text-amber-900' : 'text-white'}`}>{toast.title}</h4>
                <p className={`text-[11px] font-medium ${toast.type === 'warning' ? 'text-amber-700' : 'text-slate-400'}`}>{toast.subtitle}</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}