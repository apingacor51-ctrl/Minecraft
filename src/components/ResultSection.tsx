import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Copy, Check, RefreshCw, Flame, Target, Sparkles, Smartphone, ShieldCheck, Share2 } from "lucide-react";
import { SensitivityValues } from "../types";

interface ResultSectionProps {
  brand: string;
  device: string;
  whatsapp: string;
  sensitivities: SensitivityValues;
  onReset: () => void;
}

export default function ResultSection({ brand, device, whatsapp, sensitivities, onReset }: ResultSectionProps) {
  const [copied, setCopied] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    // Small delay to trigger smooth sequential progress bar fills on load
    const timer = setTimeout(() => {
      setAnimateProgress(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Format Whatsapp mildly for privacy display, e.g. 0812xxxx882
  const formatWA = (num: string) => {
    if (num.length < 8) return num;
    return `${num.substring(0, 4)}xxxx${num.substring(num.length - 3)}`;
  };

  // Deterministic calculated recommendation fields for game setup based on sensitivity levels
  const dpiValue = Math.floor((sensitivities.general + sensitivities.reddot) / 2.7) + 380;
  const fireButtonSize = Math.floor((sensitivities.general % 10) + 45); // 45% - 55%

  const handleCopy = () => {
    const text = `=== SENSITIVITAS FREE FIRE ===\nBrand: ${brand}\nModel: ${device}\n===============================\nLihat Sekeliling : ${sensitivities.general}\nRed Dot : ${sensitivities.reddot}\n2x Scope : ${sensitivities.scope2x}\n4x Scope : ${sensitivities.scope4x}\nAWM Scope : ${sensitivities.awm}\nFree Look : ${sensitivities.freelook}\nDPI Rekomendasi: ${dpiValue}\nUkuran Tombol Tembak: ${fireButtonSize}%\n===============================\nGenerated automatically by Free Fire Sensi Creator.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parameters = [
    { label: "Lihat Sekeliling", value: sensitivities.general, desc: "Sensitivitas scroll kamera utama tanpa scope.", color: "from-orange-500 to-amber-500" },
    { label: "Red Dot Sight", value: sensitivities.reddot, desc: "Akurasi bidikan lingkar merah sebelum membuka scope.", color: "from-red-500 to-orange-500" },
    { label: "2x Scope", value: sensitivities.scope2x, desc: "Akurasi bidikan scope tingkat zoom 2.", color: "from-amber-500 to-yellow-500" },
    { label: "4x Scope", value: sensitivities.scope4x, desc: "Akurasi bidikan scope tingkat zoom 4.", color: "from-yellow-500 to-orange-500" },
    { label: "AWM Scope", value: sensitivities.awm, desc: "Sensitivitas kontrol menembak sniper senapan runduk.", color: "from-red-600 to-amber-600" },
    { label: "Free Look", value: sensitivities.freelook, desc: "Kecepatan kamera saat menengok sekeliling (tombol mata).", color: "from-orange-600 to-yellow-500" }
  ];

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      
      {/* Visual Esports Card Container */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        
        {/* Glow ambient layer */}
        <div className="absolute top-1/4 right-0 h-44 w-44 bg-[#ff4e00]/10 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Card Header & Brand Information */}
        <div className="border-b border-white/5 pb-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-xl bg-[#ff4e00]/10 text-[#ff4e00] flex items-center justify-center border border-[#ff4e00]/20">
              <Flame className="h-6 w-6 animate-pulse" />
              <div className="absolute -inset-1 rounded-xl bg-[#ff4e00]/20 blur-sm -z-10 animate-ping delay-500 duration-1000" />
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-[#ff4e00] font-bold">
                <Target className="h-3.5 w-3.5 text-[#ff4e00]" />
                SENSITIVITAS BERHASIL DIBUAT
              </span>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
                {brand} <span className="text-[#ff4e00]">{device}</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-col md:items-end text-xs font-mono">
            <span className="text-gray-500 text-[10px] uppercase">Gawai Pengguna</span>
            <span className="text-gray-200 font-extrabold">{formatWA(whatsapp)}</span>
            <span className="text-[9px] text-green-400 flex items-center gap-1 mt-0.5 font-bold uppercase">
              <ShieldCheck className="h-3.5 w-3.5" /> AIM LOCK AKTIF
            </span>
          </div>
        </div>

        {/* Sensitivity Parameters progress list */}
        <div className="space-y-4">
          {parameters.map((param, index) => {
            return (
              <div key={param.label} className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="font-display font-bold text-xs uppercase tracking-wide text-gray-200">
                      {param.label}
                    </span>
                    <span className="block text-[8px] text-gray-500">
                      {param.desc}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-[#ff4e00]">
                    {param.value}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-[#050505] border border-white/5 overflow-hidden relative">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: animateProgress ? `${(param.value / 200) * 100}%` : "0%" }}
                    transition={{ duration: 0.8, delay: index * 0.08, ease: "easeOut" }}
                    className={`h-full rounded-full bg-[#ff4e00] shadow-[0_0_8px_rgba(255,78,0,0.4)]`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* DPI / Additional Pro Config overlay */}
        <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
          
          {/* DPI recommendation */}
          <div className="bg-white/2 rounded-xl border border-white/5 p-3.5 flex items-center gap-3">
            <div className="p-2 w-10 h-10 rounded-lg bg-[#ff4e00]/10 text-[#ff4e00] flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                DPI REKOMENDASI
              </span>
              <span className="font-mono text-md font-extrabold text-white tracking-widest">
                {dpiValue}
              </span>
            </div>
          </div>

          {/* Button Size recommendation */}
          <div className="bg-white/2 rounded-xl border border-white/5 p-3.5 flex items-center gap-3">
            <div className="p-2 w-10 h-10 rounded-lg bg-[#ff4e00]/10 text-[#ff4e00] flex items-center justify-center">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                TOMBOL TEMBAK
              </span>
              <span className="font-mono text-md font-extrabold text-white tracking-widest">
                {fireButtonSize}%
              </span>
            </div>
          </div>

        </div>

        {/* Action controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          
          <button
            onClick={handleCopy}
            className="w-full sm:w-1/2 py-3 px-4 rounded-none skew-x-[-12deg] border border-white/10 hover:bg-white/5 text-gray-200 font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="block skew-x-[12deg] flex items-center gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  Berhasil Disalin!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-[#ff4e00]" />
                  Salin Setelan
                </>
              )}
            </span>
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-1/2 py-3.5 px-4 rounded-none skew-x-[-12deg] bg-[#ff4e00] hover:bg-orange-600 text-black font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,78,0,0.3)]"
          >
            <span className="block skew-x-[12deg] flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Buat Sensi Lain
            </span>
          </button>

        </div>

      </div>

      {/* Pro gaming tip card */}
      <div className="p-5 bg-white/2 border border-white/5 rounded-xl flex items-start gap-4">
        <div className="p-2 rounded-lg bg-[#ff4e00]/15 text-[#ff4e00] mt-0.5">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-display font-black text-xs text-white uppercase tracking-wide">
            CARA PENERAPAN SETINGAN (AIM LOCK):
          </h4>
          <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
            Masuk ke pengaturan Sensitivitas di Free Fire, geser slider sesuai angka di atas. Atur ukuran tombol tembak di HUD Kustom. Untuk performa headshot mutlak, sesuaikan nilai DPI HP Anda melalui opsi pengembang (Developer Options).
          </p>
        </div>
      </div>

    </div>
  );
}
