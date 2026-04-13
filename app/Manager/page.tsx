"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShieldAlert, TrendingUp, Receipt, Users, 
  LogOut, CheckCircle2, Clock, RefreshCw, LockKeyhole,
  XCircle, Trash2, History, Info, FileWarning
} from "lucide-react";

import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function ManagerDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "voids" | "history">("dashboard");
  const [dynamicPin, setDynamicPin] = useState("------");
  const [countdown, setCountdown] = useState(60);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', title: string, subtitle: string} | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showToast = (type: 'success' | 'error' | 'info', title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  // --- KEAMANAN & PROTEKSI ---
  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const role = sessionStorage.getItem("userRole");
    if (isAuth !== "true" || role !== "manager") {
      router.replace("/"); 
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // --- SINKRONISASI DATA ---
  useEffect(() => {
    if (!isAuthorized) return;
    const syncData = () => {
      const savedOrders = localStorage.getItem("skinpos_orders");
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    };
    syncData(); 
    const interval = setInterval(syncData, 1000); 
    return () => clearInterval(interval);
  }, [isAuthorized]);

  // --- PIN GENERATOR ---
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

  // --- AKSI MANAGER ---
  const handleTolakPesanan = (orderId: string) => {
    if (window.confirm(`Yakin ingin MENOLAK pesanan ${orderId}?`)) {
      const orderToVoid = orders.find(o => o.id === orderId);
      if(orderToVoid) {
        const currentInvRaw = localStorage.getItem("skinpos_inventory");
        if(currentInvRaw) {
          let currentInv = JSON.parse(currentInvRaw);
          const updatedInv = currentInv.map((item: any) => {
            const voidedItem = orderToVoid.items.find((c: any) => c.id === item.id);
            if (voidedItem) return { ...item, stock: item.stock + voidedItem.qty };
            return item;
          });
          localStorage.setItem("skinpos_inventory", JSON.stringify(updatedInv));
        }
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: "voided" } : o);
        setOrders(updatedOrders);
        localStorage.setItem("skinpos_orders", JSON.stringify(updatedOrders));
        showToast("success", "Pesanan Ditolak", "Stok telah dikembalikan ke kasir.");
      }
    }
  };

  const completedOrders = orders.filter(o => o.status === "completed");
  const voidedOrders = orders.filter(o => o.status === "voided");
  const pendingOrders = orders.filter(o => o.status === "pending");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#FDFBFB] font-sans text-slate-700 overflow-hidden ${montserrat.className}`}>
      
      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] w-[380px] shadow-2xl border border-pink-50 text-center animate-in zoom-in-95">
             <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6"><LogOut size={32} className="text-rose-400" /></div>
             <h2 className="text-xl font-bold mb-2 text-slate-800">Akhiri Sesi?</h2>
             <p className="text-sm text-slate-500 mb-8">Sesi Anda akan berakhir.</p>
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
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Manager </h1>
          <p className="text-[10px] font-bold text-pink-400 mt-1 uppercase tracking-widest leading-relaxed text-center">Rosereve Japan<br/>Supervision</p>
        </div>
        <div className="flex-1 py-6 space-y-1 px-6 overflow-y-auto">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard Live" },
            { id: "voids", icon: ShieldAlert, label: "Antrean Kasir", count: pendingOrders.length },
            { id: "history", icon: History, label: "Riwayat Penjualan" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-pink-50 text-pink-600 shadow-sm border border-pink-100" : "text-slate-400 hover:text-pink-500 hover:bg-pink-50/30"}`}>
              <div className="flex items-center gap-3"><tab.icon size={20} /> {tab.label}</div>
              {tab.count ? <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{tab.count}</span> : null}
            </button>
          ))}
        </div>

        {/* KOTAK PIN (IDENTIK DENGAN MANAGER AWAL TAPI UI LEBIH RAPI) */}
        <div className="m-6 p-6 rounded-[2rem] border border-pink-100 bg-pink-50/30 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 text-pink-200/20"><LockKeyhole size={80} /></div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest flex items-center gap-2 mb-3"><RefreshCw size={12} className={countdown < 5 ? "animate-spin" : ""} /> Live Void PIN</p>
            <div className="bg-white px-4 py-3 rounded-2xl border border-pink-100 flex items-center justify-center mb-4">
              <h2 className="text-3xl font-black text-slate-800 tracking-[0.25em] ml-2 font-mono">{dynamicPin}</h2>
            </div>
            <div className="w-full bg-white rounded-full h-1 mb-2 overflow-hidden"><div className={`h-1 transition-all duration-1000 ${countdown < 10 ? "bg-rose-500" : "bg-pink-500"}`} style={{ width: `${(countdown / 60) * 100}%` }}></div></div>
            <p className="text-[9px] font-bold text-center uppercase text-slate-400">Kedaluwarsa {countdown}s</p>
          </div>
        </div>

        <div className="p-6 border-t border-pink-50 bg-white">
           <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex justify-center items-center gap-2 bg-white border border-slate-200 text-slate-400 py-3.5 rounded-xl text-xs font-bold hover:text-rose-50 hover:border-rose-200 transition-all cursor-pointer"><LogOut size={16} /> Keluar</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative bg-[#FDFBFB]">
        <div className="flex justify-between items-end mb-10 pb-6 border-b border-pink-100">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight capitalize">{activeTab === "dashboard" ? "Dashboard Live" : activeTab === "voids" ? "Live Antrean Kasir" : "Riwayat Penjualan"}</h2>
            <p className="text-slate-500 font-medium mt-2">Portal pengawasan operasional klinik.</p>
          </div>
        </div>

        {/* --- TAB DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-pink-100/50 transition-all">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl w-max mb-4"><TrendingUp size={24}/></div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Omzet Live</p>
              <h3 className="text-2xl font-black text-slate-800">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-pink-100/50 transition-all">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl w-max mb-4"><Receipt size={24}/></div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Transaksi Sukses</p>
              <h3 className="text-2xl font-black text-slate-800">{completedOrders.length} <span className="text-sm font-semibold text-slate-400">Struk</span></h3>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-pink-100/50 transition-all">
              <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl w-max mb-4"><ShieldAlert size={24}/></div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Void</p>
              <h3 className="text-2xl font-black text-slate-800">{voidedOrders.length} <span className="text-sm font-semibold text-slate-400">Kasus</span></h3>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-pink-100/50 transition-all">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl w-max mb-4"><Users size={24}/></div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Kasir Aktif</p>
              <h3 className="text-2xl font-black text-slate-800">{pendingOrders.length} <span className="text-sm font-semibold text-slate-400">Antrean</span></h3>
            </div>
          </div>
        )}

        {/* --- TAB ANTREAN --- */}
        {activeTab === "voids" && (
          <div className="bg-white rounded-[2.5rem] border border-white shadow-sm overflow-hidden animate-in fade-in duration-300">
            {pendingOrders.length === 0 ? (
              <div className="p-20 text-center text-slate-300">
                <CheckCircle2 size={64} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold tracking-widest uppercase text-sm">Tidak ada antrean</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-pink-50/20 border-b border-slate-50"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="p-6">Waktu & ID</th><th className="p-6">Detail Pesanan</th><th className="p-6 text-right">Total</th><th className="p-6 text-center">Tindakan</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {pendingOrders.map(order => (
                    <tr key={order.id} className="hover:bg-pink-50/10 transition-colors">
                      <td className="p-6"><span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-pink-50 text-pink-600">{order.id}</span><p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1"><Clock size={12}/> {order.time}</p></td>
                      <td className="p-6">{order.items.map((it: any, i: number) => <p key={i} className="text-xs font-bold text-slate-600">{it.qty}x {it.name}</p>)}</td>
                      <td className="p-6 text-right font-black text-slate-800">Rp {order.grandTotal.toLocaleString()}</td>
                      <td className="p-6 text-center"><button onClick={() => handleTolakPesanan(order.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* --- TAB RIWAYAT --- */}
        {activeTab === "history" && (
          <div className="bg-white rounded-[2.5rem] border border-white shadow-sm overflow-hidden animate-in fade-in duration-300">
            {completedOrders.length === 0 && voidedOrders.length === 0 ? (
              <div className="p-20 text-center text-slate-300">
                <FileWarning size={64} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold tracking-widest uppercase text-sm">Belum ada riwayat</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-pink-50/20 border-b border-slate-50"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="p-6">ID Pesanan</th><th className="p-6">Pelanggan</th><th className="p-6 text-right">Nilai</th><th className="p-6 text-center">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {[...completedOrders, ...voidedOrders].map((order, idx) => (
                    <tr key={`${order.id}-${idx}`} className="hover:bg-pink-50/10 transition-colors">
                      <td className="p-6"><span className="font-bold text-slate-800">{order.id}</span><p className="text-[10px] text-slate-400">{order.time}</p></td>
                      <td className="p-6"><span className="text-sm font-bold text-slate-600">{order.member ? order.member.name : "Pelanggan Umum"}</span></td>
                      <td className="p-6 text-right font-black text-slate-800">Rp {order.grandTotal.toLocaleString()}</td>
                      <td className="p-6 text-center">{order.status === "completed" ? <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-emerald-100">Sukses</span> : <span className="bg-rose-50 text-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-rose-100">Void</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}