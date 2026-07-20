"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, EyeOff, Eye, ShieldCheck, 
  AlertCircle, Sparkles, ArrowLeft, Loader2,
  ShoppingCart, LayoutDashboard, Megaphone
} from "lucide-react";

import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"] 
});

export default function LoginPage() {
  const router = useRouter();
  
  const [selectedRole, setSelectedRole] = useState<"none" | "kasir" | "manager" | "marketing" | "admin">("none");
  const [cashierName, setCashierName] = useState("");
  const [initialFloat, setInitialFloat] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatInputRibuan = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("id-ID").format(Number(clean));
  };

  const parseInputRibuan = (val: string) => {
    return Number(val.replace(/\D/g, "")) || 0;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-tr from-[#FFF5F7] via-[#FFF9FA] to-[#FFF0F2] flex items-center justify-center p-6 relative overflow-hidden ${jakarta.className}`}>
      
      {/* Decorative Light Backgrounds */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-white rounded-full opacity-40"></div>
      <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-rose-100/20 rounded-full opacity-40"></div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(255,0,85,0.04)] border border-white p-8 lg:p-10 relative z-10">
        
        {/* LOGO & HEADER */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#FF0055] text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/25">
            <ShieldCheck size={32} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-[855] text-slate-900 tracking-tight flex items-center gap-2 mb-1.5">
            SkinPOS <Sparkles className="text-[#FF0055]" size={22} />
          </h1>
          <p className="text-[#FF0055] text-[9px] font-black uppercase tracking-[0.25em] text-center leading-relaxed">
            Esthetic Rosereve Japan <br/>
            <span className="text-slate-400 font-bold tracking-widest text-[8px] mt-0.5 block">Portal Keamanan Terpadu</span>
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-100 text-[#FF0055] px-4 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-sm animate-in fade-in duration-300">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ROLE SELECTOR VIEW */}
        {selectedRole === "none" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Pilih Portal Akses Anda</p>
            
            <button
              onClick={() => {
                setError("");
                setSelectedRole("kasir");
              }}
              className="w-full p-5 bg-white hover:border-[#FF0055] border-2 border-slate-100 hover:bg-rose-50/30 rounded-3xl transition-all flex items-center gap-4 text-left group shadow-sm"
            >
              <div className="w-12 h-12 bg-rose-50 text-[#FF0055] rounded-2xl flex items-center justify-center group-hover:bg-[#FF0055] group-hover:text-white transition-all shadow-sm">
                <ShoppingCart size={22} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm tracking-wide">TERMINAL KASIR</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Buka shift kasir & transaksi POS</p>
              </div>
            </button>

            <button
              onClick={() => {
                setError("");
                setPassword("");
                setSelectedRole("manager");
              }}
              className="w-full p-5 bg-white hover:border-slate-800 border-2 border-slate-100 hover:bg-slate-50 rounded-3xl transition-all flex items-center gap-4 text-left group shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-all shadow-sm">
                <LayoutDashboard size={22} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm tracking-wide">MANAGER DASHBOARD</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Audit shift, laporan, & batalkan transaksi</p>
              </div>
            </button>

            <button
              onClick={() => {
                setError("");
                setPassword("");
                setSelectedRole("marketing");
              }}
              className="w-full p-5 bg-white hover:border-emerald-500 border-2 border-slate-100 hover:bg-emerald-50/20 rounded-3xl transition-all flex items-center gap-4 text-left group shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                <Megaphone size={22} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm tracking-wide">MARKETING PORTAL</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Kelola voucher promo & blast CRM</p>
              </div>
            </button>
          </div>
        )}

        {/* KASIR BUKA SHIFT FORM */}
        {selectedRole === "kasir" && (
          <div className="animate-in slide-in-from-right-4 duration-300 space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-slate-800 font-black text-lg">BUKA SHIFT TERMINAL KASIR</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Masukkan nama & laci modal kas awal</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!cashierName || !initialFloat) {
                setError("Silakan isi semua data.");
                return;
              }
              setIsLoading(true);
              setTimeout(() => {
                const floatVal = parseInputRibuan(initialFloat);
                const timeNow = new Date().toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" });
                const newShift = {
                  cashierName,
                  initialFloat: floatVal,
                  startTime: timeNow,
                  date: new Date().toLocaleDateString("id-ID")
                };
                localStorage.setItem("skinpos_active_shift", JSON.stringify(newShift));
                sessionStorage.setItem("isAuthenticated", "true");
                sessionStorage.setItem("userRole", "kasir");
                router.push("/Cashier");
              }, 800);
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#FF0055] uppercase tracking-widest ml-1">Nama Kasir</label>
                <input 
                  type="text" 
                  value={cashierName} 
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="Contoh: Sarah Amelia"
                  className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 px-4 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-rose-50 focus:border-[#FF0055] transition-all font-bold text-xs"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#FF0055] uppercase tracking-widest ml-1">Uang Kas Awal (Rp)</label>
                <input 
                  type="text" 
                  value={initialFloat} 
                  onChange={(e) => setInitialFloat(formatInputRibuan(e.target.value))}
                  placeholder="Contoh: 500.000"
                  className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 px-4 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-rose-50 focus:border-[#FF0055] transition-all font-bold text-xs"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-[#FF0055] hover:bg-[#D40048] text-white font-black text-xs tracking-[0.2em] uppercase shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Buka Shift & Masuk"}
              </button>
            </form>

            <button
              onClick={() => setSelectedRole("none")}
              className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#FF0055] transition-colors p-2"
            >
              <ArrowLeft size={14} /> Kembali
            </button>
          </div>
        )}

        {/* PASSWORD PROMPT FOR MANAGER / MARKETING / ADMIN */}
        {(selectedRole === "manager" || selectedRole === "marketing" || selectedRole === "admin") && (
          <div className="animate-in slide-in-from-right-4 duration-300 space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-slate-800 font-black text-lg uppercase">Portal Keamanan {selectedRole}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Masukkan kata sandi akses</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setError("");
              setIsLoading(true);
              
              setTimeout(() => {
                if (password === "123") {
                  sessionStorage.setItem("isAuthenticated", "true");
                  sessionStorage.setItem("userRole", selectedRole);
                  router.push(
                    selectedRole === "manager" 
                      ? "/Manager" 
                      : selectedRole === "marketing"
                      ? "/Marketing"
                      : "/AdminIT"
                  );
                } else {
                  setError("Kata sandi salah.");
                  setIsLoading(false);
                }
              }, 800);
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kata Sandi</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-800 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan sandi (123)" 
                    className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 pl-11 pr-11 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-800 transition-all font-bold tracking-wide placeholder:font-medium placeholder:tracking-normal text-xs"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs tracking-[0.2em] uppercase shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Masuk"}
              </button>
            </form>

            <button
              onClick={() => setSelectedRole("none")}
              className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors p-2"
            >
              <ArrowLeft size={14} /> Kembali
            </button>
          </div>
        )}

        {/* FOOTER BANTUAN */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            MENGALAMI MASALAH SISTEM? <br/>
            <button 
              onClick={() => {
                window.open("https://mail.google.com/mail/?view=cm&fs=1&to=skinpos.helpdesk@gmail.com&su=Laporan%20Kendala%20SkinPOS", "_blank");
              }}
              className="text-[#FF0055] font-black cursor-pointer hover:text-[#D40048] hover:underline bg-transparent border-none p-0 mt-1 transition-colors tracking-widest uppercase text-[9px]"
            >
              Hubungi IT Support Admin
            </button>
          </p>
          <div>
            <button
              type="button"
              onClick={() => {
                setError("");
                setPassword("");
                setSelectedRole("admin" as any);
              }}
              className="text-slate-400 hover:text-[#FF0055] text-[8px] font-extrabold tracking-widest uppercase transition-colors"
            >
              [ Masuk Konsol IT Support ]
            </button>
          </div>
        </div>

      </div>

      <div className="absolute bottom-6 text-center z-10">
        <p className="text-[8px] font-bold text-pink-300 uppercase tracking-[0.25em]">
          SkinPOS System V.2.4.0 • Secured Portal
        </p>
      </div>

    </div>
  );
}