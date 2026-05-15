"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Wallet, ClipboardList, FileSearch, LogOut, TrendingUp, CheckCircle2, 
  XCircle, Search, Clock, Users, Receipt, CalendarCheck, 
  Banknote, FileDown, ArrowUpRight, PieChart, 
  Zap, FileSpreadsheet, Info, FileWarning
} from "lucide-react";

import { Plus_Jakarta_Sans } from "next/font/google";
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"] 
});

const INITIAL_STAFF = [
  { id: "EMP-01", name: "Siska", role: "Terapis Senior", salary: 4200000, attend: 26, status: "pending" },
  { id: "EMP-02", name: "Rina", role: "Terapis Junior", salary: 3850000, attend: 24, status: "pending" },
  { id: "EMP-03", name: "Elberth", role: "Kepala Kasir", salary: 3200000, attend: 25, status: "pending" },
];

export default function FatPayrollDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"keuangan" | "payroll" | "void">("keuangan");
  
  const [orders, setOrders] = useState<any[]>([]);
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', title: string, subtitle: string} | null>(null);

  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const role = sessionStorage.getItem("userRole");
    if (isAuth !== "true" || role !== "fat") {
      router.replace("/"); 
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    const sync = () => {
      const saved = localStorage.getItem("skinpos_orders");
      if (saved) setOrders(JSON.parse(saved));
    };
    sync();
    const interval = setInterval(sync, 2000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePayStaff = (id: string) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: "paid" } : s));
    showToast("success", "Pembayaran Sukses", "Gaji staf telah berhasil dicairkan dan dicatat dalam buku kas.");
  };

  const completedOrders = orders.filter(o => o.status === "completed");
  const voidedOrders = orders.filter(o => o.status === "voided");
  const revenue = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const potentialLoss = voidedOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#F4F7FA] text-slate-800 overflow-hidden ${jakarta.className}`}>
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white flex flex-col h-full shrink-0 border-r border-slate-200 z-20">
        
        {/* LOGO AREA */}
        <div className="h-24 flex items-center px-8 border-b border-slate-100 shrink-0">
          <img 
            src="image_b6c0b9.png" 
            alt="Logo" 
            className="w-10 h-10 mr-3 object-contain drop-shadow-sm" 
          />
          <span className="font-extrabold text-slate-800 text-xl tracking-tight">
            FAT<span className="text-[#FF0055]">.</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Keuangan & Pajak</p>
          {[
            { id: "keuangan", icon: Wallet, label: "Laporan Keuangan" },
            { id: "payroll", icon: Banknote, label: "Penggajian" },
            { id: "void", icon: FileSearch, label: "Audit Pembatalan" },
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
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7FA]">
        
        {/* HEADER */}
        <header className="h-24 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-800 tracking-tight capitalize">
               {activeTab === "keuangan" ? "Arus Kas & Keuangan" : activeTab === "payroll" ? "Manajemen Penggajian" : "Audit Kas & Pembatalan"}
            </h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
               Departemen Keuangan & HRD
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 flex items-center gap-3 shadow-sm">
                <span className="text-[12px] font-bold text-slate-700 tracking-wide">Periode: {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-[#FF0055] text-sm">F</div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          
          {/* TAB 1: KEUANGAN (REVENUE) */}
          {activeTab === "keuangan" && (
            <div className="h-full p-10 overflow-y-auto animate-in fade-in duration-300">
               
               <div className="flex justify-end gap-3 mb-6">
                  <button onClick={() => showToast("success", "Unduh Buku Kas", "Data kas sedang diunduh (Excel).")} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm">
                     <FileSpreadsheet size={16} /> Unduh Buku Kas (XLS)
                  </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                     <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                              <Zap size={24} />
                           </div>
                           <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Total Pendapatan Kotor</p>
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-8">
                           Rp{revenue.toLocaleString('id-ID')}
                        </h3>
                        <div className="flex gap-10 pt-6 border-t border-slate-100">
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pertumbuhan</p>
                              <div className="flex items-center text-emerald-500 font-black text-lg"><ArrowUpRight size={20} className="mr-1"/> 24.5%</div>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Volume Transaksi</p>
                              <div className="text-slate-800 font-black text-lg">{completedOrders.length} Struk</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-lg relative overflow-hidden text-white flex flex-col justify-between">
                     <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                           <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 border border-rose-500/30">
                              <XCircle size={24} />
                           </div>
                           <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Potensi Kehilangan (Batal)</p>
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tighter mb-4">
                           Rp{potentialLoss.toLocaleString('id-ID')}
                        </h3>
                        <p className="text-slate-400 text-xs font-medium">Nilai uang dari {voidedOrders.length} transaksi yang dibatalkan oleh kasir hari ini.</p>
                     </div>
                     <button onClick={() => setActiveTab("void")} className="w-full mt-6 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#FF0055] hover:text-white transition-all shadow-sm">
                        Audit Pembatalan
                     </button>
                  </div>
               </div>

               {/* Transaksi Terbaru */}
               <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 bg-white">
                     <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-widest">Catatan Transaksi Masuk Terakhir</h3>
                  </div>
                  <div className="p-6">
                     {completedOrders.length === 0 ? (
                        <p className="text-center text-sm font-semibold text-slate-400 py-6">Belum ada dana masuk.</p>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {completedOrders.slice(0, 6).map((o) => {
                             let timeStr = o.time;
                             if(timeStr && (timeStr.includes("PM") || timeStr.includes("AM"))) {
                               const [time, modifier] = timeStr.split(' ');
                               let [hours, minutes] = time.split(':');
                               if (hours === '12') hours = '00';
                               if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
                               timeStr = `${hours}.${minutes}`;
                             } else if (timeStr) {
                               timeStr = timeStr.replace(':', '.');
                             }

                             return (
                             <div key={o.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                               <div>
                                  <p className="font-black text-slate-800 text-sm">{o.id}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{timeStr}</p>
                               </div>
                               <p className="font-black text-[#FF0055] text-[15px]">Rp{o.grandTotal.toLocaleString('id-ID')}</p>
                             </div>
                           )})}
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {/* TAB 2: PAYROLL & GAJI */}
          {activeTab === "payroll" && (
            <div className="h-full p-10 overflow-y-auto animate-in fade-in duration-300 bg-[#F4F7FA]">
               <div className="flex justify-between items-center mb-8">
                  <p className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-xl">Jadwal Penggajian: Tanggal 25 Setiap Bulan</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {staffList.map((staff) => (
                     <div key={staff.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col group">
                        <div className="flex items-center gap-5 mb-8">
                           <div className="w-16 h-16 bg-slate-100 rounded-[1.25rem] flex items-center justify-center font-black text-slate-400 text-2xl group-hover:bg-[#FF0055] group-hover:text-white transition-colors duration-300 shadow-sm border border-slate-200">
                              {staff.name[0]}
                           </div>
                           <div>
                              <h3 className="text-lg font-black text-slate-800 tracking-tight">{staff.name}</h3>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{staff.role}</span>
                           </div>
                        </div>
                        
                        <div className="space-y-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                           <div className="flex justify-between text-sm items-center">
                              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Absensi/Hadir</span>
                              <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{staff.attend}/26 Hari</span>
                           </div>
                           <div className="flex justify-between items-end pt-2 border-t border-slate-200/60">
                              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Gaji Bersih</span>
                              <span className="font-black text-xl text-slate-900">Rp{staff.salary.toLocaleString('id-ID')}</span>
                           </div>
                        </div>
                        
                        <div className="mt-auto">
                           {staff.status === "paid" ? (
                              <div className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-100">
                                 <CheckCircle2 size={16}/> Selesai Dibayarkan
                              </div>
                           ) : (
                              <button onClick={() => handlePayStaff(staff.id)} className="w-full py-4 bg-slate-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FF0055] transition-all shadow-md">
                                 Konfirmasi Pencairan
                              </button>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* TAB 3: AUDIT PEMBATALAN */}
          {activeTab === "void" && (
            <div className="h-full p-10 overflow-y-auto animate-in fade-in duration-300 bg-[#F4F7FA]">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h2 className="text-xl font-extrabold text-slate-800">Catatan Investigasi Pembatalan</h2>
                     <p className="text-xs font-semibold text-slate-500 mt-1">Laporan transaksi batal yang telah diotorisasi.</p>
                  </div>
                  <button onClick={() => showToast("success", "Unduh PDF Siap", "Laporan audit sedang diunduh.")} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#FF0055] transition-all shadow-md">
                     <FileDown size={16} /> Unduh Bukti PDF
                  </button>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[70vh] flex flex-col">
                  {voidedOrders.length === 0 ? (
                     <div className="flex flex-col items-center justify-center flex-1 text-slate-300">
                        <FileWarning size={64} className="mb-4 opacity-30" strokeWidth={1.5} />
                        <p className="font-bold tracking-[0.2em] uppercase text-xs opacity-70">Aman! Tidak ada indikasi pembatalan.</p>
                     </div>
                  ) : (
                     <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left">
                           <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                 <th className="px-8 py-5">Identitas Nota</th>
                                 <th className="px-8 py-5">Isi Pesanan (Varian)</th>
                                 <th className="px-8 py-5 text-right">Nilai Tagihan (Minus)</th>
                                 <th className="px-8 py-5">Keterangan Otorisasi</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {voidedOrders.map((order, idx) => {
                                 let timeStr = order.time;
                                 if(timeStr && (timeStr.includes("PM") || timeStr.includes("AM"))) {
                                    const [time, modifier] = timeStr.split(' ');
                                    let [hours, minutes] = time.split(':');
                                    if (hours === '12') hours = '00';
                                    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
                                    timeStr = `${hours}.${minutes}`;
                                 } else if (timeStr) {
                                    timeStr = timeStr.replace(':', '.');
                                 }

                                 return (
                                 <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                       <span className="font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded text-[12px]">{order.id}</span>
                                       <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5"><Clock size={12}/> {timeStr}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                       <div className="space-y-1">
                                          {order.items.map((it:any, i:number) => (
                                             <p key={i} className="text-xs font-bold text-slate-600">{it.qty} Produk / Pcs {it.name} <span className="font-medium text-slate-400">({it.variant || 'Normal'})</span></p>
                                          ))}
                                       </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-slate-800 text-[15px]">
                                       - Rp{order.grandTotal.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-8 py-6">
                                       <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg inline-block mb-1">BATAL</span>
                                       <p className="text-[10px] font-bold text-slate-400 italic mt-1">Alasan: "{order.voidReason || 'Ditolak'}"</p>
                                    </td>
                                 </tr>
                              )})}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            </div>
          )}

        </div>

        {/* MODAL LOGOUT CONFIRM */}
        {showLogoutConfirm && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in">
             <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl text-center border border-slate-100">
                <div className="w-20 h-20 bg-rose-50 text-[#FF0055] rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={36}/></div>
                <h2 className="text-2xl font-black text-slate-800 mb-4">Keluar?</h2>
                <p className="text-[12px] font-bold text-slate-500 mb-10 leading-relaxed uppercase tracking-wider">Anda akan keluar dari Portal Keuangan.</p>
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
              {toast.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={24} /> : toast.type === 'error' ? <XCircle className="text-rose-500" size={24} /> : <Info className="text-blue-400" size={24} />}
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