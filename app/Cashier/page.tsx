"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, Search, UserCheck, CheckCircle2, 
  PackagePlus, History, LogOut, Boxes, XCircle, 
  Loader2, Plus, Minus, ReceiptText, HelpCircle, 
  FileDown, FileSpreadsheet, PanelLeftClose, PanelLeftOpen, UsersRound, KeyRound, ShieldAlert, Clock
} from "lucide-react";

import { Plus_Jakarta_Sans } from "next/font/google";
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"] 
});

const INITIAL_INVENTORY = [
  { id: "P01", name: "Serum Vitamin C", price: 120000, stock: 10, type: "Produk", exp : "12/2026" },
  { id: "P02", name: "Sunscreen SPF 50", price: 85000, stock: 15, type: "Produk", exp: "05/2026" },
  { id: "P03", name: "Facial Wash Acne", price: 65000, stock: 5, type: "Produk", exp: "10/2026" },
  { id: "T01", name: "Treatment Glowing", price: 250000, stock: 999, type: "Layanan", exp: "-" },
  { id: "T02", name: "Acne Peeling", price: 350000, stock: 999, type: "Layanan", exp: "-" },
];

const MEMBER_DB = [
  { phone: "08123456789", name: "Nanda", discount: 0.10, dob: "1998-05-12" },
  { phone: "08987654321", name: "Sarah", discount: 0.15, dob: "2001-11-23" },
];

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const formatWaktu = () => {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}.${minutes}`;
};

export default function CashierDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"kasir" | "stok" | "void" | "members">("kasir");
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [phoneError, setPhoneError] = useState(""); 
  const [isCheckingMember, setIsCheckingMember] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [activeMember, setActiveMember] = useState<{name: string, discount: number, dob?: string} | null>(null);
  
  const [showReceipt, setShowReceipt] = useState<any>(null); 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [voidTarget, setVoidTarget] = useState<any>(null); 
  const [voidPinInput, setVoidPinInput] = useState("");
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', title: string, subtitle: string} | null>(null);

  const [stockType, setStockType] = useState<"masuk" | "keluar">("masuk");
  const [stockInput, setStockInput] = useState<{id: string, qty: number, reason: string, expDate: string}>({ id: "", qty: 0, reason: "rusak", expDate: "" });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("Normal");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [newMember, setNewMember] = useState({ name: "", phone: "", dob: "", discount: 10 });

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

  useEffect(() => {
    if (!isAuthorized) return; 
    const syncData = () => {
      const sOrders = localStorage.getItem("skinpos_orders");
      const sInv = localStorage.getItem("skinpos_inventory");
      const sMembers = localStorage.getItem("skinpos_members");
      
      if (sOrders) setOrders(JSON.parse(sOrders));
      if (sInv) setInventory(JSON.parse(sInv));
      
      if (sMembers) {
        setMembers(JSON.parse(sMembers));
      } else {
        setMembers(MEMBER_DB);
        localStorage.setItem("skinpos_members", JSON.stringify(MEMBER_DB));
      }
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

  const showToast = (type: 'success' | 'error' | 'info', title: string, subtitle: string) => {
    setToast({ type, title, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProductClick = (item: any) => {
    if (item.stock <= 0) {
      showToast("error", "Stok Habis!", `${item.name} tidak tersedia.`);
      return;
    }
    if (item.type === "Produk" || item.type === "Product") {
      setSelectedProduct(item);
      setSelectedVariant("Normal");
    } else {
      processAddToCart(item, "Normal");
    }
  };

  const processAddToCart = (item: any, variant: string) => {
    const cartItemId = `${item.id}-${variant}`;
    
    setCart(prev => {
      const existing = prev.find(c => c.cartId === cartItemId);
      if (existing) {
        if (existing.qty >= item.stock) {
           showToast("error", "Batas Stok", "Stok fisik tidak mencukupi.");
           return prev;
        }
        return prev.map(c => c.cartId === cartItemId ? { ...c, qty: c.qty + 1 } : c);
      }
      return [{ ...item, cartId: cartItemId, variant: variant, qty: 1 }, ...prev];
    });
    setSelectedProduct(null);
  };

  const updateCartItemQty = (cartId: string, newQty: number, originalId: string) => {
    const itemInInv = inventory.find(i => i.id === originalId);
    if (newQty > itemInInv.stock) return showToast("error", "Batas Stok", "Stok tidak mencukupi.");
    if (newQty <= 0) return handleRemoveFromCart(cartId);
    setCart(prev => prev.map(c => c.cartId === cartId ? { ...c, qty: newQty } : c));
  };

  const handleRemoveFromCart = (cartId: string) => {
    const item = cart.find(i => i.cartId === cartId);
    if (item && (item.price * item.qty) >= 300000) {
      if (!window.confirm(`Produk bernilai tinggi (${formatRupiah(item.price * item.qty)}). Hapus dari keranjang?`)) return;
    }
    setCart(prev => prev.filter(c => c.cartId !== cartId));
  };

  const handlePhoneChange = (val: string) => {
    setMemberPhone(val);
    if (val && !/^\d+$/.test(val)) setPhoneError("Gunakan format angka");
    else if (val && val.length < 10) setPhoneError("Min. 10 digit");
    else setPhoneError("");
  };

  const handleCheckMember = () => {
    if (!memberPhone || phoneError) return;
    setIsCheckingMember(true);
    setTimeout(() => {
      const member = members.find(m => m.phone === memberPhone);
      if(member) {
        setActiveMember(member);
        showToast("success", "Anggota Ditemukan", member.name);
      } else {
        setActiveMember(null);
        showToast("info", "Pelanggan Umum", "Tidak ada diskon.");
      }
      setIsCheckingMember(false);
    }, 600);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessingOrder(true);
    setTimeout(() => {
      const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
      const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
      const discount = activeMember ? subtotal * activeMember.discount : 0;
      
      const newOrder = { 
        id: orderId, items: [...cart], member: activeMember, subtotal, 
        discountAmount: discount, grandTotal: subtotal - discount, 
        time: formatWaktu(), 
        status: "pending" 
      };
      
      updateSharedOrders([newOrder, ...orders]);
      
      const newInv = inventory.map(item => {
        const totalQtyInCart = cart.filter(c => c.id === item.id).reduce((sum, current) => sum + current.qty, 0);
        return totalQtyInCart > 0 ? { ...item, stock: item.stock - totalQtyInCart } : item;
      });
      updateSharedInventory(newInv);
  
      setCart([]); setActiveMember(null); setMemberPhone("");
      showToast("success", "Pembayaran Sukses", `Transaksi ${orderId} berhasil.`);
      setIsProcessingOrder(false);
      setShowReceipt(newOrder);
    }, 800);
  };

  const handleStockMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInput.id || stockInput.qty <= 0) return showToast("error", "Error", "Input tidak valid.");
    const targetItem = inventory.find(i => i.id === stockInput.id);
    if (stockType === "keluar" && targetItem.stock < stockInput.qty) return showToast("error", "Stok Kurang", "Melebihi fisik.");
    
    const updatedInv = inventory.map(item => item.id === stockInput.id ? { ...item, stock: stockType === "masuk" ? item.stock + Number(stockInput.qty) : item.stock - Number(stockInput.qty), exp: stockType === "masuk" && stockInput.expDate ? stockInput.expDate : item.exp } : item);
    updateSharedInventory(updatedInv);
    setStockInput({ id: "", qty: 0, reason: "rusak", expDate: "" });
    showToast("success", "Tersimpan", "Mutasi stok berhasil diupdate.");
  };

  const handleVoidRequest = (order: any) => {
    setVoidTarget(order);
    setVoidPinInput("");
  };

  const handleSelesaikanTransaksi = (order: any) => {
    setShowReceipt(order);
    const updated = orders.map(o => o.id === order.id ? { ...o, status: "completed" } : o);
    updateSharedOrders(updated);
  };

  const submitVoid = () => {
    if (voidPinInput === localStorage.getItem("manager_live_pin")) { 
      const newInv = inventory.map(item => {
        const totalQtyToReturn = voidTarget.items.filter((c: any) => c.id === item.id).reduce((sum:number, current:any) => sum + current.qty, 0);
        return totalQtyToReturn > 0 ? { ...item, stock: item.stock + totalQtyToReturn } : item;
      });
      updateSharedInventory(newInv);
      
      const updatedOrders = orders.map(o => o.id === voidTarget.id ? { ...o, status: "voided" } : o);
      updateSharedOrders(updatedOrders);
      
      showToast("success", "Dibatalkan", "Transaksi batal, stok kembali.");
      setVoidTarget(null);
    } else showToast("error", "Akses Ditolak", "Kata Sandi Manager salah.");
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newMember.name || !newMember.phone || !newMember.dob) {
        return showToast("error", "Data Tidak Lengkap", "Nama, No. HP, dan Tanggal Lahir wajib diisi.");
    }
    const updatedMembers = [{ phone: newMember.phone, name: newMember.name, dob: newMember.dob, discount: newMember.discount / 100 }, ...members];
    setMembers(updatedMembers);
    localStorage.setItem("skinpos_members", JSON.stringify(updatedMembers));
    setNewMember({ name: "", phone: "", dob: "", discount: 10 });
    showToast("success", "Berhasil", "Data Anggota VIP berhasil ditambahkan.");
  };

  if (!isAuthorized) return null;

  return (
    <div className={`flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden ${jakarta.className}`}>
      
      {/* SIDEBAR */}
      <aside className={`bg-white flex flex-col h-full shrink-0 border-r border-slate-200 z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[260px]" : "w-0 opacity-0 overflow-hidden border-none"}`}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100 shrink-0">
          <img src="Cashier1.png" alt="Logo Kasir" className="w-10 h-10 mr-3 object-contain drop-shadow-sm" />
          <span className="font-extrabold text-slate-800 text-xl tracking-tight whitespace-nowrap">Kasir<span className="text-[#FF0055]">.</span></span>
        </div>
        <nav className="flex-1 px-5 space-y-2 mt-8 overflow-y-auto w-[260px]">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menu Utama</p>
          {[
            { id: "kasir", icon: ShoppingCart, label: "Terminal Kasir" },
            { id: "stok", icon: Boxes, label: "Manajemen Stok" },
            { id: "void", icon: History, label: "Riwayat & Laporan", count: orders.filter(o=>o.status==='pending').length },
            { id: "members", icon: UsersRound, label: "Data Anggota" }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)} 
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-[1.25rem] transition-all font-bold text-sm ${
                activeTab === item.id 
                  ? "bg-[#FF0055] text-white shadow-lg shadow-rose-500/25"
                  : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} className={activeTab === item.id ? "text-white" : "text-slate-400"} />
              <span className="whitespace-nowrap">{item.label}</span>
              {item.count ? <span className={`ml-auto text-[10px] px-2.5 py-0.5 rounded-full font-black ${activeTab === item.id ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-500'}`}>{item.count}</span> : null}
            </button>
          ))}
          <div className="pt-6 mt-6 border-t border-slate-100">
             <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lainnya</p>
             <button onClick={() => setShowHelpCenter(true)} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all font-bold text-sm bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50">
                <HelpCircle size={20} strokeWidth={2} className="text-slate-400"/>
                <span className="whitespace-nowrap">Pusat Bantuan</span>
             </button>
          </div>
        </nav>
        <div className="p-6 border-t border-slate-100 shrink-0 w-[260px]">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all text-sm font-bold">
            <LogOut size={20} />
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
              <h1 className="text-[18px] lg:text-[22px] font-extrabold text-slate-800 tracking-tight">SkinPOS Terminal</h1>
              <p className="text-[10px] lg:text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 lg:w-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-[#FF0055] text-sm">
                <span className="hidden lg:block">Elberth</span>
                <span className="block lg:hidden">E</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          
          {/* TAB KASIR */}
          {activeTab === "kasir" && (
            <div className="flex h-full animate-in fade-in duration-300">
              <div className="flex-1 flex flex-col bg-[#F4F7FA]">
                <div className="p-8 pb-2">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Cari layanan atau produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-4 rounded-[1.25rem] bg-white border border-slate-200 outline-none text-[13px] font-bold focus:ring-4 focus:ring-rose-50 focus:border-[#FF0055] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-slate-700 placeholder:text-slate-400" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {inventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                      <div key={item.id} className="relative group">
                        <button onClick={() => handleProductClick(item)} className={`w-full h-full min-h-[160px] bg-white border border-slate-200 rounded-[1.5rem] p-4 lg:p-5 text-left transition-all flex flex-col justify-between ${item.stock <= 0 ? 'opacity-50 grayscale' : 'hover:border-[#FF0055] hover:shadow-[0_10px_30px_rgba(255,0,85,0.06)] hover:-translate-y-1'}`}>
                          <div className="mb-2 lg:mb-4 flex items-center justify-between w-full">
                             <PackagePlus className="w-5 h-5 text-slate-300 group-hover:text-[#FF0055]" strokeWidth={1.5} />
                             {item.stock <= 0 && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Habis</span>}
                          </div>
                          <div className="flex-1 min-h-0">
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{item.type === "Produk" || item.type === "Product" ? "Produk" : "Layanan"}</p>
                             <h3 className="text-[11px] lg:text-[13px] font-bold text-slate-800 leading-tight line-clamp-2">{item.name}</h3>
                          </div>
                          <div className="mt-3">
                             <p className="text-[13px] lg:text-[16px] font-black text-slate-900">{formatRupiah(item.price)}</p>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CART SIDEBAR */}
              <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-[-4px_0_20px_rgba(0,0,0,0.03)]">
                <div className="p-8 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-extrabold text-slate-800 flex items-center gap-3 text-sm tracking-widest uppercase"><ShoppingCart size={18} className="text-[#FF0055]" /> KERANJANG</h2>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{cart.length} Produk</span>
                  </div>
                  
                  <div className="relative">
                    <div className="flex gap-2.5">
                      <input type="text" placeholder="No. Telp Pelanggan..." value={memberPhone} onChange={(e) => handlePhoneChange(e.target.value)} className={`flex-1 px-5 py-3.5 rounded-2xl border text-[13px] font-bold outline-none transition-all shadow-sm ${phoneError ? 'border-rose-500 bg-rose-50 focus:ring-4 focus:ring-rose-50 text-rose-600' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50'}`} />
                      <button onClick={handleCheckMember} disabled={isCheckingMember || !!phoneError} className="bg-[#FF0055] text-white px-5 rounded-2xl hover:bg-[#D40048] transition-all disabled:opacity-50 min-w-[50px] flex items-center justify-center shadow-md shadow-rose-500/20">
                        {isCheckingMember ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} strokeWidth={2.5}/>}
                      </button>
                    </div>
                    {phoneError && <p className="absolute -bottom-5 left-2 text-[10px] font-bold text-rose-500">{phoneError}</p>}
                  </div>

                  {activeMember && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between animate-in zoom-in-95">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><UserCheck size={14} className="text-emerald-500"/></div>
                        <div>
                          <p className="text-[12px] font-bold text-emerald-900">{activeMember.name}</p>
                          {activeMember.dob && <p className="text-[9px] font-semibold text-emerald-700">Ultah: {activeMember.dob}</p>}
                        </div>
                      </div>
                      <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest">-{activeMember.discount * 100}%</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-[#F4F7FA]">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <ReceiptText size={64} strokeWidth={1} className="mb-6 opacity-30" />
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-60">Keranjang Kosong</p>
                    </div>
                  ) : cart.map(item => (
                    <div key={item.cartId} className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm animate-in slide-in-from-right-4 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                           <h4 className="font-bold text-slate-800 text-[13px] leading-tight max-w-[200px]">{item.name}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.variant !== "Normal" ? `Varian: ${item.variant}` : ""}</p>
                        </div>
                        <button onClick={() => handleRemoveFromCart(item.cartId)} className="text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 p-1.5 rounded-full"><XCircle size={16}/></button>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[15px] font-black text-[#FF0055]">{formatRupiah(item.price * item.qty)}</span>
                        <div className="flex items-center gap-3 border border-slate-100 rounded-xl p-1 bg-slate-50">
                           <button onClick={() => updateCartItemQty(item.cartId, item.qty - 1, item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-rose-600 shadow-sm transition-colors"><Minus size={14}/></button>
                           <span className="text-[13px] font-bold w-5 text-center text-slate-800">{item.qty}</span>
                           <button onClick={() => updateCartItemQty(item.cartId, item.qty + 1, item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-emerald-500 shadow-sm transition-colors"><Plus size={14}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-white border-t border-slate-200">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3"><span>Subtotal</span><span className="text-slate-700">{formatRupiah(cart.reduce((s,i)=>s+(i.price*i.qty),0))}</span></div>
                  {activeMember && <div className="flex justify-between text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-3"><span>Diskon</span><span>-{formatRupiah(cart.reduce((s,i)=>s+(i.price*i.qty),0) * activeMember.discount)}</span></div>}
                  <div className="pt-5 border-t border-slate-100 flex justify-between items-end mb-8">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan</span>
                      <span className="text-3xl font-[900] text-slate-900 tracking-tighter">{formatRupiah(cart.reduce((s,i)=>s+(i.price*i.qty),0) - (activeMember ? cart.reduce((s,i)=>s+(i.price*i.qty),0) * activeMember.discount : 0))}</span>
                  </div>
                  <button onClick={handleCheckout} disabled={cart.length === 0 || isProcessingOrder} className={`w-full py-5 rounded-2xl font-black text-[12px] tracking-[0.2em] uppercase flex justify-center items-center gap-2 transition-all ${cart.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#FF0055] text-white hover:bg-[#D40048] shadow-lg shadow-rose-500/25'}`}>
                    {isProcessingOrder ? <Loader2 size={18} className="animate-spin" /> : "PROSES PEMBAYARAN"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB STOK */}
          {activeTab === "stok" && (
            <div className="h-full p-10 flex gap-10 bg-[#F4F7FA] overflow-y-auto">
              <div className="w-[380px] shrink-0">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 mb-8 text-sm flex items-center gap-3 uppercase tracking-widest"><Boxes size={20} className="text-[#FF0055]"/> Update Stok</h3>
                  <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
                    <button onClick={() => setStockType("masuk")} className={`flex-1 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${stockType === "masuk" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Masuk</button>
                    <button onClick={() => setStockType("keluar")} className={`flex-1 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${stockType === "keluar" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>Keluar</button>
                  </div>
                  <div className="space-y-6">
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Item Produk</label>
                      <select value={stockInput.id} onChange={(e) => setStockInput({...stockInput, id: e.target.value})} className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]">
                        <option value="">-- Pilih SKU --</option>
                        {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Jumlah Produk / Pcs</label>
                      <input type="number" value={stockInput.qty || ""} onChange={(e) => setStockInput({...stockInput, qty: Number(e.target.value)})} className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]" placeholder="0" />
                    </div>
                    {stockType === "masuk" && (
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Tanggal Kedaluwarsa</label>
                        <input type="date" value={stockInput.expDate} onChange={(e) => setStockInput({...stockInput, expDate: e.target.value})} className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]" />
                      </div>
                    )}
                    {stockType === "keluar" && (
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">Alasan Keluar</label>
                        <select value={stockInput.reason} onChange={(e) => setStockInput({...stockInput, reason: e.target.value})} className="w-full px-4 py-4 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 bg-[#FAFAFA]">
                          <option value="rusak">Barang Rusak</option><option value="expired">Expired</option><option value="tester">Tester</option>
                        </select>
                      </div>
                    )}
                    <button onClick={handleStockMutation} className="w-full py-5 bg-[#FF0055] text-white rounded-xl font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-[#D40048] shadow-lg shadow-rose-500/20 transition-all mt-4">Simpan Perubahan</button>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white"><h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-widest">Status Inventaris</h3><span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">Aktif / Terkini</span></div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead><tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 border-b border-slate-100"><th className="px-8 py-5">Detail Item</th><th className="px-8 py-5 text-center">Status</th><th className="px-8 py-5 text-right">Stok Fisik</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventory.map(i => (
                        <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6"><p className="text-[10px] font-black text-[#FF0055] mb-1.5 tracking-wider">{i.id}</p><p className="text-[13px] font-bold text-slate-800">{i.name}</p></td>
                          <td className="px-8 py-6 text-center">
                             <div className="flex flex-col items-center gap-1.5">
                               {i.stock < 10 ? <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 uppercase inline-block">Menipis</span> : <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase inline-block">Aman</span>}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-slate-800 text-lg">{i.stock > 900 ? '∞' : i.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB VOID & HISTORY */}
          {activeTab === "void" && (
            <div className="h-full p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA]">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-slate-800">Riwayat Penjualan</h2>
                 <div className="flex gap-3">
                    <button onClick={() => showToast("success", "Unduh PDF", "Laporan PDF sedang diunduh.")} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#FF0055] transition-all shadow-md">
                       <FileDown size={14} /> Unduh PDF
                    </button>
                    <button onClick={() => showToast("success", "Unduh Excel", "Rekapitulasi Excel berhasil dibuat.")} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md">
                       <FileSpreadsheet size={14} /> Unduh Excel
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {orders.length === 0 ? (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-200 border-dashed shadow-sm">
                    <History size={48} className="mx-auto text-slate-300 mb-6" />
                    <p className="font-bold text-slate-400 text-sm tracking-widest uppercase">Belum ada riwayat transaksi</p>
                  </div>
                ) : orders.map(order => (
                  <div key={order.id} className={`bg-white border border-slate-200 rounded-[2rem] p-8 transition-all hover:border-[#FF0055] shadow-sm hover:shadow-[0_10px_30px_rgba(255,0,85,0.06)] hover:-translate-y-1 ${order.status !== 'pending' && 'opacity-60 grayscale-[0.2]'}`}>
                    <div className="flex justify-between items-start mb-6 pb-5 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{order.id}</span>
                        <p className="text-[10px] font-semibold text-slate-400 mt-2 flex items-center gap-1.5"><Clock size={12}/> {order.time ? order.time.replace(':', '.') : ''}</p>
                      </div>
                      <p className="text-xl font-black text-slate-800">{formatRupiah(order.grandTotal)}</p>
                    </div>
                    <div className="space-y-3 mb-6 h-24 overflow-y-auto scrollbar-hide">
                      {order.items.map((it:any, idx:number) => <p key={idx} className="text-[12px] font-bold text-slate-500 flex justify-between"><span>{it.qty}x {it.name} <span className="text-[9px] opacity-70 font-semibold ml-1">({it.variant})</span></span></p>)}
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      {order.status === 'pending' ? (
                        <div className="grid grid-cols-2 gap-3">
                           <button onClick={() => handleVoidRequest(order)} className="text-[11px] font-bold py-3 rounded-xl border border-slate-200 text-[#FF0055] hover:bg-rose-50 hover:border-rose-200 transition-all bg-white shadow-sm">Ajukan Pembatalan</button>
                           <button onClick={() => handleSelesaikanTransaksi(order)} className="text-[11px] font-bold py-3 rounded-xl bg-slate-800 text-white hover:bg-[#FF0055] transition-all shadow-md">Selesai</button>
                        </div>
                      ) : <div className={`text-center py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{order.status === 'completed' ? 'Selesai' : 'Batal'}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB MANAJEMEN MEMBER DENGAN INPUT TANGGAL LAHIR */}
          {activeTab === "members" && (
            <div className="h-full p-10 overflow-y-auto animate-in fade-in bg-[#F4F7FA] flex gap-8">
               <div className="w-[360px] shrink-0">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                     <h3 className="font-extrabold text-slate-800 mb-6 flex items-center gap-2"><UserCheck size={20} className="text-[#FF0055]"/> Tambah Anggota VIP</h3>
                     <form onSubmit={handleAddMember} className="space-y-5">
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nama Anggota</label>
                           <input type="text" value={newMember.name} onChange={(e)=>setNewMember({...newMember, name: e.target.value})} placeholder="Masukkan nama" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nomor HP</label>
                           <input type="text" value={newMember.phone} onChange={(e)=>setNewMember({...newMember, phone: e.target.value})} placeholder="08..." className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50" />
                        </div>
                        <div>
                           {/* DITAMBAHKAN INPUT TANGGAL LAHIR */}
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tanggal Lahir</label>
                           <input type="date" value={newMember.dob} onChange={(e)=>setNewMember({...newMember, dob: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50 text-slate-500" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Diskon Standar (%)</label>
                           <input type="number" min="0" max="100" value={newMember.discount} onChange={(e)=>setNewMember({...newMember, discount: Number(e.target.value)})} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none text-[13px] font-bold focus:border-[#FF0055] focus:ring-4 focus:ring-rose-50" />
                        </div>
                        <button type="submit" className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-[#FF0055] shadow-md transition-all mt-2">Simpan Data</button>
                     </form>
                  </div>
               </div>
               <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                     <h3 className="font-extrabold text-slate-800">Data Anggota</h3>
                     <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">Total: {members.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                     <table className="w-full text-left">
                       <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                             <th className="px-8 py-5">Nama Anggota</th>
                             <th className="px-8 py-5">Nomor HP</th>
                             <th className="px-8 py-5">Tanggal Lahir</th>
                             <th className="px-8 py-5 text-center">Hak Diskon</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {members.map((m, idx) => (
                           <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-5 font-bold text-slate-800 text-[13px]">{m.name}</td>
                             <td className="px-8 py-5 font-semibold text-slate-500 text-[12px]">{m.phone}</td>
                             {/* DITAMBAHKAN TAMPILAN TANGGAL LAHIR */}
                             <td className="px-8 py-5 font-semibold text-slate-500 text-[12px]">{m.dob || "-"}</td>
                             <td className="px-8 py-5 text-center"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[11px] font-black border border-emerald-100">{m.discount * 100}%</span></td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* MODALS */}
        
        {/* MODAL PILIH VARIAN */}
        {selectedProduct && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[700] flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100">
                 <h3 className="font-extrabold text-slate-800 text-lg mb-1">Pilih Varian Item</h3>
                 <p className="text-[12px] font-bold text-slate-400 mb-6">{selectedProduct.name}</p>
                 
                 <div className="grid grid-cols-2 gap-3 mb-8">
                    {["Normal", "Paket Bundling", "Travel Size"].map(v => (
                       <button key={v} onClick={() => setSelectedVariant(v)} className={`py-3.5 px-4 rounded-xl border-2 text-[12px] font-bold transition-all ${selectedVariant === v ? 'border-[#FF0055] bg-rose-50 text-[#FF0055]' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                          {v}
                       </button>
                    ))}
                 </div>
                 
                 <div className="flex gap-3">
                   <button onClick={() => setSelectedProduct(null)} className="flex-1 py-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest">Batal</button>
                   <button onClick={() => processAddToCart(selectedProduct, selectedVariant)} className="flex-1 py-4 rounded-xl font-bold bg-[#FF0055] text-white hover:bg-[#D40048] transition-all text-[11px] uppercase tracking-widest shadow-md">Masuk Keranjang</button>
                 </div>
              </div>
           </div>
        )}

        {/* RECEIPT MODAL */}
        {showReceipt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in-95 border border-slate-100">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle2 size={40} strokeWidth={2}/></div>
              <h3 className="text-center font-black text-slate-800 text-xl mb-8 tracking-tight">TRANSAKSI SUKSES</h3>
              <div className="bg-[#F8FAFC] p-6 rounded-2xl font-mono text-[11px] border border-slate-200 space-y-4 mb-8 text-slate-600">
                <p className="text-center font-bold border-b border-dashed border-slate-300 pb-4 mb-4 uppercase tracking-[0.2em] text-slate-400">ROSEREVE CLINIC</p>
                {showReceipt.items.map((c: any) => <div key={c.cartId} className="flex justify-between font-bold"><span>{c.qty}x {c.name.slice(0,15)} <span className="opacity-70">({c.variant.slice(0,3)})</span></span><span>{formatRupiah(c.price * c.qty)}</span></div>)}
                <div className="border-t border-dashed border-slate-300 pt-5 mt-5 flex justify-between font-black text-slate-800 text-sm"><span>TOTAL</span><span>{formatRupiah(showReceipt.grandTotal)}</span></div>
              </div>
              <button onClick={() => setShowReceipt(null)} className="w-full bg-[#FF0055] text-white py-5 rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase hover:bg-[#D40048] transition-all shadow-xl shadow-rose-500/20">TUTUP STRUK</button>
            </div>
          </div>
        )}

        {/* VOID PIN MODAL */}
        {voidTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in-95 border border-slate-100">
              <div className="w-20 h-20 bg-rose-50 text-[#FF0055] rounded-full flex items-center justify-center mx-auto mb-6"><KeyRound size={36}/></div>
              <h3 className="text-center font-black text-slate-800 text-lg mb-3 uppercase tracking-widest">Akses Manager</h3>
              <p className="text-center text-[11px] font-bold text-slate-400 mb-8 uppercase tracking-wider">Masukkan Kata Sandi otorisasi pesanan <br/><span className="text-[#FF0055]">{voidTarget.id}</span></p>
              <input type="password" maxLength={6} value={voidPinInput} onChange={(e) => setVoidPinInput(e.target.value)} autoFocus placeholder="••••••" className="w-full text-center text-4xl tracking-[0.5em] font-black py-5 bg-[#F8FAFC] rounded-2xl border-2 border-slate-200 outline-none focus:border-[#FF0055] focus:bg-white focus:ring-4 focus:ring-rose-50 text-[#FF0055] mb-8 transition-colors" />
              <div className="flex gap-4">
                <button onClick={() => setVoidTarget(null)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest">Batal</button>
                <button onClick={submitVoid} className="flex-1 py-4 rounded-2xl font-bold bg-slate-800 text-white hover:bg-[#FF0055] transition-all text-[11px] uppercase tracking-widest shadow-xl">Verifikasi</button>
              </div>
            </div>
          </div>
        )}

        {/* PUSAT BANTUAN MODAL */}
        {showHelpCenter && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[800] flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 border border-slate-100">
                 <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"><HelpCircle size={32}/></div>
                 <h3 className="text-center font-black text-slate-800 text-xl mb-6">Pusat Bantuan</h3>
                 <div className="space-y-3 mb-8">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="font-bold text-sm text-slate-800 mb-1">Cara membatalkan transaksi?</p>
                       <p className="text-xs text-slate-500 leading-relaxed">Buka tab "Riwayat & Laporan", pilih transaksi "Ajukan Pembatalan", lalu minta Kata Sandi Otorisasi Manager.</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="font-bold text-sm text-slate-800 mb-1">Peralatan kasir macet?</p>
                       <p className="text-xs text-slate-500 leading-relaxed">Silakan periksa koneksi kabel printer, atau hubungi langsung Divisi IT di nomor Ekstensi 101.</p>
                    </div>
                 </div>
                 <button onClick={() => setShowHelpCenter(false)} className="w-full py-4 rounded-2xl font-bold bg-slate-800 text-white hover:bg-[#FF0055] transition-all text-[11px] uppercase tracking-widest">Tutup</button>
              </div>
           </div>
        )}

        {/* LOGOUT CONFIRM */}
        {showLogoutConfirm && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in">
             <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl text-center border border-slate-100">
                <div className="w-20 h-20 bg-rose-50 text-[#FF0055] rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={36}/></div>
                <h2 className="text-2xl font-black text-slate-800 mb-4">Keluar?</h2>
                <p className="text-[12px] font-bold text-slate-500 mb-10 leading-relaxed uppercase tracking-wider">Anda akan mengakhiri sesi kasir.</p>
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
            <div className="bg-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]">
              {toast.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={24} /> : toast.type === 'error' ? <XCircle className="text-[#FF0055]" size={24} /> : <Info className="text-blue-400" size={24} />}
              <div><h4 className="font-bold text-white text-[13px] tracking-wide mb-0.5">{toast.title}</h4><p className="text-[11px] font-medium text-slate-400">{toast.subtitle}</p></div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}