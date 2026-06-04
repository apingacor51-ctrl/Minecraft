import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Zap } from "lucide-react";

interface FFLoaderProps {
  onComplete?: () => void;
  duration?: number;
}

const TIPS = [
  "Maksimalkan Drag Shoot dengan memposisikan tombol tembak sedikit ke arah bawah sebelum ditarik ke atas.",
  "Sensitivitas tinggi memudahkan jump-shoot, sedangkan sensitivitas rendah menstabilkan scope jauh.",
  "Aktifkan tombol 'Quick Weapon Switch' untuk mengganti senjata dengan instan saat bertempur.",
  "Pengaturan DPI yang terlalu besar berpotensi memperpendek masa pakai layar HP Anda.",
  "Sensitivitas yang tepat akan memberikan rasio Headshot hingga 85% lebih konsisten!",
  "Gunakan teknik kopdar (refleks cepat) saat menembak musuh menggunakan senjata tipe Shotgun SG2."
];

export default function FFLoader({ onComplete, duration = 2500 }: FFLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 1200);

    const step = duration / 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onComplete) {
            setTimeout(onComplete, 300);
          }
          return 100;
        }
        // Random incremental increments to mimic game load loading
        const next = prev + Math.floor(Math.random() * 8) + 1;
        return next > 100 ? 100 : next;
      });
    }, step);

    return () => {
      clearInterval(tipInterval);
      clearInterval(timer);
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#050505] p-6 text-white overflow-hidden">
      {/* Dynamic Gaming Background Glows */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[#ff4e00]/5 blur-[100px] ambient-glow" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-[#ff4e00]/5 blur-[100px] ambient-glow" />

      {/* Top Margin Header */}
      <div className="mt-8 text-center z-10">
        <div className="flex items-center justify-center gap-2 text-[#ff4e00] font-mono tracking-widest text-xs uppercase mb-2">
          <Zap className="h-4 w-4 text-[#ff4e00] animate-pulse" />
          EST. 2026 SERVICES
        </div>
        <h2 className="font-display font-black text-2xl tracking-widest text-white drop-shadow-lg">
          FREE FIRE <span className="text-[#ff4e00]">INDONESIA</span>
        </h2>
        <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 block">
          SECURE SENSITIVITY ENGINE
        </span>
      </div>

      {/* Logo Display */}
      <div className="flex flex-col items-center justify-center space-y-4 z-10">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5 }}
           className="relative flex items-center justify-center h-28 w-28 bg-white/5 border border-white/10 p-[2px] shadow-2xl"
        >
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#050505] p-4">
            <span className="text-4xl font-black text-white font-display">FF</span>
            <span className="bg-[#ff4e00] text-[10px] text-black font-black px-1.5 py-0.5 rounded-none uppercase tracking-tighter">
              SENSI
            </span>
          </div>
          <div className="absolute -inset-1 bg-[#ff4e00]/10 blur-sm -z-10 animate-pulse" />
        </motion.div>
        
        {/* Spinner Element */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff4e00] animate-bounce delay-100" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff4e00] animate-bounce delay-200" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff4e00] animate-bounce delay-300" />
        </div>
      </div>

      {/* Loading Progress Frame */}
      <div className="w-full max-w-sm flex flex-col space-y-4 z-10 mb-12">
        <div className="flex justify-between items-end font-mono text-xs">
          <span className="text-gray-400 uppercase tracking-widest text-[9px]">
            Mengunduh modul sensi...
          </span>
          <span className="text-[#ff4e00] font-bold text-sm tracking-tighter">
            {progress}%
          </span>
        </div>

        {/* Outer bar */}
        <div className="h-2 w-full bg-[#050505] border border-white/5 p-[1px] relative overflow-hidden">
          <motion.div
            className="h-full bg-[#ff4e00] shadow-[0_0_8px_rgba(255,78,0,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Outer tips widget */}
        <div className="h-14 flex items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] text-gray-400 leading-relaxed font-sans max-w-[280px]"
            >
              <span className="text-[#ff4e00] font-bold uppercase mr-1">TIPS:</span>
              {TIPS[tipIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
