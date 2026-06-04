import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ArrowLeft, Smartphone, Key, Phone, Check, RefreshCw, Sparkles, HelpCircle } from "lucide-react";
import { Brand } from "../types";

interface SensiFormProps {
  brands: Brand[];
  onGenerate: (data: { brand: string; device: string; whatsapp: string; code?: string }) => Promise<{ success: boolean; sensitivities: any; error?: string; errorType?: string }>;
  onBackToHome: () => void;
}

export default function SensiForm({ brands, onGenerate, onBackToHome }: SensiFormProps) {
  const [step, setStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [unlockCode, setUnlockCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showUnlockInput, setShowUnlockInput] = useState(false);

  // Filter device models based on brand selection
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);

  useEffect(() => {
    if (selectedBrand) {
      const match = brands.find(b => b.name.toLowerCase() === selectedBrand.toLowerCase());
      if (match) {
        setAvailableDevices(match.devices);
      } else {
        setAvailableDevices([]);
      }
      setSelectedDevice("");
    }
  }, [selectedBrand, brands]);

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow digits only
    if (value.length <= 15) {
      setWhatsapp(value);
    }
  };

  const validateWhatsapp = () => {
    return whatsapp.length >= 10 && whatsapp.length <= 15;
  };

  const handleNextStep = () => {
    if (step === 1 && selectedBrandZone) {
      setStep(2);
    } else if (step === 2 && selectedDeviceZone) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else {
      onBackToHome();
    }
  };

  const selectedBrandZone = !!selectedBrand;
  const selectedDeviceZone = !!selectedDevice;
  const isWhatsappValid = validateWhatsapp();

  const handleSubmit = async () => {
    if (!selectedBrand || !selectedDevice || !whatsapp) {
      setErrorMessage("Semua kolom pengisian wajib diisi.");
      return;
    }

    if (!isWhatsappValid) {
      setErrorMessage("Nomor WhatsApp harus berukuran 10 - 15 digit angka.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const result = await onGenerate({
        brand: selectedBrand,
        device: selectedDevice,
        whatsapp: whatsapp,
        code: showUnlockInput ? unlockCode : undefined
      });

      if (!result.success) {
        if (result.errorType === "LIMIT_REACHED") {
          setShowUnlockInput(true);
          setErrorMessage(result.error || "Anda sudah pernah membuat sensitivitas untuk nomor ini.");
        } else {
          setErrorMessage(result.error || "Gagal membuat sensitivitas. Pastikan kode yang Anda masukkan benar.");
        }
      }
    } catch (err: any) {
      setErrorMessage("Terjadi kesalahan sistem, silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
      
      {/* Accent Corner Glow */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-[#ff4e00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Wizard Status */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <button
          onClick={handlePrevStep}
          id="btn-back-step"
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="font-display font-black text-xs tracking-widest text-[#ff4e00] uppercase">
          {showUnlockInput ? "UNLOCK SENSITIVITAS" : `LANGKAH ${step} DARI 3`}
        </span>
        <div className="flex gap-1">
          <span className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step >= 1 ? "bg-[#ff4e00]" : "bg-white/10"}`} />
          <span className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step >= 2 ? "bg-[#ff4e00]" : "bg-white/10"}`} />
          <span className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step >= 3 ? "bg-[#ff4e00]" : "bg-white/10"}`} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: PILIH MEREK HP */}
        {step === 1 && !showUnlockInput && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="font-display font-black text-lg text-white tracking-wide uppercase flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#ff4e00]" />
                PILIH MEREK HP ANDA
              </h3>
              <p className="text-xs text-gray-500">
                Pilih brand handphone Anda untuk mencari profil dpi dan sensitivitas layar yang sesuai.
              </p>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {brands.map((b) => {
                const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
                return (
                  <button
                    key={b.name}
                    onClick={() => setSelectedBrand(b.name)}
                    id={`brand-select-${b.name.toLowerCase()}`}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? "bg-[#ff4e00]/10 border-[#ff4e00] text-white shadow-[0_0_12px_rgba(255,78,0,0.15)]"
                        : "bg-white/2 border-white/5 hover:border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="font-display font-black text-xs uppercase tracking-wider">{b.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono mt-1">{b.devices.length} Devices</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                disabled={!selectedBrandZone}
                onClick={handleNextStep}
                id="btn-step1-next"
                className="w-full sm:w-auto float-right flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-none skew-x-[-12deg] font-black font-display text-xs uppercase tracking-widest text-black bg-[#ff4e00] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_0_15px_rgba(255,78,0,0.2)]"
              >
                <span className="block skew-x-[12deg] flex items-center gap-1.5">
                  Lanjutkan
                  <ChevronRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: PILIH TIPE/SERIES HP */}
        {step === 2 && !showUnlockInput && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="font-display font-black text-lg text-white tracking-wide uppercase flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#ff4e00]" />
                PILIH TIPE HP {selectedBrand.toUpperCase()}
              </h3>
              <p className="text-xs text-gray-500">
                Pilih seri/tipe spesifik dari model HP {selectedBrand} Anda.
              </p>
            </div>

            {availableDevices.length === 0 ? (
              <div className="p-8 text-center bg-white/2 border border-white/5 rounded-xl text-gray-500 text-xs">
                Belum ada tipe HP terdaftar untuk brand ini. Silakan hubungi Admin atau coba merek lain.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {availableDevices.map((device) => {
                  const isSelected = selectedDevice.toLowerCase() === device.toLowerCase();
                  return (
                    <button
                      key={device}
                      onClick={() => setSelectedDevice(device)}
                      id={`device-select-${device.replace(/\s+/g, '-').toLowerCase()}`}
                      className={`p-3 rounded-lg border font-mono text-xs uppercase tracking-tight text-center transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? "bg-white/10 border-white text-white"
                          : "bg-white/2 border-white/5 hover:border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {device}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-none skew-x-[-12deg] border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                <span className="block skew-x-[12deg]">Kembali</span>
              </button>
              <button
                disabled={!selectedDeviceZone}
                onClick={handleNextStep}
                id="btn-step2-next"
                className="flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-none skew-x-[-12deg] font-black font-display text-xs uppercase tracking-widest text-black bg-[#ff4e00] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_0_15px_rgba(255,78,0,0.2)]"
              >
                <span className="block skew-x-[12deg] flex items-center gap-1.5">
                  Lanjutkan
                  <ChevronRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: NOMOR WHATSAPP & CREATE BUTTON */}
        {step === 3 && !showUnlockInput && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="font-display font-black text-lg text-white tracking-wide uppercase flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#ff4e00] animate-pulse" />
                NOMOR WHATSAPP ANDA
              </h3>
              <p className="text-xs text-gray-500">
                Pendaftaran dibatasi Gratis 1x pembuatan per nomor handphone aktif.
              </p>
            </div>

            <div className="bg-white/2 rounded-xl border border-white/5 p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 tracking-wider mb-1.5">
                  Nomor WhatsApp (Angka Saja, 10 - 15 digit)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 font-mono text-sm font-bold">
                    62 / 0
                  </div>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    placeholder="81234567890"
                    id="input-whatsapp"
                    className="w-full pl-16 pr-4 py-3 bg-[#050505]/40 border border-white/10 focus:border-[#ff4e00] rounded-xl outline-none font-mono text-sm font-bold text-[#ff4e00] placeholder:text-gray-750 transition"
                  />
                </div>
                <span className="block text-[10px] text-gray-400 font-mono mt-1">
                  Contoh: 08123456789 (Hanya angka, minimal 10 digit)
                </span>
              </div>

              {/* Selection Summary */}
              <div className="border-t border-white/5 pt-3 flex justify-between text-xs font-mono">
                <div>
                  <span className="block text-gray-500 text-[10px] uppercase">Gawai Terpilih:</span>
                  <span className="font-bold text-gray-300">{selectedBrand} {selectedDevice}</span>
                </div>
                <div className="text-right">
                  <span className="block text-gray-500 text-[10px] uppercase">Kuota Free:</span>
                  <span className="font-bold text-green-400 flex items-center justify-end gap-1">
                    <Check className="h-3 w-3" /> Tersedia
                  </span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-950/20 border border-white/5 rounded-xl text-xs text-red-400 leading-relaxed font-sans">
                {errorMessage}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                disabled={loading}
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-none skew-x-[-12deg] border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                <span className="block skew-x-[12deg]">Kembali</span>
              </button>
              
              <button
                disabled={!isWhatsappValid || loading}
                onClick={handleSubmit}
                id="btn-create-sensi"
                className="relative overflow-hidden w-2/3 py-3.5 rounded-none skew-x-[-12deg] bg-[#ff4e00] hover:bg-orange-600 font-black text-xs uppercase tracking-widest text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,78,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="block skew-x-[12deg] flex items-center gap-2">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      CREATE SENSI
                    </>
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* OVERLAY / FRAME: UNLOCK CODE REQUEST */}
        {showUnlockInput && (
          <motion.div
            key="unlockStep"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2 py-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#ff4e00]/15 text-[#ff4e00] flex items-center justify-center">
                <Key className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="font-display font-black text-lg text-white tracking-wide uppercase">
                LIMIT CREATE TERCAPAI
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                Nomor WhatsApp <span className="font-mono font-bold text-gray-200">({whatsapp})</span> sudah pernah mendaftarkan atau membuat sensitivitas sebelumnya.
              </p>
            </div>

            <div className="bg-white/2 rounded-xl border border-white/5 p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 tracking-wider mb-1.5">
                  Masukkan Kode Unlock Sensitivitas
                </label>
                <input
                  type="text"
                  value={unlockCode}
                  onChange={(e) => setUnlockCode(e.target.value)}
                  placeholder="Contoh: FF-2026-ADMIN"
                  id="input-unlock-code"
                  className="w-full px-4 py-3 bg-[#050505]/40 border border-white/10 focus:border-[#ff4e00] rounded-xl outline-none font-mono text-sm font-bold text-[#ff4e00] placeholder:text-gray-700 transition text-center uppercase tracking-widest"
                />
                <span className="block text-[9px] text-gray-500 leading-relaxed font-sans text-center mt-2">
                  Hubungi Admin untuk mendapatkan kode unlock, atau gunakan kode default aktif seperti <span className="font-mono text-gray-300 font-bold bg-[#ff4e00]/20 px-1.5 py-0.5 rounded border border-[#ff4e00]/30">FF-2026-ADMIN</span>.
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/20 border border-white/5 rounded-xl text-xs text-red-400 leading-relaxed text-center font-sans">
                {errorMessage}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                disabled={loading}
                onClick={() => {
                  setShowUnlockInput(false);
                  setUnlockCode("");
                  setErrorMessage("");
                }}
                className="w-1/3 py-3 rounded-none skew-x-[-12deg] border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                <span className="block skew-x-[12deg]">Ganti HP</span>
              </button>

              <button
                disabled={!unlockCode.trim() || loading}
                onClick={handleSubmit}
                id="btn-submit-unlock"
                className="w-2/3 py-3.5 rounded-none skew-x-[-12deg] bg-[#ff4e00] hover:bg-orange-600 font-black text-xs uppercase tracking-widest text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,78,0,0.3)] disabled:opacity-40"
              >
                <span className="block skew-x-[12deg]">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "AKTIFKAN & CREATE"
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
