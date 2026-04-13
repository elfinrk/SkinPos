"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Wallet, ClipboardList, FileSearch, LogOut, TrendingUp, CheckCircle2, 
  XCircle, Search, Clock, AlertCircle, Users, Receipt, CalendarCheck, 
  Banknote, Download, Info
} from "lucide-react";

import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// Database Dummy Karyawan untuk Payroll
const STAFF_DB = [
  { id: "ST-001", name: "Siska", role: "Therapist", basicSalary: 3500000 },
  { id: "ST-002", name: "Rina", role: "Therapist", basicSalary: 3500000 },
  { id: "ST-003", name: "Amelia", role: "Cashier", basicSalary: 3200000 },
];

export default function FatPayrollDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"keuangan" | "payroll" | "log" | "void">("keuangan");
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- KEAMANAN ---
  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const role = sessionStorage.getItem("userRole");
    if (isAuth !== "true" || role !== "fat") {
      router.replace("/"); 
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // --- SINKRONISASI DATA REAL-TIME ---
  useEffect(() => {
    if (!isAuthorized) return;
    const sync = () => {
      const saved = localStorage.getItem("skinpos_orders");
      if (saved) setOrders(JSON.parse(saved));
    };
    sync();
    const interval = setInterval(sync, 1000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  // --- LOGIKA PERHITUNGAN FAT ---
  const completed = orders.filter(o => o.status === "completed");
  const voided = orders.filter(o => o.status === "voided");
  const revenue = completed.reduce((sum, o) => sum + o.grandTotal, 0);
  const potentialLoss = voided.reduce((sum, o) => sum + o.grandTotal, 0);

  // Hitung Bonus Terapis (Misal 5% dari setiap treatment yang mereka tangani)
  // Data therapist didapat dari database appointments (simulasi)
  const calculateCommission = (staffName: string) => {
    // Simulasi: Terapis mendapatkan 50rb per treatment yang completed
    return 50000 * Math.floor(Math.random() * 10); // Hanya simulasi visual
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
             <p className="text-sm text-slate-500 mb-8">Anda akan keluar dari sistem FAT.</p>
             <div className="flex gap-3">
               <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3.5 rounded-2xl font-semibold bg-slate-100 text-slate-500">Batal</button>
               <button onClick={() => { sessionStorage.clear(); router.push("/"); }} className="flex-1 py-3.5 rounded-2xl font-semibold bg-rose-500 text-white shadow-lg shadow-rose-200">Keluar</button>
             </div>
          </div>
        </div>
      )}

      {/* SIDEBAR FAT (IDENTIK DENGAN MANAGER/CASHIER) */}
      <div className="w-72 bg-white flex flex-col h-full border-r border-pink-50 z-20 shadow-[4px_0_24px_rgba(252,165,165,0.1)]">
        <div className="p-8 border-b border-pink-50 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-pink-100 mb-4">F</div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">FAT Dashboard</h1>
          <p className="text-[10px] font-bold text-pink-400 mt-1 uppercase tracking-widest leading-relaxed">Finance & Payroll<br/>Administration</p>
        </div>

        <div className="flex-1 py-6 space-y-1 px-6 overflow-y-auto">
          {[
            { id: "keuangan", icon: TrendingUp, label: "Arus Kas Live" },
            { id: "payroll", icon: Banknote, label: "Gaji & Absensi" },
            { id: "log", icon: ClipboardList, label: "Log Transaksi" },
            { id: "void", icon: FileSearch, label: "Audit Void", count: voided.length },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-pink-50 text-pink-600 shadow-sm border border-pink-100" : "text-slate-400 hover:text-pink-500 hover:bg-pink-50/30"}`}>
              <div className="flex items-center gap-3"><tab.icon size={20} /> {tab.label}</div>
              {tab.count ? <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{tab.count}</span> : null}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-pink-50 bg-white">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex justify-center items-center gap-2 bg-white border border-slate-200 text-slate-400 py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:text-rose-50 hover:border-rose-200 transition-all cursor-pointer"><LogOut size={16} /> Keluar</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative bg-[#FDFBFB]">
        <div className="flex justify-between items-end mb-10 pb-6 border-b border-pink-100">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight capitalize">Portal {activeTab === "keuangan" ? "Keuangan" : activeTab === "payroll" ? "Gaji & Absensi" : activeTab}</h2>
            <p className="text-slate-500 font-medium mt-2">Pusat data finansial Klinik Rosereve Japan.</p>
          </div>
          {activeTab === "payroll" && (
            <button className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-pink-700 transition-all shadow-lg shadow-pink-100 uppercase tracking-widest"><Download size={16}/> Export Payroll</button>
          )}
        </div>

        {/* --- TAB KEUANGAN --- */}
        {activeTab === "keuangan" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-[2rem] border border-white shadow-sm flex flex-col hover:shadow-pink-100 transition-all">
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-3xl w-max mb-6"><TrendingUp size={32}/></div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Kas Masuk (Live)</p>
              <h3 className="text-3xl font-black text-slate-800">Rp {revenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-white shadow-sm flex flex-col hover:shadow-pink-100 transition-all">
              <div className="p-4 bg-rose-50 text-rose-500 rounded-3xl w-max mb-6"><XCircle size={32}/></div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Loss (Voided Value)</p>
              <h3 className="text-3xl font-black text-rose-600">Rp {potentialLoss.toLocaleString('id-ID')}</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-white shadow-sm flex flex-col hover:shadow-pink-100 transition-all">
              <div className="p-4 bg-pink-50 text-pink-500 rounded-3xl w-max mb-6"><Receipt size={32}/></div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Transaksi Selesai</p>
              <h3 className="text-3xl font-black text-slate-800">{completed.length} <span className="text-sm font-bold text-slate-400">Invoice</span></h3>
            </div>
          </div>
        )}

        {/* --- TAB PAYROLL & ABSENSI (FITUR UTAMA BARU) --- */}
        {activeTab === "payroll" && (
          <div className="bg-white rounded-[2.5rem] border border-white shadow-sm overflow-hidden animate-in fade-in">
            <table className="w-full text-left">
              <thead className="bg-pink-50/20 border-b border-slate-50"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="p-6">Data Karyawan</th><th className="p-6">Status Absensi</th><th className="p-6 text-right">Gaji Pokok</th><th className="p-6 text-right">Bonus/Insentif</th><th className="p-6 text-right">Take Home Pay</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {STAFF_DB.map((staff) => (
                  <tr key={staff.id} className="hover:bg-pink-50/10 transition-colors group">
                    <td className="p-6">
                      <p className="text-base font-bold text-slate-800">{staff.name}</p>
                      <p className="text-[10px] font-bold text-pink-500 uppercase">{staff.role} • {staff.id}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-max border border-emerald-100"><CalendarCheck size={14}/> Hadir: 24/26 Hari</div>
                    </td>
                    <td className="p-6 text-right font-bold text-slate-600">Rp {staff.basicSalary.toLocaleString()}</td>
                    <td className="p-6 text-right">
                      <div className="text-sm font-bold text-emerald-500">+ Rp {calculateCommission(staff.name).toLocaleString()}</div>
                      <p className="text-[9px] text-slate-400">Berdasarkan Performance</p>
                    </td>
                    <td className="p-6 text-right">
                      <p className="text-lg font-black text-slate-800">Rp {(staff.basicSalary + calculateCommission(staff.name)).toLocaleString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB LOG & VOID --- */}
        {(activeTab === "log" || activeTab === "void") && (
          <div className="bg-white rounded-[2.5rem] border border-white shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <div className="relative group w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
                <input type="text" placeholder="Cari ID Transaksi..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pink-100 transition-all" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {(activeTab === "log" ? orders : voided).length} Data</p>
            </div>
            <table className="w-full text-left">
              <thead className="bg-pink-50/20 border-b border-slate-50"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="p-6">ID & Waktu</th><th className="p-6">Pelanggan</th><th className="p-6">Status Keuangan</th><th className="p-6 text-right">Nominal</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {(activeTab === "log" ? orders : voided).filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase())).map((o) => (
                  <tr key={o.id} className="hover:bg-pink-50/10 transition-colors">
                    <td className="p-6 font-bold text-slate-800"><div>{o.id}</div><div className="text-[10px] text-slate-400 font-medium">{o.time}</div></td>
                    <td className="p-6 text-sm font-bold text-slate-600">{o.member ? o.member.name : "Pelanggan Umum"}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${o.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {o.status === 'completed' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} {o.status}
                      </span>
                    </td>
                    <td className="p-6 text-right font-black text-slate-800 text-lg">Rp {o.grandTotal.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}