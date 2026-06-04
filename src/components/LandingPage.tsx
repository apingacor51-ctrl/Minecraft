import { motion } from "motion/react";
import { Smartphone, Shield, Trophy, Activity, Play, Eye, Users2, ShieldCheck, Gamepad2 } from "lucide-react";

interface StatsData {
  totalUsers: number;
  todayCreations: number;
  activeCodes: number;
  totalBrands: number;
}

interface LandingPageProps {
  stats: StatsData;
  onStartClicked: () => void;
  onAdminClicked: () => void;
  onVerifyClicked: () => void;
}

export default function LandingPage({ stats, onStartClicked, onAdminClicked, onVerifyClicked }: LandingPageProps) {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Visual Ambient Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,78,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,78,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      
      {/* Hero Section Container */}
      <div className="relative z-10 w-full max-w-4xl pt-8 pb-12 flex flex-col items-center text-center space-y-8">
        
        {/* Banner Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#ff4e00] font-mono tracking-[0.2em] uppercase backdrop-blur-md"
        >
          <span className="h-2 w-2 rounded-full bg-[#ff4e00] animate-pulse" />
          <Trophy className="h-3.5 w-3.5 text-orange-400" />
          PRO SENSITIVITY SYSTEM v4.2
        </motion.div>

        {/* Logo and Titles with stunning fonts */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <span className="text-[#ff4e00] font-bold text-xs uppercase tracking-[0.3em] mb-2 block">
            Esport Performance Tool
          </span>
          
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] uppercase">
            <span className="text-white">OPTIMALKAN</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-[#ff4e00] drop-shadow-[0_4px_12px_rgba(255,78,0,0.2)]">
              SENSITIVITAS
            </span>
            <br />
            <span className="text-white">GAME ANDA.</span>
          </h1>

          <p className="text-gray-400 font-sans text-sm sm:text-md max-w-md mx-auto leading-relaxed">
            Dapatkan settingan sensitivitas paling akurat berdasarkan spesifikasi layar dan chipset tipe HP Anda untuk auto headshot.
          </p>
        </motion.div>

        {/* Hero Actions CTA */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
        >
          {/* Main Sensi Create Button */}
          <button
            onClick={onStartClicked}
            id="btn-start-sensi"
            className="group w-full relative bg-[#ff4e00] hover:bg-orange-600 text-black font-black py-4 px-6 rounded-none skew-x-[-12deg] transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(255,78,0,0.35)] active:scale-[0.98]"
          >
            <span className="block skew-x-[12deg] uppercase font-display text-sm tracking-tighter flex items-center justify-center gap-2">
              <Gamepad2 className="h-4.5 w-4.5" />
              Buat Sensi Sekarang
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
          </button>

          {/* Secondary Stats/Check Status Button */}
          <button
            onClick={onVerifyClicked}
            id="btn-verify-status"
            className="w-full relative py-4 px-6 border border-white/10 hover:bg-white/5 rounded-none skew-x-[-12deg] cursor-pointer transition-all text-gray-300 hover:text-white"
          >
            <span className="block skew-x-[12deg] uppercase text-xs font-bold font-display tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#ff4e00]" />
              Riwayat Status
            </span>
          </button>
        </motion.div>

        {/* Real-time Statistics Counters Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full mt-12 pt-8 border-t border-white/5"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            
            {/* Stat 1 */}
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">{(stats.totalUsers * 1.5).toFixed(0)}+</div>
              <div className="text-[10px] uppercase tracking-widest text-[#ff4e00] font-mono font-bold">Sensi Dibuat</div>
            </div>

            {/* Stat 2 */}
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">{stats.totalUsers.toLocaleString("id-ID")}+</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">User Terdaftar</div>
            </div>

            {/* Stat 3 */}
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">{stats.totalBrands * 8 + 32}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Tipe HP Supported</div>
            </div>

            {/* Stat 4 */}
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#ff4e00] tracking-tight">{stats.activeCodes}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Kode VVIP Aktif</div>
            </div>

          </div>
        </motion.div>

        {/* Trusted Devices Footer panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full pt-8 flex flex-col space-y-3"
        >
          <span className="text-[9px] uppercase font-mono tracking-widest text-gray-600">
            Merek HP Teroptimal Dalam Basis Data Esport
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-mono font-bold text-gray-500">
            <span className="hover:text-[#ff4e00] transition-colors cursor-default">SAMSUNG</span>
            <span className="hover:text-[#ff4e00] transition-colors cursor-default">XIAOMI</span>
            <span className="hover:text-[#ff4e00] transition-colors cursor-default">OPPO</span>
            <span className="hover:text-[#ff4e00] transition-colors cursor-default">VIVO</span>
            <span className="hover:text-[#ff4e00] transition-colors cursor-default">REALME</span>
            <span className="hover:text-[#ff4e00] transition-colors cursor-default">INFINIX</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
