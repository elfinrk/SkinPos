"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, ShieldAlert, TrendingUp, Receipt, Users, 
  LogOut, CheckCircle2, Clock, RefreshCw, LockKeyhole,
  XCircle, Trash2, History, Info, FileWarning, HelpCircle,
  FileDown, FileSpreadsheet, Flame, ClipboardList, UsersRound, 
  CalendarRange, UserCheck, AlertTriangle, PanelLeftClose, PanelLeftOpen, Check, Package, PackagePlus
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

const isService = (item: any) => item.type === "Layanan" || item.type === "Service" || item.type === "Treatment";
const formatRupiah = (number: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function ManagerDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "voids" | "history" | "audit" | "shifts">("dashboard");
  const [dateFilter, setDateFilter] = useState("today");
  
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [shiftReports, setShiftReports] = useState<any[]>([]);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info' | 'warning', title: string, subtitle: string} | null>(null);

  const [voidPromptTarget, setVoidPromptTarget] = useState<string | null>(null);
  const [voidReasonInput, setVoidReasonInput] = useState("Salah input kasir");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

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
      setShiftReports(JSON.parse(localStorage.getItem("skinpos_shift_reports") || "[]"));
    };
    syncData(); 
    const interval = setInterval(syncData, 2000); 
    window.addEventListener("storage", syncData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncData);
    };
  }, [isAuthorized]);

  // FUNGSI BATAL SEPIHAK (MANAGER FORCE VOID)
  const handleTolakPesanan = (orderId: string) => {
    setVoidPromptTarget(orderId);
    setVoidReasonInput("Dibatalkan sepihak oleh Manager");
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
      showToast("success", "Pesanan Dibatalkan", "Status diubah menjadi Batal dan stok dikembalikan.");
    }
    setVoidPromptTarget(null);
  };

  // FUNGSI ACC VOID DARI KASIR
  const handleAccVoid = (orderId: string) => {
    const orderToVoid = orders.find(o => o.id === orderId);
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
      
      const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: "voided" } : o);
      setOrders(updatedOrders);
      localStorage.setItem("skinpos_orders", JSON.stringify(updatedOrders));
      showToast("success", "Permintaan Disetujui", "Pesanan resmi dibatalkan dan stok telah kembali.");
    }
  };

  // FUNGSI TOLAK VOID DARI KASIR
  const handleRejectVoid = (orderId: string) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: "pending", voidReason: "" } : o);
    setOrders(updatedOrders);
    localStorage.setItem("skinpos_orders", JSON.stringify(updatedOrders));
    showToast("warning", "Permintaan Ditolak", "Pesanan dikembalikan ke antrean Kasir.");
  };

  /* ───────── EXPORT PDF NATIVE ───────── */
  const handleExportPDF = () => {
    const allHistory = [...completedOrders, ...voidedOrders];
    if (allHistory.length === 0) {
      showToast("error", "Data Kosong", "Belum ada transaksi untuk dicetak.");
      return;
    }
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;
    
    const rowsHtml = allHistory.map(order => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">${order.id}</td>
        <td style="padding: 10px;">${order.time || ""}</td>
        <td style="padding: 10px;">${order.member ? order.member.name : "Umum"}</td>
        <td style="padding: 10px; font-weight: bold;">${formatRupiah(order.grandTotal)}</td>
        <td style="padding: 10px;">
          <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; background: ${order.status === "completed" ? "#e6f4ea; color: #137333" : "#fce8e6; color: #c5221f"}">
            ${order.status === "completed" ? "Selesai" : "Batal"}
          </span>
          ${order.voidReason ? `<span style="font-size: 10px; color: #888; display: block; margin-top: 4px;">"${order.voidReason}"</span>` : ""}
        </td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Transaksi SkinPOS</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
            h1 { text-align: center; font-size: 24px; margin-bottom: 5px; }
            .subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th { background: #f8f9fa; padding: 12px 10px; font-weight: bold; text-align: left; border-bottom: 2px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>ESTHETIC ROSEREVE JAPAN</h1>
          <div class="subtitle">Laporan Transaksi Penjualan - SkinPOS System</div>
          <table>
            <thead>
              <tr>
                <th>ID Pesanan</th>
                <th>Waktu</th>
                <th>Pelanggan</th>
                <th>Nilai Tagihan</th>
                <th>Status & Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast("success", "Print PDF", "Tab cetak laporan telah dibuka.");
  };

  /* ───────── EXPORT EXCEL (CSV) ───────── */
  const handleExportExcel = () => {
    const allHistory = [...completedOrders, ...voidedOrders];
    if (allHistory.length === 0) {
      showToast("error", "Data Kosong", "Belum ada transaksi untuk diexport.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Pesanan,Waktu,Pelanggan,Nilai Tagihan,Status,Keterangan\n";
    
    allHistory.forEach(order => {
      const id = order.id;
      const time = order.time || "";
      const memberName = order.member ? order.member.name : "Umum";
      const grandTotal = order.grandTotal;
      const status = order.status === "completed" ? "Selesai" : "Batal";
      const reason = order.voidReason ? `"${order.voidReason.replace(/"/g, '""')}"` : "";
      
      csvContent += `${id},${time},${memberName},${grandTotal},${status},${reason}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Transaksi_SkinPOS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Export Excel", "File Excel (.csv) berhasil diunduh.");
  };

  const completedOrders = orders.filter(o => o.status === "completed");
  const voidedOrders = orders.filter(o => o.status === "voided");
  const pendingOrders = orders.filter(o => o.status === "pending");
  const voidRequests = orders.filter(o => o.status === "pending_void");
  
  const activeQueue = [...pendingOrders, ...voidRequests];
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  // Business metrics
  const productRev = completedOrders.reduce((sum, o) => {
    const factor = o.member ? (1 - o.member.discount) : 1;
    return sum + o.items.filter((it: any) => !isService(it)).reduce((s: number, it: any) => s + (it.price * it.qty * factor), 0);
  }, 0);
  const serviceRev = Math.max(0, totalRevenue - productRev);

  const vipSales = completedOrders.filter(o => o.member).reduce((sum, o) => sum + o.grandTotal, 0);
  const umumSales = Math.max(0, totalRevenue - vipSales);

  const aov = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#F4F7FA] text-slate-800 overflow-hidden ${jakarta.className}`}>
      
      {/* SIDEBAR DENGAN TRANSISI BUKA TUTUP */}
      <aside className={`bg-white flex flex-col h-full shrink-0 border-r border-slate-200 z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[260px]" : "w-0 opacity-0 overflow-hidden border-none"}`}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[#FF0055] flex items-center justify-center shadow-lg shadow-rose-500/20 mr-3">
            <LayoutDashboard size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-slate-800 text-xl tracking-tight whitespace-nowrap">Manager<span className="text-[#FF0055]">.</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto scrollbar-hide w-[260px]">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Akses Supervisi</p>
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Analisis Bisnis" },
            { id: "voids", icon: ShieldAlert, label: "Live Antrean", count: activeQueue.length },
            { id: "history", icon: History, label: "Riwayat & Laporan" },
            { id: "shifts", icon: Clock, label: "Laporan Shift Kasir" },
            { id: "audit", icon: ClipboardList, label: "Audit Stok" }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeTab === tab.id ? "bg-[#FF0055] text-white shadow-lg shadow-rose-500/25" : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? "text-white" : "text-slate-400"} />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.count ? <span className={`ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-rose-50 text-[#FF0055]'}`}>{tab.count}</span> : null}
            </button>
          ))}

          <div className="mt-8 mx-2 mb-4 p-5 rounded-2xl bg-amber-50 border border-amber-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-3 -mt-3 text-amber-200/50"><AlertTriangle size={80} /></div>
             <div className="relative z-10">
               <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">Request Batal</p>
               <h2 className="text-3xl font-black text-amber-600 mb-1">{voidRequests.length}</h2>
               <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Menunggu ACC</p>
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
             <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 pl-3 pr-4 py-1.5 rounded-full">
               <div className="w-8 h-8 rounded-full bg-[#FF0055] flex items-center justify-center text-white shrink-0">
                 <Users size={16} />
               </div>
               <div className="text-left hidden md:block">
                 <p className="text-[11px] font-black text-slate-800 leading-none">Manager</p>
                 <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-none">SkinPOS</p>
               </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {/* TAB DASHBOARD */}
          {activeTab === "dashboard" && (
             <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in duration-300 bg-[#F4F7FA]">
                {/* 3 Metric Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   {/* Card 1: Revenue */}
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl"><TrendingUp size={20}/></div>
                         <div>
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Penjualan Bersih</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Pendapatan Bersih</p>
                         </div>
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-4 tracking-tight">{formatRupiah(totalRevenue)}</h2>
                      <div className="pt-3 border-t border-slate-100 flex justify-between text-[11px] font-bold text-slate-500">
                         <span>Sukses: <span className="text-emerald-600 font-extrabold">{completedOrders.length}</span></span>
                         <span>Batal: <span className="text-rose-500 font-extrabold">{voidedOrders.length}</span></span>
                      </div>
                   </div>

                   {/* Card 2: AOV */}
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl"><Receipt size={20}/></div>
                         <div>
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Rata-rata Transaksi</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">AOV (Average Order Value)</p>
                         </div>
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-4 tracking-tight">{formatRupiah(aov)}</h2>
                      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
                         Rata-rata belanja per struk transaksi
                      </div>
                   </div>

                   {/* Card 3: Cashier Shift */}
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2.5 bg-rose-50 text-[#FF0055] rounded-xl"><Users size={20}/></div>
                         <div>
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Kasir Shift Aktif</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Kasir Aktif POS</p>
                         </div>
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-4 tracking-tight">Kasir Aktif</h2>
                      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-bold flex justify-between">
                         <span>Dilayani: <span className="text-[#FF0055] font-extrabold">{completedOrders.length + activeQueue.length}</span></span>
                         <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">Aktif</span>
                      </div>
                   </div>
                </div>

                {/* 2 Column Details Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   {/* Column 1: Share Distribution & Stats */}
                   <div className="space-y-6">
                      {/* Layanan vs Produk Widget */}
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                         <div className="flex justify-between items-center mb-6">
                            <div>
                               <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">Kontribusi Penjualan</h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Layanan vs Produk Retail</p>
                            </div>
                            <span className="text-[10px] font-black text-[#FF0055] bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">Revenue Share</span>
                         </div>
                         
                         <div className="space-y-4">
                            {/* Visual Progress Bar */}
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                               <div
                                  style={{ width: `${totalRevenue > 0 ? (serviceRev / totalRevenue) * 100 : 50}%` }}
                                  className="h-full bg-[#FF0055]"
                                  title="Layanan"
                               />
                               <div
                                  style={{ width: `${totalRevenue > 0 ? (productRev / totalRevenue) * 100 : 50}%` }}
                                  className="h-full bg-emerald-500"
                                  title="Produk"
                               />
                            </div>
                            
                            {/* Legend & Amounts */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                     <div className="w-2.5 h-2.5 rounded-full bg-[#FF0055]" />
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Layanan</span>
                                  </div>
                                  <p className="text-[15px] font-black text-slate-800">{formatRupiah(serviceRev)}</p>
                                  <p className="text-[10px] font-bold text-[#FF0055] mt-0.5">
                                     {totalRevenue > 0 ? Math.round((serviceRev / totalRevenue) * 100) : 0}% Porsi
                                  </p>
                               </div>
                               
                               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produk</span>
                                  </div>
                                  <p className="text-[15px] font-black text-slate-800">{formatRupiah(productRev)}</p>
                                  <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                                     {totalRevenue > 0 ? Math.round((productRev / totalRevenue) * 100) : 0}% Porsi
                                  </p>
                                </div>
                            </div>
                         </div>
                      </div>

                      {/* VIP vs Umum Widget */}
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                         <div className="flex justify-between items-center mb-6">
                            <div>
                               <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">Demografi Pelanggan</h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">VIP Member vs Pelanggan Umum</p>
                            </div>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Customer Share</span>
                         </div>
                         
                         <div className="space-y-4">
                            {/* Visual Progress Bar */}
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                               <div
                                  style={{ width: `${totalRevenue > 0 ? (vipSales / totalRevenue) * 100 : 50}%` }}
                                  className="h-full bg-blue-600"
                                  title="VIP Member"
                               />
                               <div
                                  style={{ width: `${totalRevenue > 0 ? (umumSales / totalRevenue) * 100 : 50}%` }}
                                  className="h-full bg-slate-400"
                                  title="Pelanggan Umum"
                               />
                            </div>
                            
                            {/* Legend & Amounts */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                     <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VIP Member</span>
                                  </div>
                                  <p className="text-[15px] font-black text-slate-800">{formatRupiah(vipSales)}</p>
                                  <p className="text-[10px] font-bold text-blue-600 mt-0.5">
                                     {totalRevenue > 0 ? Math.round((vipSales / totalRevenue) * 100) : 0}% Porsi
                                  </p>
                               </div>
                               
                               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-1.5 mb-1">
                                     <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pelanggan Umum</span>
                                  </div>
                                  <p className="text-[15px] font-black text-slate-800">{formatRupiah(umumSales)}</p>
                                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                                     {totalRevenue > 0 ? Math.round((umumSales / totalRevenue) * 100) : 0}% Porsi
                                  </p>
                                </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Column 2: Top Products Laris & Stok Kritis */}
                   <div className="space-y-6 flex flex-col h-full">
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-[1rem]"><Flame size={24}/></div>
                            <div>
                               <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">Produk & Layanan Terlaris</h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Peringkat 5 Besar Teratas</p>
                            </div>
                         </div>
                         <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                            {[...inventory].sort((a,b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5).map((item, index) => (
                              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-[#FF0055] hover:shadow-sm">
                                 <div className="flex items-center gap-4">
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>#{index+1}</div>
                                   <div><p className="font-bold text-sm text-slate-800 leading-tight mb-0.5">{item.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isService(item) ? "Layanan" : "Produk"}</p></div>
                                 </div>
                                 <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">{item.sold || 0} Unit</span>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Widget Peringatan Stok Kritis */}
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-rose-50 text-[#FF0055] rounded-[1rem]"><AlertTriangle size={24}/></div>
                            <div>
                               <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">Peringatan Stok Kritis</h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Sisa Persediaan Kurang Dari 5 Unit</p>
                            </div>
                         </div>
                         <div className="space-y-3 pr-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                            {inventory.filter(i => !isService(i) && i.stock < 5).length === 0 ? (
                               <p className="text-center py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-slate-400">Semua stok produk aman.</p>
                            ) : (
                               inventory.filter(i => !isService(i) && i.stock < 5).map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-3.5 bg-rose-50/50 rounded-xl border border-rose-100">
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-[#FF0055]"><Package size={16}/></div>
                                        <div>
                                           <p className="font-bold text-xs text-slate-800 leading-tight mb-0.5">{item.name}</p>
                                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.id}</p>
                                        </div>
                                     </div>
                                     <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-3 py-1 rounded-lg uppercase tracking-wider">Sisa {item.stock}</span>
                                  </div>
                               ))
                            )}
                         </div>
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
                    {activeQueue.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20"><CheckCircle2 size={64} className="mb-4 opacity-30" strokeWidth={1.5} /><p className="font-bold tracking-[0.2em] uppercase text-xs opacity-60">Tidak ada antrean kasir</p></div>
                    ) : (
                      <table className="w-full text-left">
                        <thead><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100"><th className="px-8 py-5">Waktu & ID</th><th className="px-8 py-5">Detail Pesanan</th><th className="px-8 py-5 text-right">Total Tagihan</th><th className="px-8 py-5 text-center">Tindakan Khusus</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeQueue.map(order => (
                            <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${order.status === 'pending_void' ? 'bg-amber-50/30' : ''}`}>
                              <td className="px-8 py-6">
                                 <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black border ${order.status === 'pending_void' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-rose-50 text-[#FF0055] border-rose-100'}`}>{order.id}</span>
                                 <p className="text-[11px] font-semibold text-slate-500 mt-2 flex items-center gap-1.5"><Clock size={12}/> {order.time ? order.time.replace(':', '.') : ''}</p>
                              </td>
                              <td className="px-8 py-6"><div className="space-y-1.5">{order.items.map((it: any, i: number) => (<p key={i} className="text-xs font-bold text-slate-700">{it.qty}x {it.name} <span className="text-slate-400 font-medium">({it.variant || 'Normal'})</span></p>))}</div></td>
                              <td className="px-8 py-6 text-right font-black text-slate-800 text-lg">Rp{order.grandTotal.toLocaleString('id-ID')}</td>
                              <td className="px-8 py-6 text-center">
                                 {order.status === "pending_void" ? (
                                    <div className="flex flex-col gap-2 animate-in zoom-in-95">
                                       <span className="text-[10px] font-bold text-amber-600 mb-1 leading-tight">Alasan:<br/>"{order.voidReason}"</span>
                                       <div className="flex justify-center gap-2">
                                          <button onClick={() => handleRejectVoid(order.id)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all shadow-sm"><XCircle size={14} className="inline mr-1"/> Tolak</button>
                                          <button onClick={() => handleAccVoid(order.id)} className="px-4 py-2 bg-[#FF0055] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#D40048] transition-all shadow-sm"><Check size={14} className="inline mr-1"/> ACC Batal</button>
                                       </div>
                                    </div>
                                 ) : (
                                    <button onClick={() => handleTolakPesanan(order.id)} className="px-4 py-2.5 bg-rose-50 text-[#FF0055] text-[11px] font-bold tracking-wider uppercase rounded-xl hover:bg-[#FF0055] hover:text-white transition-all shadow-sm border border-rose-100 hover:border-transparent flex items-center justify-center gap-2 mx-auto"><Trash2 size={14}/> Batalkan Sepihak</button>
                                 )}
                              </td>
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
                    <button onClick={handleExportPDF} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#FF0055] transition-all shadow-md hover:-translate-y-0.5"><FileDown size={16} /> Unduh PDF</button>
                    <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md hover:-translate-y-0.5"><FileSpreadsheet size={16} /> Data Excel</button>
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
          {activeTab === "audit" && (() => {
             const totalIn = stockLogs.filter(l => l.type === "masuk").reduce((sum, l) => sum + (Number(l.qty) || 0), 0);
             const totalOut = stockLogs.filter(l => l.type === "keluar").reduce((sum, l) => sum + (Number(l.qty) || 0), 0);
             return (
               <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA]">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                     <h2 className="text-xl font-extrabold text-slate-800">Log Audit Inventaris</h2>
                     <p className="text-[11px] text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-full border border-slate-200">Record Terakhir: {stockLogs.length} Entri</p>
                  </div>

                  {/* Audit Metric Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                              <PackagePlus size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Total Stok Masuk</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Penambahan Persediaan</p>
                           </div>
                        </div>
                        <h2 className="text-2xl font-black text-emerald-600">+{totalIn} <span className="text-[10px] text-slate-450 font-bold">unit</span></h2>
                     </div>

                     <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-rose-50 text-[#FF0055] rounded-2xl">
                              <Trash2 size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Total Stok Keluar</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Pengurangan / Penjualan</p>
                           </div>
                        </div>
                        <h2 className="text-2xl font-black text-[#FF0055]">-{totalOut} <span className="text-[10px] text-slate-450 font-bold">unit</span></h2>
                     </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[50vh] flex flex-col">
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
             );
          })()}

          {/* TAB LAPORAN SHIFT */}
          {activeTab === "shifts" && (
            <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA]">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                  <h2 className="text-xl font-extrabold text-slate-800">Laporan Shift & Rekonsiliasi Kasir</h2>
                  <p className="text-[11px] text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                     Total Shift: {shiftReports.length} Rekaman
                  </p>
               </div>
               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[70vh] flex flex-col">
                  <div className="overflow-y-auto flex-1">
                     <table className="w-full text-left">
                       <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                         <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                           <th className="px-8 py-5">Tanggal & Kasir</th>
                           <th className="px-8 py-5 text-right">Modal Awal</th>
                           <th className="px-8 py-5 text-right">Penjualan Tunai</th>
                           <th className="px-8 py-5 text-right">Kas Harapan</th>
                           <th className="px-8 py-5 text-right">Uang Fisik Aktual</th>
                           <th className="px-8 py-5 text-center">Selisih</th>
                           <th className="px-8 py-5">Keterangan</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {shiftReports.length === 0 ? (
                           <tr>
                             <td colSpan={7} className="px-8 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest text-slate-400">
                               Belum ada shift kasir yang ditutup.
                             </td>
                           </tr>
                         ) : (
                           shiftReports.map((report, idx) => (
                             <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-8 py-5">
                                 <span className="font-bold text-slate-800 text-[12px]">{report.date}</span>
                                 <p className="text-[10px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                                   <UserCheck size={10}/> {report.cashierName} ({report.startTime} - {report.endTime})
                                 </p>
                               </td>
                               <td className="px-8 py-5 text-right font-semibold text-[12px] text-slate-700">{formatRupiah(report.initialFloat || 0)}</td>
                               <td className="px-8 py-5 text-right font-semibold text-[12px] text-slate-700">{formatRupiah(report.cashSales || 0)}</td>
                               <td className="px-8 py-5 text-right font-bold text-[12px] text-slate-900">{formatRupiah(report.expectedCash || 0)}</td>
                               <td className="px-8 py-5 text-right font-bold text-[12px] text-slate-900 bg-slate-50/50">{formatRupiah(report.actualCash || 0)}</td>
                               <td className="px-8 py-5 text-center">
                                 {report.discrepancy === 0 ? (
                                   <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg uppercase tracking-wider">Sesuai</span>
                                 ) : report.discrepancy > 0 ? (
                                   <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg uppercase tracking-wider">+{formatRupiah(report.discrepancy)}</span>
                                 ) : (
                                   <span className="text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1 rounded-lg uppercase tracking-wider">-{formatRupiah(Math.abs(report.discrepancy))}</span>
                                 )}
                               </td>
                               <td className="px-8 py-5 text-[11px] font-bold text-slate-500 italic">"{report.note}"</td>
                             </tr>
                           ))
                         )}
                       </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}
        </div>

        {voidPromptTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[900] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setVoidPromptTarget(null)}>
            <div className="bg-white rounded-[2rem] w-full max-w-xs p-6 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <ShieldAlert size={32} className="mx-auto text-[#FF0055] mb-4" />
              <h3 className="text-center font-black text-slate-800 text-md uppercase mb-2">Batal Sepihak</h3>
              <form onSubmit={submitTolakPesanan} className="space-y-4">
                <input type="text" value={voidReasonInput} onChange={(e) => setVoidReasonInput(e.target.value)} placeholder="Alasan batal..." className="w-full text-center text-xs font-bold py-3 bg-[#F8FAFC] rounded-xl border border-slate-200 outline-none focus:border-[#FF0055] focus:bg-white text-slate-700" required autoFocus />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setVoidPromptTarget(null)} className="flex-1 py-2.5 rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 text-xs font-bold">Batal</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#FF0055] text-white hover:bg-[#D40048] text-xs font-bold shadow-md">Batalkan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showHelpCenter && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[800] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowHelpCenter(false)}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <HelpCircle className="mx-auto text-blue-500 mb-4" size={32} />
              <h3 className="text-center font-black text-slate-800 text-lg mb-4">Pusat Bantuan</h3>
              <div className="space-y-3 mb-6">
                {[
                  { q: "Kasir minta batal?", a: "Cek tab Live Antrean Kasir. Permintaan dari kasir akan muncul dengan tombol ACC atau Tolak." },
                  { q: "Laporan Excel Error?", a: "Laporan diunduh dalam format CSV yang kompatibel langsung dengan Excel dan Google Sheets." }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-bold text-xs text-slate-800 mb-1">{item.q}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowHelpCenter(false)} className="w-full py-3 bg-slate-800 hover:bg-[#FF0055] text-white rounded-xl text-xs font-bold shadow-md transition-colors">
                Tutup
              </button>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowLogoutConfirm(false)}>
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-xs shadow-2xl text-center border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <LogOut size={32} className="mx-auto text-[#FF0055] mb-4" />
              <h2 className="text-xl font-black text-slate-800 mb-2">Keluar Sesi Manager?</h2>
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