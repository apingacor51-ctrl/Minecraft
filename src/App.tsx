import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, Shield, Lock, Smartphone, Phone, ArrowLeft, Eye, 
  Calendar, Key, Check, ShieldCheck, HelpCircle, User, LogIn, Sparkles
} from "lucide-react";
import { Brand, User as UserType, SensitivityValues, AdminState } from "./types";
import LandingPage from "./components/LandingPage";
import SensiForm from "./components/SensiForm";
import ResultSection from "./components/ResultSection";
import AdminPanel from "./components/AdminPanel";
import FFLoader from "./components/FFLoader";

export default function App() {
  const [showGameLoader, setShowGameLoader] = useState(true);
  
  // App views: "home" | "form" | "result" | "check_status" | "admin_login" | "admin"
  const [view, setView] = useState<"home" | "form" | "result" | "check_status" | "admin_login" | "admin">("home");

  // Dynamic state stores
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 4521,
    todayCreations: 245,
    activeCodes: 56,
    totalBrands: 15
  });

  // Active sensitivity session state
  const [activeSens, setActiveSens] = useState<SensitivityValues | null>(null);
  const [activeUser, setActiveUser] = useState<UserType | null>(null);

  // Status check states (Indonesian phone validations)
  const [checkWhatsapp, setCheckWhatsapp] = useState("");
  const [statusError, setStatusError] = useState("");
  const [foundHistory, setFoundHistory] = useState<UserType[]>([]);
  const [hasSearchedStatus, setHasSearchedStatus] = useState(false);

  // Admin section state
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminUser, setAdminUser] = useState<AdminState | null>(null);

  // Load baseline statistics and brands on boot
  useEffect(() => {
    fetchBrandsAndStats();
    // Re-auth admin from localStorage if exists
    const cachedAdmin = localStorage.getItem("adminSession");
    if (cachedAdmin) {
      try {
        setAdminUser(JSON.parse(cachedAdmin));
      } catch (e) {
        localStorage.removeItem("adminSession");
      }
    }
  }, []);

  const fetchBrandsAndStats = async () => {
    try {
      const resBrands = await fetch("/api/brands");
      if (resBrands.ok) {
        const brandsData = await resBrands.json();
        setBrands(brandsData);
      }

      const resStats = await fetch("/api/stats");
      if (resStats.ok) {
        const statsData = await resStats.json();
        setStats(statsData);
      }
    } catch (e) {
      console.warn("API fetching error, falling back to cached model structure:", e);
    }
  };

  // Generate handler from form wizard
  const handleGenerateSensitivity = async (data: { brand: string; device: string; whatsapp: string; code?: string }) => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setActiveSens(result.sensitivities);
        setActiveUser(result.user);
        setView("result");
        // Refetch stats to increment counters
        fetchBrandsAndStats();
        return { success: true, sensitivities: result.sensitivities };
      } else {
        return {
          success: false,
          sensitivities: null,
          error: result.message || result.error,
          errorType: result.error // e.g. "LIMIT_REACHED"
        };
      }
    } catch (e) {
      return { success: false, sensitivities: null, error: "Terjadi gangguan jaringan, coba beberapa saat lagi." };
    }
  };

  // Check user registration status handler
  const handleCheckStatus = async () => {
    const cleanWA = checkWhatsapp.replace(/\D/g, "");
    if (cleanWA.length < 10 || cleanWA.length > 15) {
      setStatusError("Nomor WhatsApp harus berukuran 10 hingga 15 digit angka.");
      return;
    }
    setStatusError("");
    setFoundHistory([]);
    setHasSearchedStatus(true);

    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const allUsers: UserType[] = await res.json();
        // Match numbers in lists
        const matches = allUsers.filter(u => u.whatsapp === cleanWA);
        setFoundHistory(matches);
      }
    } catch (e) {
      setStatusError("Gagal mengambil data status akun.");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    if (!adminUsername || !adminPassword) {
      setAdminLoginError("Hubungi admin untuk mendapatkan rincian akses.");
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminUser(data.user);
        localStorage.setItem("adminSession", JSON.stringify(data.user));
        setView("admin");
        setAdminUsername("");
        setAdminPassword("");
      } else {
        setAdminLoginError(data.error || "Rincian login salah!");
      }
    } catch (e) {
      setAdminLoginError("Terjadi ganguan autentikasi.");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminSession");
    setAdminUser(null);
    setView("home");
  };

  // View specific user's previous sensitivity coefficients on check status page
  const handleViewUserSensi = (userItem: UserType) => {
    // Generate deterministic values based on their registered device details
    // Match logic inside server.ts with simple seed offset to look fully authentic
    const seed = (userItem.brand.length + userItem.device.length) * 3;
    const sensitivities = {
      general: 160 + (seed % 35),
      reddot: 130 + (seed % 28),
      scope2x: 120 + (seed % 25),
      scope4x: 110 + (seed % 22),
      awm: 75 + (seed % 20),
      freelook: 65 + (seed % 20)
    };
    setActiveSens(sensitivities);
    setActiveUser(userItem);
    setView("result");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans flex flex-col justify-between selection:bg-[#ff4e00]/80 selection:text-white relative overflow-hidden">
      
      {/* Background Atmosphere Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ff4e00]/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#ff4e00]/5 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* Dynamic Gaming Loader Cover */}
      <AnimatePresence>
        {showGameLoader && (
          <FFLoader onComplete={() => setShowGameLoader(false)} duration={2000} />
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <header className="z-30 sticky top-0 bg-[#050505]/60 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setView("home")} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#ff4e00] to-orange-700 text-slate-950 rounded-lg flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(255,78,0,0.5)] uppercase transition-transform group-hover:scale-105">
              FF
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tighter uppercase text-white">
                SENSI <span className="text-[#ff4e00]">INDONESIA</span>
              </span>
              <span className="block text-[8px] font-mono text-gray-500 tracking-widest uppercase">ID SERVER • SECURE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("home")}
              className={`text-xs font-medium uppercase tracking-widest transition hidden sm:inline-block ${view === "home" ? "text-[#ff4e00]" : "text-gray-400 hover:text-white"}`}
            >
              Beranda
            </button>
            <button
              onClick={() => setView("check_status")}
              className={`text-xs font-medium uppercase tracking-widest transition hidden sm:inline-block ${view === "check_status" ? "text-[#ff4e00]" : "text-gray-400 hover:text-white"}`}
            >
              Status Akun
            </button>
            
            {adminUser ? (
              <button
                onClick={() => setView("admin")}
                className="px-4 py-2 rounded-lg bg-[#ff4e00]/10 hover:bg-[#ff4e00]/20 border border-[#ff4e00]/30 text-[#ff4e00] font-display font-bold text-xs uppercase tracking-wider transition"
              >
                Admin Panel
              </button>
            ) : (
              <button
                onClick={() => setView(view === "admin_login" ? "home" : "admin_login")}
                className="px-3.5 py-1.5 rounded-lg border border-white/5 hover:border-white/10 bg-white/2 hover:bg-white/5 text-gray-400 hover:text-white font-mono text-xs uppercase tracking-tight transition flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                Admin Portal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Viewport Workspace */}
      <main className="flex-1 py-6 px-4 max-w-6xl w-full mx-auto flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* VIEW: HOME LANDING PAGE */}
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LandingPage 
                stats={stats}
                onStartClicked={() => setView("form")}
                onAdminClicked={() => setView("admin_login")}
                onVerifyClicked={() => setView("check_status")}
              />
            </motion.div>
          )}

          {/* VIEW: GENERATION STEP WIZARD FORM */}
          {view === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <SensiForm 
                brands={brands} 
                onGenerate={handleGenerateSensitivity}
                onBackToHome={() => setView("home")}
              />
            </motion.div>
          )}

          {/* VIEW: VISUAL RESULTS DETAIL SCREEN */}
          {view === "result" && activeSens && activeUser && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ResultSection 
                brand={activeUser.brand}
                device={activeUser.device}
                whatsapp={activeUser.whatsapp}
                sensitivities={activeSens}
                onReset={() => {
                  setActiveSens(null);
                  setActiveUser(null);
                  setView("form");
                }}
              />
            </motion.div>
          )}

          {/* VIEW: ACCOUNT VERIFICATION LOOKUP STATUS */}
          {view === "check_status" && (
            <motion.div
              key="check_status"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl text-gray-100 shadow-2xl relative overflow-hidden animate-fade-in"
            >
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-5">
                <button
                  onClick={() => {
                    setView("home");
                    setCheckWhatsapp("");
                    setFoundHistory([]);
                    setHasSearchedStatus(false);
                  }}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="font-display font-black text-md text-white uppercase tracking-wider">
                  CEK STATUS AKUN REGISTER
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-500 font-mono uppercase text-[9px] mb-1.5">
                    Masukkan Nomor WhatsApp Anda
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={checkWhatsapp}
                      onChange={(e) => setCheckWhatsapp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Contoh: 08123456789"
                      className="flex-1 px-4 py-3 bg-[#050505]/40 border border-white/10 rounded-xl outline-none font-mono text-sm text-[#ff4e00] placeholder:text-gray-600 focus:border-[#ff4e00]"
                    />
                    <button
                      onClick={handleCheckStatus}
                      className="px-6 py-3 rounded-none skew-x-[-12deg] bg-[#ff4e00] hover:bg-orange-600 text-black font-display font-black uppercase text-xs tracking-wider cursor-pointer transition-all"
                    >
                      <span className="block skew-x-[12deg]">Periksa</span>
                    </button>
                  </div>
                </div>

                {statusError && (
                  <div className="p-3 bg-red-950/20 text-red-400 rounded-xl border border-white/10 text-center font-medium">
                    {statusError}
                  </div>
                )}

                {hasSearchedStatus && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h4 className="font-mono text-[10px] text-gray-500 uppercase tracking-widest font-bold">Hasil Penelusuran Riwayat:</h4>
                    
                    {foundHistory.length === 0 ? (
                      <div className="p-5 text-center bg-white/2 border border-white/5 rounded-xl space-y-1">
                        <span className="block font-semibold text-gray-300">Belum Ada Riwayat</span>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Nomor WhatsApp ini belum pernah mendaftar atau menjumpai pembuatan sensitivitas. Anda berhak menggunakan kuota pembuatan GRATIS hari ini!
                        </p>
                        <button
                          onClick={() => setView("form")}
                          className="mt-3 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-none skew-x-[-12deg] bg-[#ff4e00] hover:bg-orange-600 text-black font-display font-black uppercase text-[10px] tracking-wider transition-all"
                        >
                          <span className="block skew-x-[12deg]">Daftar Sekarang</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {foundHistory.map((u) => (
                          <div key={u.id} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2.5">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="block text-[8px] text-gray-500 font-mono uppercase tracking-widest">Gawai Terdaftar</span>
                                <h5 className="font-display font-extrabold text-sm text-white uppercase">{u.brand} {u.device}</h5>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                                u.code_used !== "Gratis" ? "bg-[#ff4e00]/20 text-[#ff4e00] border border-[#ff4e00]/30" : "bg-green-500/10 text-green-400"
                              }`}>
                                {u.code_used}
                              </span>
                            </div>

                            <div className="flex justify-between text-[10px] text-gray-400 font-mono border-t border-white/5 pt-2">
                              <div>
                                <Calendar className="h-3.5 w-3.5 text-gray-600 inline mr-1" />
                                {new Date(u.created_at).toLocaleDateString("id-ID")}
                              </div>
                              <button
                                onClick={() => handleViewUserSensi(u)}
                                className="text-[#ff4e00] hover:text-orange-400 font-bold uppercase transition"
                              >
                                Lihat Sensi &rarr;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* VIEW: ADMIN LOGIN SYSTEM */}
          {view === "admin_login" && (
            <motion.div
              key="admin_login"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl text-gray-100 shadow-2xl relative overflow-hidden"
            >
              <div className="text-center space-y-2 mb-5">
                <div className="mx-auto w-12 h-12 rounded-xl bg-[#ff4e00]/10 text-[#ff4e00] flex items-center justify-center">
                  <Lock className="h-5.5 w-5.5 animate-pulse" />
                </div>
                <h3 className="font-display font-black text-md text-white uppercase tracking-wider">
                  LOGIN ADMINISTRATOR
                </h3>
                <span className="block text-[9px] text-[#ff4e00] font-mono uppercase tracking-widest">FF Sensi Control</span>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-500 font-mono uppercase text-[9px] mb-1">USERNAME</label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Contoh: admin"
                    className="w-full px-4 py-3 bg-[#050505]/40 border border-white/10 rounded-xl outline-none font-mono text-xs text-white placeholder:text-gray-600 focus:border-[#ff4e00]"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-mono uppercase text-[9px] mb-1">PASSWORD ACCESS</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 bg-[#050505]/40 border border-white/10 rounded-xl outline-none font-mono text-xs text-white placeholder:text-gray-600 focus:border-[#ff4e00]"
                  />
                  <span className="block text-[9px] text-gray-600 mt-1">
                    Masukkan kata sandi khusus administrator Anda untuk masuk portal.
                  </span>
                </div>

                {adminLoginError && (
                  <div className="p-3 bg-red-950/20 text-red-400 rounded-xl text-center">
                    {adminLoginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-none skew-x-[-12deg] bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-black font-display font-black uppercase tracking-wider transition cursor-pointer"
                >
                  <span className="block skew-x-[12deg]">MASUK PORTAL</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* VIEW: FULL ADMINISTRATIVE CONTROL PORTAL */}
          {view === "admin" && adminUser && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPanel 
                onLogout={handleAdminLogout} 
                brands={brands}
                onRefreshBrands={fetchBrandsAndStats}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 px-6 sm:px-10 py-5 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#ff4e00] rounded-full"></span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Real-time Stats Active</span>
          </div>
          <div className="text-[10px] text-gray-400 font-mono">
            <span className="font-bold text-white">Cloud Engine</span> Server Dioptimalkan
          </div>
        </div>
        <div className="text-[10px] text-gray-600 font-mono">
          &copy; 2026 CREATE SENSITIVITAS FF ID • ALL RIGHTS RESERVED
        </div>
      </footer>

    </div>
  );
}
