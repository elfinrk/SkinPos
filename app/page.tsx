"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, User, EyeOff, Eye, ShieldCheck, 
  AlertCircle, Sparkles, Mail, ArrowLeft, CheckCircle2, Loader2
} from "lucide-react";

// --- MENGGUNAKAN FONT YANG SAMA DENGAN KASIR ---
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"] 
});

export default function LoginPage() {
  const router = useRouter();
  
  const [view, setView] = useState<"login" | "forgot">("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [resetInput, setResetInput] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const user = username.toLowerCase();
      
      if (user === "kasir" && password === "123") {
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userRole", "kasir");
        router.push("/Cashier");
      } else if (user === "manager" && password === "123") {
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userRole", "manager");
        router.push("/Manager");
      } else if (user === "fat" && password === "123") {
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userRole", "fat");
        router.push("/FatPayroll");
      } else if (user === "marketing" && password === "123") {
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userRole", "marketing");
        router.push("/Marketing");
      } else {
        setError("Username atau password salah.");
        setIsLoading(false);
      }
    }, 1500); 
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setResetSuccess(true);
    }, 1500);
  };

  const backToLogin = () => {
    setView("login");
    setError("");
    setResetSuccess(false);
    setResetInput("");
  };

  return (
    <div className={`min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-6 relative overflow-hidden ${jakarta.className}`}>
      
      {/* Background Ornaments */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-white rounded-full blur-3xl opacity-80"></div>
      <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-rose-100/40 rounded-full blur-3xl opacity-60"></div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_rgba(255,0,85,0.05)] border-2 border-white p-10 relative z-10">
        
        {/* LOGO & HEADER */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-20 h-20 bg-[#FF0055] text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-rose-500/30">
            <ShieldCheck size={40} strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-[800] text-slate-900 tracking-tight flex items-center gap-2 mb-2">
            SkinPOS <Sparkles className="text-[#FF0055]" size={28} />
          </h1>
          <p className="text-[#FF0055] text-[10px] font-black uppercase tracking-[0.2em] text-center leading-relaxed">
            Esthetic Rosereve Japan <br/> Operasional Terpadu
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-100 text-[#FF0055] px-5 py-4 rounded-2xl flex items-center gap-3 text-[13px] font-bold shadow-sm animate-in fade-in">
            <AlertCircle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        {/* --- FORM LOGIN --- */}
        {view === "login" && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#FF0055] uppercase tracking-widest ml-1">Nama Pengguna</label>
                <div className="relative group">
                  <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-[#FF0055] transition-colors" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan nama pengguna Anda" 
                    className="w-full bg-white border-2 border-pink-50 text-slate-800 pl-14 pr-5 py-4 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-rose-50 focus:border-[#FF0055] transition-all font-bold placeholder:font-medium placeholder:text-pink-200 shadow-[0_2px_10px_rgba(255,0,85,0.02)]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#FF0055] uppercase tracking-widest ml-1">Kata Sandi</label>
                <div className="relative group">
                  <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-[#FF0055] transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda" 
                    className="w-full bg-white border-2 border-pink-50 text-slate-800 pl-14 pr-14 py-4 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-rose-50 focus:border-[#FF0055] transition-all font-bold tracking-wide placeholder:font-medium placeholder:tracking-normal placeholder:text-pink-200 shadow-[0_2px_10px_rgba(255,0,85,0.02)]"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-pink-200 hover:text-[#FF0055] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end mt-1 mb-6">
                <button 
                  type="button" 
                  onClick={() => setView("forgot")}
                  className="text-[11px] font-bold text-[#FF0055] hover:text-[#D40048] hover:underline transition-all"
                >
                  Lupa Kata Sandi?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-5 rounded-[1.5rem] font-black text-[13px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all ${
                  isLoading 
                    ? "bg-pink-100 text-pink-400 cursor-not-allowed" 
                    : "bg-[#FF0055] text-white hover:bg-[#D40048] shadow-xl shadow-rose-500/25 hover:-translate-y-0.5"
                }`}
              >
                {isLoading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  "Masuk"
                )}
              </button>
            </form>
          </div>
        )}

        {/* --- FORM LUPA PASSWORD --- */}
        {view === "forgot" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Lupa Password?</h2>
              <p className="text-[12px] font-semibold text-slate-500 leading-relaxed px-2">
                Jangan khawatir. Masukkan username atau email Anda, kami akan mengirimkan instruksi ke IT Support.
              </p>
            </div>

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#FF0055] uppercase tracking-widest ml-1">Email / Username</label>
                  <div className="relative group">
                    <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-[#FF0055] transition-colors" />
                    <input 
                      type="text" 
                      value={resetInput}
                      onChange={(e) => setResetInput(e.target.value)}
                      placeholder="contoh: help@skinpos.com" 
                      className="w-full bg-white border-2 border-pink-50 text-slate-800 pl-14 pr-5 py-4 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-rose-50 focus:border-[#FF0055] transition-all font-bold placeholder:font-medium placeholder:text-pink-200 shadow-[0_2px_10px_rgba(255,0,85,0.02)]"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full py-5 rounded-[1.5rem] font-black text-[13px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all ${
                    isLoading 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-slate-800 text-white hover:bg-slate-900 shadow-xl shadow-slate-200 hover:-translate-y-0.5"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    "Kirim Permintaan"
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[1.5rem] text-center shadow-sm animate-in zoom-in-95">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-black text-emerald-900 mb-2 text-lg">Permintaan Terkirim!</h3>
                <p className="text-[12px] font-bold text-emerald-700 leading-relaxed">
                  Sistem telah mencatat permintaan reset untuk <br/><span className="text-emerald-900 px-2 py-1 bg-emerald-100/50 rounded inline-block mt-2">{resetInput}</span>
                </p>
              </div>
            )}

            <button 
              onClick={backToLogin}
              className="mt-8 w-full flex items-center justify-center gap-2 text-[12px] font-bold text-slate-400 hover:text-[#FF0055] transition-colors p-2"
            >
              <ArrowLeft size={16} /> Kembali ke Halaman Login
            </button>
          </div>
        )}

        {/* FOOTER BANTUAN */}
        <div className="mt-8 pt-6 border-t border-pink-50/50 text-center">
          <p className="text-[10px] font-bold text-pink-300 uppercase tracking-widest leading-relaxed">
            Mengalami Masalah Sistem? <br/>
            <button 
              onClick={() => {
                window.open("https://mail.google.com/mail/?view=cm&fs=1&to=skinpos.helpdesk@gmail.com&su=Laporan%20Kendala%20SkinPOS", "_blank");
              }}
              className="text-[#FF0055] font-black cursor-pointer hover:text-[#D40048] hover:underline bg-transparent border-none p-0 mt-1.5 transition-colors"
            >
              Hubungi IT Support Admin
            </button>
          </p>
        </div>

      </div>

      <div className="absolute bottom-6 text-center z-10">
        <p className="text-[9px] font-bold text-pink-300 uppercase tracking-[0.2em]">
          SkinPOS System V.2.4.0 • Secured Portal
        </p>
      </div>

    </div>
  );
}