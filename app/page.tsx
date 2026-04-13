"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, User, EyeOff, Eye, ShieldCheck, 
  AlertCircle, Sparkles, Mail, ArrowLeft, CheckCircle2 
} from "lucide-react";

// --- MENGGUNAKAN FONT MONTSERRAT & PLAYFAIR ---
import { Montserrat, Playfair_Display } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"] });

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
        // --- AKSES BARU: MARKETING ---
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userRole", "marketing");
        router.push("/Marketing");
      } else {
        setError("Username atau password salah. (Coba: kasir / manager / fat / marketing)");
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
    <div className={`min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 selection:bg-pink-200 relative overflow-hidden ${montserrat.className}`}>
      
      <div className="absolute top-0 -left-20 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-pink-300/20 rounded-full blur-3xl opacity-60"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-pink-200/50 border border-white p-10 relative z-10 overflow-hidden">
        
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-20 h-20 bg-pink-600 text-white rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-pink-200 ring-8 ring-pink-50">
            <ShieldCheck size={40} />
          </div>
          <h1 className={`text-4xl text-pink-950 flex items-center gap-2 ${playfair.className}`}>
            SkinPOS <Sparkles className="text-pink-400" size={24} />
          </h1>
          <p className="text-pink-500 text-xs font-bold uppercase tracking-[0.2em] mt-3 text-center leading-relaxed">
            Esthetic Rosereve Japan <br/> Operasional Terpadu
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-500 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* --- FORM LOGIN --- */}
        {view === "login" && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-pink-500 uppercase tracking-widest ml-1">Username Akses</label>
                <div className="relative group">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:text-pink-600 transition-colors" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda" 
                    className="w-full bg-white border border-pink-100 text-slate-800 px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all font-medium placeholder:font-normal placeholder:text-pink-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-pink-500 uppercase tracking-widest ml-1">Kunci Password</label>
                <div className="relative group">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:text-pink-600 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda" 
                    className="w-full bg-white border border-pink-100 text-slate-800 pl-12 pr-14 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all font-medium tracking-wide placeholder:font-normal placeholder:tracking-normal placeholder:text-pink-300 shadow-sm"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1 pb-2">
                <button 
                  type="button" 
                  onClick={() => setView("forgot")}
                  className="text-xs font-semibold text-pink-500 hover:text-pink-700 hover:underline transition-all"
                >
                  Lupa Password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
                  isLoading 
                    ? "bg-pink-300 text-white cursor-wait shadow-pink-200" 
                    : "bg-pink-600 text-white hover:bg-pink-700 hover:shadow-pink-300"
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
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
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-pink-950 mb-2">Lupa Password?</h2>
              <p className="text-sm font-medium text-pink-500 leading-relaxed">
                Jangan khawatir. Masukkan username atau email Anda, kami akan mengirimkan instruksi ke IT Support.
              </p>
            </div>

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-pink-500 uppercase tracking-widest ml-1">Email / Username</label>
                  <div className="relative group">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:text-pink-600 transition-colors" />
                    <input 
                      type="text" 
                      value={resetInput}
                      onChange={(e) => setResetInput(e.target.value)}
                      placeholder="contoh: marketing / help@skinpos.com" 
                      className="w-full bg-white border border-pink-100 text-slate-800 px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all font-medium placeholder:font-normal placeholder:text-pink-300 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
                    isLoading 
                      ? "bg-pink-300 text-white cursor-wait shadow-pink-200" 
                      : "bg-pink-950 text-white hover:bg-black hover:shadow-pink-300"
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Kirim Permintaan Reset"
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center shadow-sm">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
                <h3 className="font-black text-emerald-900 mb-1">Permintaan Terkirim!</h3>
                <p className="text-sm font-medium text-emerald-700">
                  Sistem telah mencatat permintaan reset untuk <span className="font-bold">{resetInput}</span>. Silakan hubungi Manager Anda.
                </p>
              </div>
            )}

            <button 
              onClick={backToLogin}
              className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-bold text-pink-500 hover:text-pink-700 transition-colors p-2"
            >
              <ArrowLeft size={16} /> Kembali ke Halaman Login
            </button>
          </div>
        )}

        <p className="text-center text-[10px] font-semibold text-pink-400 mt-10 uppercase tracking-widest leading-relaxed border-t border-pink-100 pt-6">
          Mengalami Masalah Sistem? <br/>
          <button 
            onClick={() => {
              window.open("https://mail.google.com/mail/?view=cm&fs=1&to=skinpos.helpdesk@gmail.com&su=Laporan%20Kendala%20SkinPOS", "_blank");
            }}
            className="text-pink-600 font-bold cursor-pointer hover:underline bg-transparent border-none p-0 mt-1"
          >
            Hubungi IT Support Admin
          </button>
        </p>

      </div>

      <div className="absolute bottom-6 text-center z-10">
        <p className="text-[10px] font-bold text-pink-400/80 uppercase tracking-widest">
          SkinPOS System v.2.4.0 • Secured Portal
        </p>
      </div>

    </div>
  );
}