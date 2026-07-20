"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, Database, Cpu, LogOut, CheckCircle2,
  XCircle, AlertTriangle, ShieldCheck, RefreshCw,
  HardDrive, Activity, HelpCircle, Save, Info, Trash2
} from "lucide-react";

import { Plus_Jakarta_Sans } from "next/font/google";
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"] 
});

const DEFAULT_INVENTORY = [
  { id: "P01", name: "Serum Vitamin C", price: 120000, stock: 10, type: "Produk", exp: "15/12/2026", sold: 0 },
  { id: "P02", name: "Sunscreen SPF 50", price: 85000, stock: 15, type: "Produk", exp: "20/05/2026", sold: 0 },
  { id: "P03", name: "Facial Wash Acne", price: 65000, stock: 5, type: "Produk", exp: "25/10/2026", sold: 0 },
  { id: "T01", name: "Treatment Glowing", price: 250000, stock: 999, type: "Layanan", exp: "-", sold: 0 },
  { id: "T02", name: "Acne Peeling", price: 350000, stock: 999, type: "Layanan", exp: "-", sold: 0 },
];

const DEFAULT_MEMBERS = [
  { phone: "08123456789", name: "Nanda", discount: 0.10, dob: "1998-05-12" },
  { phone: "08987654321", name: "Sarah", discount: 0.15, dob: "2001-11-23" },
];

const DEFAULT_STOCK_LOGS = [
  { id: "LOG-001", time: "08:15 AM", item: "Serum Vitamin C", type: "masuk", qty: 50, reason: "Restock Mingguan", user: "Gudang" },
  { id: "LOG-002", time: "10:30 AM", item: "Facial Wash Acne", type: "keluar", qty: 2, reason: "Barang Rusak (Bocor)", user: "Elberth" },
];

export default function AdminITDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"diagnostics" | "database" | "utilities" | "terminal">("diagnostics");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Storage Stats
  const [storageUsage, setStorageUsage] = useState({ used: 0, percent: 0 });
  const [dbCounts, setDbCounts] = useState({ inventory: 0, members: 0, orders: 0, logs: 0 });

  // Database JSON Editor State
  const [selectedDbKey, setSelectedDbKey] = useState("skinpos_inventory");
  const [jsonText, setJsonText] = useState("");
  
  // System Simulation
  const [simulatedNetwork, setSimulatedNetwork] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [printServerStatus, setPrintServerStatus] = useState<"READY" | "ERROR">("READY");
  const [waGatewayStatus, setWaGatewayStatus] = useState<"ONLINE" | "DISCONNECTED">("ONLINE");

  // IT Terminal command simulation states
  const [cliInput, setCliInput] = useState("");
  const [cliOutput, setCliOutput] = useState<string[]>([
    "SkinPOS IT Command Console v1.0.0",
    "Ketik 'help' untuk melihat daftar perintah yang tersedia.",
    ""
  ]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; title: string; subtitle: string } | null>(null);

  const showToast = (type: "success" | "error" | "info", title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const role = sessionStorage.getItem("userRole");
    if (isAuth !== "true" || role !== "admin") {
      router.replace("/");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Load database metadata and details
  useEffect(() => {
    if (!isAuthorized) return;
    calculateStats();
  }, [isAuthorized, selectedDbKey]);

  const calculateStats = () => {
    // Calculate raw size
    let totalBytes = 0;
    const keys = ["skinpos_inventory", "skinpos_members", "skinpos_orders", "skinpos_stock_logs"];
    keys.forEach(k => {
      const val = localStorage.getItem(k) || "";
      totalBytes += val.length * 2; // UTF-16 bytes approx
    });
    
    // Max Storage 5MB = 5242880 bytes
    const percent = Math.min(100, Math.max(0.1, Math.round((totalBytes / 5242880) * 100)));
    setStorageUsage({ used: Math.round(totalBytes / 1024), percent });

    const inv = JSON.parse(localStorage.getItem("skinpos_inventory") || "[]");
    const mem = JSON.parse(localStorage.getItem("skinpos_members") || "[]");
    const ord = JSON.parse(localStorage.getItem("skinpos_orders") || "[]");
    const lgs = JSON.parse(localStorage.getItem("skinpos_stock_logs") || "[]");

    setDbCounts({
      inventory: inv.length,
      members: mem.length,
      orders: ord.length,
      logs: lgs.length
    });

    // Populate JSON editor
    const activeData = localStorage.getItem(selectedDbKey) || "[]";
    try {
      setJsonText(JSON.stringify(JSON.parse(activeData), null, 2));
    } catch {
      setJsonText(activeData);
    }
  };

  // Save Raw JSON Changes
  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      localStorage.setItem(selectedDbKey, JSON.stringify(parsed));
      showToast("success", "JSON Tersimpan", `Basis data ${selectedDbKey} berhasil diperbarui.`);
      calculateStats();
    } catch (e: any) {
      showToast("error", "Format JSON Salah", `Kesalahan parse: ${e.message}`);
    }
  };

  // RECONCILE DATA STOK & PENJUALAN
  const handleReconcile = () => {
    try {
      const orders = JSON.parse(localStorage.getItem("skinpos_orders") || "[]");
      const inventory = JSON.parse(localStorage.getItem("skinpos_inventory") || "[]");

      // Reset sold count
      const updatedInv = inventory.map((item: any) => ({ ...item, sold: 0 }));

      // Recalculate based on orders
      orders.forEach((order: any) => {
        if (order.status === "completed") {
          order.items.forEach((item: any) => {
            const target = updatedInv.find((i: any) => i.id === item.id);
            if (target) {
              target.sold = (target.sold || 0) + item.qty;
            }
          });
        }
      });

      localStorage.setItem("skinpos_inventory", JSON.stringify(updatedInv));
      calculateStats();
      showToast("success", "Rekonsiliasi Sukses", "Porsi sold unit produk disinkronkan ulang dengan riwayat struk.");
    } catch {
      showToast("error", "Gagal", "Gagal melakukan rekonsiliasi data.");
    }
  };

  // RESET INDIVIDUAL DATABASE
  const handleResetDb = (key: "all" | "inventory" | "members" | "orders" | "logs") => {
    if (!window.confirm("Apakah Anda yakin ingin menyetel ulang basis data terpilih? Tindakan ini permanen.")) return;

    if (key === "all" || key === "inventory") {
      localStorage.setItem("skinpos_inventory", JSON.stringify(DEFAULT_INVENTORY));
    }
    if (key === "all" || key === "members") {
      localStorage.setItem("skinpos_members", JSON.stringify(DEFAULT_MEMBERS));
    }
    if (key === "all" || key === "orders") {
      localStorage.setItem("skinpos_orders", JSON.stringify([]));
    }
    if (key === "all" || key === "logs") {
      localStorage.setItem("skinpos_stock_logs", JSON.stringify(DEFAULT_STOCK_LOGS));
    }

    showToast("success", "Reset Berhasil", "Basis data telah dikembalikan ke kondisi default pabrik.");
    calculateStats();
  };

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim().toLowerCase();
    if (!cmd) return;
    
    let response = "";
    if (cmd === "help") {
      response = "Perintah tersedia:\n" +
        "  - help           : Tampilkan daftar bantuan ini\n" +
        "  - sysinfo        : Tampilkan informasi browser & storage\n" +
        "  - ping           : Periksa respons server\n" +
        "  - sql-sync       : Jalankan sinkronisasi database stok\n" +
        "  - logs --view    : Tampilkan log audit inventaris terbaru\n" +
        "  - clear --all    : Reset total seluruh basis data ke awal";
    } else if (cmd === "sysinfo") {
      response = `INFO SISTEM SKINPOS:\n` +
        `  - Agen Browser: ${navigator.userAgent.slice(0, 50)}...\n` +
        `  - LocalStorage Terpakai: ${storageUsage.used} KB\n` +
        `  - Status Koneksi: ONLINE\n` +
        `  - Port Layanan: localhost:3000`;
    } else if (cmd === "ping") {
      response = "PONG! Respons latency 8ms. Koneksi stabil.";
    } else if (cmd === "sql-sync") {
      handleReconcile();
      response = "Rekonsiliasi database selesai! Stok sold unit diperbarui.";
    } else if (cmd === "logs --view") {
      const logs = JSON.parse(localStorage.getItem("skinpos_stock_logs") || "[]");
      response = logs.length > 0 
        ? logs.map((l: any) => `[${l.time}] ${l.user}: ${l.type === "masuk" ? "+" : "-"}${l.qty} ${l.item} ("${l.reason}")`).join("\n")
        : "Tidak ada logs audit tersimpan.";
    } else if (cmd === "clear --all") {
      localStorage.setItem("skinpos_inventory", JSON.stringify(DEFAULT_INVENTORY));
      localStorage.setItem("skinpos_members", JSON.stringify(DEFAULT_MEMBERS));
      localStorage.setItem("skinpos_orders", JSON.stringify([]));
      localStorage.setItem("skinpos_stock_logs", JSON.stringify(DEFAULT_STOCK_LOGS));
      calculateStats();
      response = "BASIS DATA DISETEL ULANG KE BAWAAN PABRIK!";
    } else {
      response = `Perintah tidak dikenal: '${cmd}'. Ketik 'help' untuk daftar bantuan.`;
    }
    
    setCliOutput(prev => [...prev, `it-admin@skinpos:~$ ${cliInput}`, response, ""]);
    setCliInput("");
  };

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#F4F7FA] text-slate-800 overflow-hidden ${jakarta.className}`}>
      
      {/* SIDEBAR */}
      <aside className={`bg-slate-900 text-slate-300 flex flex-col h-full shrink-0 z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[260px]" : "w-0 opacity-0 overflow-hidden"}`}>
        <div className="h-24 flex items-center px-8 border-b border-slate-800 shrink-0 w-[260px]">
          <Terminal className="w-8 h-8 mr-3 text-[#FF0055] drop-shadow-sm" />
          <span className="font-extrabold text-white text-xl tracking-tight">
            IT Support<span className="text-[#FF0055]">.</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6 w-[260px]">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Diagnostik POS</p>
          {[
            { id: "diagnostics", icon: Cpu, label: "Diagnostik Sistem" },
            { id: "database", icon: Database, label: "Editor JSON Data" },
            { id: "utilities", icon: RefreshCw, label: "Alat Perbaikan" },
            { id: "terminal", icon: Terminal, label: "Terminal Perintah IT" },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                activeTab === tab.id 
                  ? "bg-[#FF0055] text-white shadow-lg shadow-rose-500/25"
                  : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? "text-white" : "text-slate-500"} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="p-6 border-t border-slate-800 shrink-0 w-[260px]">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50/10 transition-all text-sm font-bold">
            <LogOut size={18} />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* MAIN MAIN */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F7FA]">
        <header className="h-24 bg-white border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
               className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
               title={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            >
               <Terminal size={20} className="text-[#FF0055] animate-pulse" />
            </button>
            <div>
              <h1 className="text-[18px] lg:text-[22px] font-extrabold text-slate-800 tracking-tight">
                {activeTab === "diagnostics" ? "Diagnostik & Kesehatan Sistem" : activeTab === "database" ? "Basis Data JSON Editor" : "Utilitas & Pemulihan Sistem"}
              </h1>
              <p className="text-[10px] lg:text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Portal Kontrol Rekayasa IT &amp; Support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Port 3000: Running</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">IT</div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          
          {/* TAB 1: DIAGNOSTICS */}
          {activeTab === "diagnostics" && (
             <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA] space-y-8">
                {/* System status row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><HardDrive size={24}/></div>
                      <div className="flex-1">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">LocalStorage Terpakai</p>
                         <div className="flex items-baseline gap-2 mb-1.5">
                            <h3 className="text-xl font-black text-slate-800">{storageUsage.used} KB</h3>
                            <span className="text-[10px] font-bold text-slate-400">/ 5120 KB</span>
                         </div>
                         <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div style={{ width: `${storageUsage.percent}%` }} className="h-full bg-indigo-600 rounded-full"/>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-rose-50 text-[#FF0055] rounded-2xl"><Activity size={24}/></div>
                      <div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Konektivitas Gateway</p>
                         <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                           {simulatedNetwork} 
                           <button 
                             onClick={() => setSimulatedNetwork(prev => prev === "ONLINE" ? "OFFLINE" : "ONLINE")}
                             className="text-[9px] font-bold text-[#FF0055] bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-100 uppercase"
                           >
                              Toggle
                           </button>
                         </h3>
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><ShieldCheck size={24}/></div>
                      <div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Print Server & WA Gateway</p>
                         <div className="flex gap-2.5 mt-1.5">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${printServerStatus === 'READY' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                              PRINTER: {printServerStatus}
                            </span>
                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded">
                              WA: ACTIVE
                            </span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* DB Details grid */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                   <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-6">Ringkasan Basis Data POS</h3>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { key: "Inventaris Produk", count: dbCounts.inventory, desc: "Total SKU layanan/produk" },
                        { key: "Database Anggota", count: dbCounts.members, desc: "Anggota VIP terdaftar" },
                        { key: "Data Riwayat Transaksi", count: dbCounts.orders, desc: "Struk pesanan di server" },
                        { key: "Audit Logs", count: dbCounts.logs, desc: "Mutasi log keluar-masuk" },
                      ].map((item, idx) => (
                        <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:shadow-sm transition-all text-center">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.key}</p>
                           <h2 className="text-3xl font-black text-slate-800 mb-1.5">{item.count}</h2>
                           <p className="text-[10px] font-medium text-slate-400">{item.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* TAB 2: DATABASE JSON EDITOR */}
          {activeTab === "database" && (
             <div className="h-full p-6 lg:p-10 flex flex-col animate-in fade-in bg-[#F4F7FA] overflow-hidden">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                   <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white">
                      <div>
                         <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Raw JSON Data Override</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Edit isi basis data localStorage secara langsung</p>
                      </div>
                      <div className="flex gap-3">
                         <select
                            value={selectedDbKey}
                            onChange={(e) => setSelectedDbKey(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-xs font-bold focus:border-[#FF0055] bg-slate-50"
                         >
                            <option value="skinpos_inventory">skinpos_inventory (Inventaris)</option>
                            <option value="skinpos_members">skinpos_members (Anggota VIP)</option>
                            <option value="skinpos_orders">skinpos_orders (Transaksi)</option>
                            <option value="skinpos_stock_logs">skinpos_stock_logs (Logs Stok)</option>
                         </select>
                         <button
                            onClick={handleSaveJson}
                            className="px-5 py-2.5 bg-slate-800 hover:bg-[#FF0055] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
                         >
                            <Save size={14}/> Simpan JSON
                         </button>
                      </div>
                   </div>

                   {/* Editor Area */}
                   <div className="flex-1 p-6 bg-slate-950 overflow-hidden flex flex-col">
                      <textarea
                         value={jsonText}
                         onChange={(e) => setJsonText(e.target.value)}
                         className="w-full flex-1 bg-transparent text-slate-350 font-mono text-xs outline-none resize-none scrollbar-thin select-text"
                         spellCheck={false}
                      />
                   </div>
                </div>
             </div>
          )}

          {/* TAB 3: UTILITIES */}
          {activeTab === "utilities" && (
             <div className="h-full p-6 lg:p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA] space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Factory Reset Card */}
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                      <div>
                         <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Penyetelan Ulang Basis Data</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Kembalikan ke nilai bawaan pabrik (Factory Reset)</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <button
                            onClick={() => handleResetDb("inventory")}
                            className="py-3 px-4 bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-slate-700 hover:text-amber-600 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                         >
                            <RefreshCw size={14}/> Reset Inventaris
                         </button>
                         <button
                            onClick={() => handleResetDb("members")}
                            className="py-3 px-4 bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-slate-700 hover:text-amber-600 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                         >
                            <RefreshCw size={14}/> Reset Anggota VIP
                         </button>
                         <button
                            onClick={() => handleResetDb("orders")}
                            className="py-3 px-4 bg-slate-50 border border-slate-200 hover:border-rose-500 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                         >
                            <Trash2 size={14}/> Reset Riwayat Struk
                         </button>
                         <button
                            onClick={() => handleResetDb("logs")}
                            className="py-3 px-4 bg-slate-50 border border-slate-200 hover:border-rose-500 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                         >
                            <Trash2 size={14}/> Reset Logs Mutasi
                         </button>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                         <button
                            onClick={() => handleResetDb("all")}
                            className="w-full py-4 bg-[#FF0055] hover:bg-[#D40048] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-md transition-all"
                         >
                            Reset Seluruh Sistem
                         </button>
                      </div>
                   </div>

                   {/* Repairs Utility Card */}
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                      <div>
                         <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Utilitas Perbaikan Diagnostik</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Alat rekonsiliasi data kasir yang tidak sinkron</p>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex-1">
                               <h4 className="font-bold text-xs text-slate-800 mb-0.5">Sinkronisasi Ulang Stok (Reconcile)</h4>
                               <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Menghitung ulang total penjualan (sold units) produk dari riwayat transaksi kasir yang sukses.</p>
                            </div>
                            <button
                               onClick={handleReconcile}
                               className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                               Reconcile
                            </button>
                         </div>

                         <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex-1">
                               <h4 className="font-bold text-xs text-slate-800 mb-0.5">Printers & Print Service Test</h4>
                               <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Simulasikan status printer thermal jika macet untuk pengujian kasir.</p>
                            </div>
                            <button
                               onClick={() => {
                                 setPrintServerStatus(prev => prev === "READY" ? "ERROR" : "READY");
                                 showToast("info", "Printer Status Changed", `Printer status set to ${printServerStatus === "READY" ? "ERROR" : "READY"}`);
                               }}
                               className="px-4 py-2.5 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                               Test Print
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* TAB 4: TERMINAL PERINTAH IT */}
          {activeTab === "terminal" && (
             <div className="h-full p-6 lg:p-10 flex flex-col animate-in fade-in bg-[#F4F7FA] overflow-hidden">
                <div className="bg-slate-950 rounded-[2rem] border border-slate-900 shadow-2xl flex-1 flex flex-col overflow-hidden p-6 font-mono text-slate-300">
                   {/* Terminal Header */}
                   <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-4 text-xs font-bold text-slate-500 shrink-0">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                         <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                         <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                         <span className="ml-2 font-black text-slate-400">Terminal Perintah IT - SkinPOS v1.0.0</span>
                      </div>
                      <span>ONLINE</span>
                   </div>

                   {/* Terminal Output logs */}
                   <div className="flex-1 overflow-y-auto space-y-1 mb-4 select-text text-xs">
                      {cliOutput.map((line, idx) => (
                         <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                            {line}
                         </div>
                      ))}
                   </div>

                   {/* Terminal Input form */}
                   <form onSubmit={handleExecuteCommand} className="flex gap-2 border-t border-slate-900 pt-4 shrink-0 items-center">
                      <span className="text-emerald-500 font-extrabold text-xs">it-admin@skinpos:~$</span>
                      <input
                         type="text"
                         value={cliInput}
                         onChange={(e) => setCliInput(e.target.value)}
                         placeholder="Ketik perintah di sini... (contoh: help, sysinfo, ping)"
                         className="flex-1 bg-transparent text-white font-mono text-xs outline-none border-none focus:ring-0 p-0 placeholder:text-slate-700"
                         autoFocus
                      />
                   </form>
                </div>
             </div>
          )}

        </div>

        {/* LOGOUT */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowLogoutConfirm(false)}>
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-xs shadow-2xl text-center border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <LogOut size={32} className="mx-auto text-[#FF0055] mb-4" />
              <h2 className="text-xl font-black text-slate-800 mb-2">Keluar Sesi IT?</h2>
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
            <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border ${toast.type === "error" ? "bg-rose-50 border-rose-200" : "bg-slate-900 border-slate-800"}`}>
              {toast.type === "success" ? <CheckCircle2 className="text-emerald-400" size={24} /> : toast.type === "error" ? <XCircle className="text-[#FF0055]" size={24} /> : <Info className="text-blue-400" size={24} />}
              <div>
                <h4 className={`font-bold text-[13px] tracking-wide mb-0.5 ${toast.type === "error" ? "text-rose-700" : "text-white"}`}>{toast.title}</h4>
                <p className={`text-[11px] font-medium ${toast.type === "error" ? "text-rose-500" : "text-slate-400"}`}>{toast.subtitle}</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
