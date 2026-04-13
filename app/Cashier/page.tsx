"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, Search, UserCheck, Trash2, CheckCircle2, 
  PackagePlus, ShieldAlert, Clock, XCircle, History, 
  LogOut, Boxes, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Info, KeyRound
} from "lucide-react";

import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const INITIAL_INVENTORY = [
  { id: "P01", name: "Serum Vitamin C", price: 120000, stock: 10, type: "product" },
  { id: "P02", name: "Sunscreen SPF 50", price: 85000, stock: 15, type: "product" },
  { id: "P03", name: "Facial Wash Acne", price: 65000, stock: 5, type: "product" },
  { id: "T01", name: "Treatment Glowing", price: 250000, stock: 999, type: "treatment" },
  { id: "T02", name: "Acne Peeling", price: 350000, stock: 999, type: "treatment" },
];

const MEMBER_DB = [
  { phone: "08123456789", name: "Nanda", discount: 0.10 },
  { phone: "08987654321", name: "Sarah", discount: 0.15 },
];

export default function CashierDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"kasir" | "stok" | "void">("kasir");
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [activeMember, setActiveMember] = useState<{name: string, discount: number} | null>(null);
  
  // MODAL STATES
  const [showReceipt, setShowReceipt] = useState<any>(null); 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [voidTarget, setVoidTarget] = useState<any>(null); 
  const [voidPinInput, setVoidPinInput] = useState("");
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', title: string, subtitle: string} | null>(null);

  const [stockType, setStockType] = useState<"masuk" | "keluar">("masuk");
  const [stockInput, setStockInput] = useState<{id: string, qty: number, reason: string}>({ id: "", qty: 0, reason: "rusak" });

  const showToast = (type: 'success' | 'error' | 'info', title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  // --- KEAMANAN & INISIALISASI ---
  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuthenticated");
    const role = sessionStorage.getItem("userRole");
    if (isAuth !== "true" || role !== "kasir") {
      router.replace("/"); 
    } else {
      setIsAuthorized(true);
      if (!localStorage.getItem("skinpos_inventory")) {
        localStorage.setItem("skinpos_inventory", JSON.stringify(INITIAL_INVENTORY));
      }
    }
  }, [router]);

  // --- SINKRONISASI DATA ---
  useEffect(() => {
    if (!isAuthorized) return; 
    const syncData = () => {
      const sOrders = localStorage.getItem("skinpos_orders");
      const sInv = localStorage.getItem("skinpos_inventory");
      if (sOrders) setOrders(JSON.parse(sOrders));
      if (sInv) setInventory(JSON.parse(sInv));
    };
    syncData(); 
    const interval = setInterval(syncData, 1000); 
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const updateSharedOrders = (newOrders: any[]) => { 
    setOrders(newOrders); 
    localStorage.setItem("skinpos_orders", JSON.stringify(newOrders)); 
  };
  
  const updateSharedInventory = (newInv: any[]) => { 
    setInventory(newInv); 
    localStorage.setItem("skinpos_inventory", JSON.stringify(newInv)); 
  };

  // --- LOGIKA TRANSAKSI ---
  const handleAddToCart = (item: any) => {
    if (item.stock <= 0) return showToast("error", "Stok Habis!", `${item.name} tidak tersedia.`);
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        if (existing.qty >= item.stock) return prev;
        return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const handleCheckMemberButton = () => {
    if (!memberPhone) return showToast("info", "Input Kosong", "Masukkan nomor HP pelanggan.");
    const member = MEMBER_DB.find(m => m.phone === memberPhone);
    if(member) {
      setActiveMember(member);
      showToast("success", "Member Ditemukan!", "Diskon otomatis diterapkan.");
    } else {
      setActiveMember(null);
      showToast("info", "Pelanggan Umum", "Tarif normal diterapkan.");
    }
  };

  const handleProsesPesanan = () => {
    if (cart.length === 0) return;
    const orderId = "ORD-" + Date.now().toString().slice(-4) + Math.floor(10 + Math.random() * 90);
    
    const newInv = inventory.map(item => {
      const cartItem = cart.find(c => c.id === item.id);
      return cartItem ? { ...item, stock: item.stock - cartItem.qty } : item;
    });
    updateSharedInventory(newInv);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const disc = activeMember ? subtotal * activeMember.discount : 0;

    const newOrder = { 
      id: orderId, items: [...cart], member: activeMember, subtotal, 
      discountAmount: disc, grandTotal: subtotal - disc, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      status: "pending" 
    };

    updateSharedOrders([newOrder, ...orders]); 
    setCart([]); setActiveMember(null); setMemberPhone("");
    showToast("success", "Pesanan Berhasil", `ID: ${orderId} menunggu tindakan.`);
  };

  // --- LOGIKA VOID & STOK ---
  const handleVoidRequest = (order: any) => {
    setVoidTarget(order);
    setVoidPinInput("");
  };

  const submitVoid = () => {
    const validPin = localStorage.getItem("manager_live_pin");
    if (voidPinInput === validPin) { 
      const newInv = inventory.map(item => {
        const voidedItem = voidTarget.items.find((c: any) => c.id === item.id);
        return voidedItem ? { ...item, stock: item.stock + voidedItem.qty } : item;
      });
      updateSharedInventory(newInv);
      updateSharedOrders(orders.map(o => o.id === voidTarget.id ? { ...o, status: "voided" } : o)); 
      showToast("success", "Void Berhasil", "Transaksi dibatalkan & stok dikembalikan.");
      setVoidTarget(null);
    } else {
      showToast("error", "PIN Salah", "Silakan cek PIN di layar Manager.");
    }
  };

  const handleStockMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInput.id || stockInput.qty <= 0) return showToast("error", "Gagal", "Lengkapi data input.");
    const targetItem = inventory.find(i => i.id === stockInput.id);
    if (stockType === "keluar" && targetItem.stock < stockInput.qty) return showToast("error", "Stok Tidak Cukup", "Jumlah melebihi stok fisik.");
    
    updateSharedInventory(inventory.map(item => item.id === stockInput.id ? { ...item, stock: stockType === "masuk" ? item.stock + Number(stockInput.qty) : item.stock - Number(stockInput.qty) } : item));
    setStockInput({ id: "", qty: 0, reason: "rusak" });
    showToast("success", "Update Berhasil", "Stok telah diperbarui.");
  };

  const handleSelesaikanTransaksi = (order: any) => {
    setShowReceipt(order);
    updateSharedOrders(orders.map(o => o.id === order.id ? { ...o, status: "completed" } : o)); 
  };

  const pendingCount = orders.filter(o => o.status === "pending").length;

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#FDFBFB] font-sans text-slate-700 overflow-hidden ${montserrat.className}`}>
      
      {/* MODAL: PIN VOID */}
      {voidTarget && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-[400] flex items-center justify-center">
          <div className="bg-white p-8 rounded-[2.5rem] w-[400px] shadow-2xl border-4 border-pink-50 animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <KeyRound size={32} className="text-pink-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Otorisasi Void</h2>
            <p className="text-slate-500 text-sm mb-8">Masukkan PIN Manager untuk <span className="font-bold text-pink-600">{voidTarget.id}</span></p>
            <input type="text" maxLength={6} value={voidPinInput} onChange={(e) => setVoidPinInput(e.target.value)} placeholder="••••••" className="w-full text-center text-3xl tracking-[0.5em] font-black py-4 rounded-2xl bg-pink-50 border-2 border-pink-100 text-pink-600 outline-none focus:border-pink-500 mb-8" />
            <div className="flex gap-3">
              <button onClick={() => setVoidTarget(null)} className="flex-1 py-4 rounded-2xl font-bold text-slate-400 bg-slate-100">Batal</button>
              <button onClick={submitVoid} className="flex-1 py-4 rounded-2xl font-bold text-white bg-pink-500 shadow-lg shadow-pink-200">Konfirmasi</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOGOUT */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center">
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            </div>
            <div><h4 className="font-bold text-slate-800 text-sm">{toast.title}</h4><p className="text-xs text-slate-400 mt-0.5">{toast.subtitle}</p></div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-72 bg-white flex flex-col h-full border-r border-pink-50 z-20 shadow-[4px_0_24px_rgba(252,165,165,0.1)]">
        <div className="p-8 border-b border-pink-50 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-400 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-pink-100 mb-4">S</div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Kasir</h1>
          <p className="text-[10px] font-bold text-pink-400 mt-1 uppercase tracking-widest leading-relaxed text-center">Rosereve Japan<br/>Operasional</p>
        </div>
        <div className="flex-1 py-6 space-y-1 px-6 overflow-y-auto">
          {[
            { id: "kasir", icon: ShoppingCart, label: "Kasir Utama" },
            { id: "stok", icon: PackagePlus, label: "Monitor Stok" },
            { id: "void", icon: ShieldAlert, label: "Antrean & Void", count: pendingCount },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-pink-50 text-pink-600 shadow-sm border border-pink-100" : "text-slate-400 hover:text-pink-500 hover:bg-pink-50/30"}`}>
              <div className="flex items-center gap-3"><tab.icon size={20} /> {tab.label}</div>
              {tab.count ? <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{tab.count}</span> : null}
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-pink-50 bg-white">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex justify-center items-center gap-2 bg-white border border-slate-200 text-slate-400 py-3.5 rounded-xl text-xs font-bold hover:text-rose-50 hover:border-rose-200 transition-all cursor-pointer"><LogOut size={16} /> Keluar</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative bg-[#FDFBFB]">
        {showReceipt && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[300] flex items-center justify-center">
            <div className="bg-white p-8 rounded-[2rem] w-[400px] shadow-2xl border border-pink-100 animate-in zoom-in-95 text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-6 text-pink-600 tracking-tight font-serif">Transaksi Selesai</h2>
              <div className="bg-slate-50 p-5 rounded-2xl font-mono text-xs border space-y-2 mb-6">
                <p className="text-center font-bold border-b border-dashed pb-2 mb-2 uppercase text-slate-400">SkinPOS Receipt</p>
                {showReceipt.items.map((c: any) => <div key={c.id} className="flex justify-between"><span>{c.qty}x {c.name}</span><span>Rp {(c.price * c.qty).toLocaleString()}</span></div>)}
                <div className="border-t border-dashed pt-3 mt-3 flex justify-between font-bold text-sm text-slate-800"><span>TOTAL</span><span>Rp {showReceipt.grandTotal.toLocaleString()}</span></div>
              </div>
              <button onClick={() => setShowReceipt(null)} className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all">Tutup</button>
            </div>
          </div>
        )}

        {/* --- TAB KASIR --- */}
        {activeTab === "kasir" && (
          <div className="flex gap-10 h-full animate-in fade-in duration-300">
            <div className="flex-1 flex flex-col">
              <div className="relative mb-8 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300" size={18} />
                <input type="text" placeholder="Cari Produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-4 py-4.5 rounded-2xl bg-white border border-pink-100 outline-none focus:ring-4 focus:ring-pink-50 font-semibold text-slate-800 placeholder:text-pink-300 shadow-sm transition-all" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
                {inventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                  <button key={item.id} onClick={() => handleAddToCart(item)} className="bg-white p-6 rounded-[1.8rem] border border-white shadow-sm text-left hover:shadow-pink-100/50 hover:-translate-y-1 transition-all group flex flex-col h-52">
                    <div className="flex justify-between items-start mb-4 w-full">
                      <span className="text-[10px] font-bold text-pink-400 p-1.5 bg-pink-50 rounded-lg">{item.id}</span>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-md ${item.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>Stok: {item.stock}</span>
                    </div>
                    <h3 className="font-bold text-slate-700 mb-1 group-hover:text-pink-600 transition-colors flex-1 leading-tight">{item.name}</h3>
                    <p className="text-pink-500 font-bold text-lg">Rp {item.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-[400px] bg-white rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgba(252,165,165,0.1)] flex flex-col overflow-hidden h-full">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 font-serif tracking-tight"><ShoppingCart className="text-pink-500" size={20}/> Detail Transaksi</h2>
                <div className="flex gap-2">
                  <input type="text" placeholder="No. HP Member..." value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-slate-100 outline-none focus:border-pink-300 text-sm font-semibold" />
                  <button onClick={handleCheckMemberButton} className="bg-slate-800 text-white px-5 py-3.5 rounded-xl font-bold hover:bg-black transition-colors"><UserCheck size={18} /></button>
                </div>
                {activeMember && <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-600 flex justify-between border border-emerald-100 animate-in slide-in-from-top-2"><span>Pasien: {activeMember.name}</span><span>Diskon {activeMember.discount * 100}%</span></div>}
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-5">
                {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-200"><ShoppingCart size={48} className="mb-4 opacity-50" /><p className="font-bold text-sm text-slate-300 tracking-widest uppercase">Keranjang Kosong</p></div> : 
                  cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center animate-in slide-in-from-right-4 duration-300">
                      <div className="flex-1 pr-4"><h4 className="text-sm font-bold text-slate-700 leading-tight">{item.name}</h4><p className="text-xs text-slate-400 mt-1">Rp {item.price.toLocaleString()} x {item.qty}</p></div>
                      <div className="flex items-center gap-4"><span className="font-bold text-sm text-slate-800">Rp {(item.price * item.qty).toLocaleString()}</span><button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><XCircle size={16}/></button></div>
                    </div>
                  ))
                }
              </div>
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-4">
                <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest"><span>Subtotal</span><span>Rp {cart.reduce((s,i)=>s+(i.price*i.qty),0).toLocaleString()}</span></div>
                <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase tracking-widest"><span>Diskon</span><span>- Rp {(activeMember ? cart.reduce((s,i)=>s+(i.price*i.qty),0) * activeMember.discount : 0).toLocaleString()}</span></div>
                <div className="flex justify-between items-end pt-4 border-t border-slate-200"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">TOTAL AKHIR</span><span className="text-3xl font-black text-pink-600 tracking-tighter">Rp {(cart.reduce((s,i)=>s+(i.price*i.qty),0) - (activeMember ? cart.reduce((s,i)=>s+(i.price*i.qty),0) * activeMember.discount : 0)).toLocaleString()}</span></div>
                <button onClick={handleProsesPesanan} disabled={cart.length === 0} className="w-full bg-pink-500 text-white py-4.5 rounded-2xl font-bold text-sm shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all disabled:opacity-50 uppercase tracking-widest active:scale-95">Bayar Sekarang</button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB STOK (SINKRON SEMUA ITEM) --- */}
        {activeTab === "stok" && (
          <div className="flex gap-8 animate-in fade-in duration-300 h-full overflow-hidden">
            <div className="w-[380px] shrink-0">
              <div className="bg-white p-8 rounded-[2rem] border border-white shadow-sm h-fit">
                <h3 className="text-sm font-bold uppercase tracking-widest text-pink-400 mb-8 font-serif">Mutasi Persediaan</h3>
                <div className="grid grid-cols-2 gap-2 bg-pink-50/30 p-1.5 rounded-2xl mb-8 border border-pink-50">
                  <button onClick={() => setStockType("masuk")} className={`py-3.5 rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${stockType === "masuk" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}><ArrowDownToLine size={14}/> Masuk</button>
                  <button onClick={() => setStockType("keluar")} className={`py-3.5 rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${stockType === "keluar" ? "bg-white text-rose-500 shadow-sm" : "text-slate-400"}`}><ArrowUpFromLine size={14}/> Keluar</button>
                </div>
                <form onSubmit={handleStockMutation} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Pilih Item</label>
                    <select value={stockInput.id} onChange={(e) => setStockInput({...stockInput, id: e.target.value})} className="w-full px-4 py-4 rounded-xl bg-pink-50/20 border border-pink-50 font-bold text-slate-700 outline-none text-sm focus:bg-white focus:border-pink-300 transition-all cursor-pointer">
                      <option value="">Pilih Produk/Treatment</option>
                      {inventory.map(item => <option key={item.id} value={item.id}>{item.name} ({item.stock})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Jumlah</label>
                      <input type="number" min="1" value={stockInput.qty || ""} onChange={(e) => setStockInput({...stockInput, qty: Number(e.target.value)})} placeholder="0" className="w-full px-4 py-4 rounded-xl bg-pink-50/20 border border-pink-100 font-bold text-slate-700 text-center outline-none focus:bg-white transition-all" />
                    </div>
                    {stockType === "keluar" && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block">Alasan</label>
                        <select value={stockInput.reason} onChange={(e) => setStockInput({...stockInput, reason: e.target.value})} className="w-full px-4 py-4 rounded-xl bg-pink-50/20 border border-pink-100 font-bold text-slate-700 text-xs outline-none cursor-pointer"><option value="rusak">Rusak</option><option value="expired">Expired</option><option value="tester">Tester</option></select>
                      </div>
                    )}
                  </div>
                  <button type="submit" className={`w-full py-4.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95 ${stockType === "masuk" ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-rose-500 text-white shadow-rose-100"}`}>Simpan Mutasi</button>
                </form>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-[2.5rem] border border-white shadow-sm flex flex-col overflow-hidden">
              <div className="p-7 border-b border-slate-50 bg-pink-50/20 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Boxes size={18} className="text-pink-500" /> Monitor Persediaan</h3>
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Update Real-time</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white/90 backdrop-blur-sm z-10"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="p-6 border-b border-pink-50">ID - Nama Item</th><th className="p-6 border-b border-pink-50 text-center">Status</th><th className="p-6 border-b border-pink-50 text-right">Stok Fisik</th></tr></thead>
                  <tbody className="divide-y divide-pink-50">
                    {inventory.map(item => (
                      <tr key={item.id} className="hover:bg-pink-50/30 transition-colors group">
                        <td className="p-6"><p className="text-[10px] font-bold text-pink-400 mb-0.5">{item.id}</p><p className="text-sm font-bold text-slate-700">{item.name}</p></td>
                        <td className="p-6 text-center">{item.stock < 5 ? <span className="inline-flex items-center gap-1.5 text-[9px] font-black bg-rose-50 text-rose-500 px-3 py-1.5 rounded-lg border border-rose-100 uppercase animate-pulse"><AlertTriangle size={12}/> Kritis</span> : <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">Aman</span>}</td>
                        <td className="p-6 text-right font-black text-slate-800 text-lg tracking-tighter">{item.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB VOID --- */}
        {activeTab === "void" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-800 mb-10 flex items-center gap-3"><History className="text-pink-500" size={32} /> Antrean & Void</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {orders.length === 0 ? <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-pink-50 shadow-sm"><Info size={64} className="mx-auto text-pink-200 mb-4 opacity-50" /><p className="font-bold text-slate-400 tracking-widest uppercase text-sm">Belum ada transaksi</p></div> : orders.map((order, idx) => (
                <div key={`${order.id}-${idx}`} className={`bg-white rounded-[2.5rem] p-8 border border-white shadow-sm flex flex-col hover:shadow-pink-100/30 transition-all ${order.status !== 'pending' && 'opacity-60 grayscale-[0.5]'}`}>
                  <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100 font-serif">
                    <div><span className="px-3 py-2 rounded-xl text-xs font-bold bg-pink-50 text-pink-600 border border-pink-100">{order.id}</span><p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5"><Clock size={12}/> {order.time}</p></div>
                    <p className="text-2xl font-black text-slate-800 tracking-tighter">Rp {order.grandTotal.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 mb-8 space-y-2">{order.items.map((it: any, i: number) => <p key={i} className="text-sm font-semibold text-slate-500 flex justify-between"><span>{it.qty}x {it.name}</span></p>)}</div>
                  <div className="mt-auto">
                    {order.status === "pending" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleVoidRequest(order)} className="bg-white text-rose-500 border-2 border-rose-100 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95">Request Void</button>
                        <button onClick={() => handleSelesaikanTransaksi(order)} className="bg-slate-800 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95">Selesaikan</button>
                      </div>
                    ) : <div className={`py-4 rounded-2xl text-center font-black uppercase text-xs tracking-widest border-2 ${order.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"}`}>{order.status}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}