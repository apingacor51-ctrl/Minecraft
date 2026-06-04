import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  LayoutDashboard, Key, Shield, Settings, Users, Phone, Smartphone, 
  Plus, Edit, Trash2, Check, X, ShieldAlert, Download, Search, Filter, 
  RefreshCw, Power, Save, KeyRound, Lightbulb, Gamepad2
} from "lucide-react";
import { Brand, User, Sensitivity, UnlockCode, TelegramConfig } from "../types";

interface AdminPanelProps {
  onLogout: () => void;
  brands: Brand[];
  onRefreshBrands: () => Promise<void>;
}

export default function AdminPanel({ onLogout, brands, onRefreshBrands }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "codes" | "sensitivities" | "hp" | "users" | "telegram">("dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayCreations: 0,
    activeCodes: 0,
    totalBrands: 0,
    brandDistribution: [] as any[],
    popularDevices: [] as any[]
  });
  const [loading, setLoading] = useState(false);

  // States for Codes Management
  const [codes, setCodes] = useState<UnlockCode[]>([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [editingCode, setEditingCode] = useState<UnlockCode | null>(null);
  const [codeForm, setCodeForm] = useState({ code: "", limit_use: 50, status: "aktif" as "aktif" | "nonaktif" });

  // States for Sensitivities Management
  const [sensitivities, setSensitivities] = useState<Sensitivity[]>([]);
  const [showSensModal, setShowSensModal] = useState(false);
  const [sensForm, setSensForm] = useState({
    id: "", brand: "", device: "", general: 180, reddot: 140, scope2x: 130, scope4x: 120, awm: 80, freelook: 70
  });

  // States for Brands & Devices Management
  const [newBrandName, setNewBrandName] = useState("");
  const [newDeviceName, setNewDeviceName] = useState("");
  const [selectedBrandForDevice, setSelectedBrandForDevice] = useState("");

  // States for Users Database
  const [users, setUsers] = useState<User[]>([]);
  const [searchWhatsapp, setSearchWhatsapp] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCode, setFilterCode] = useState("");

  // States for Telegram Config
  const [telegram, setTelegram] = useState<TelegramConfig>({ botToken: "", chatId: "", enabled: false });
  const [tgSaveSuccess, setTgSaveSuccess] = useState(false);

  // Status logs
  const [adminError, setAdminError] = useState("");

  // Recharts colors
  const COLORS = ["#ea580c", "#f59e0b", "#fcf003", "#e11d48", "#10b981", "#3b82f6", "#a855f7"];

  useEffect(() => {
    fetchStats();
    fetchCodes();
    fetchSensitivities();
    fetchUsers();
    fetchTelegramConfig();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/codes");
      const data = await res.json();
      setCodes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSensitivities = async () => {
    try {
      const res = await fetch("/api/sensitivities");
      const data = await res.json();
      setSensitivities(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTelegramConfig = async () => {
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      setTelegram(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Codes actions
  const handleSaveCode = async () => {
    if (!codeForm.code) {
      setAdminError("Kode tidak boleh kosong.");
      return;
    }
    try {
      setAdminError("");
      const isEdit = !!editingCode;
      const url = isEdit ? `/api/codes/${editingCode.id}` : "/api/codes";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(codeForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || "Gagal menyimpan kode.");
        return;
      }
      setShowCodeModal(false);
      setEditingCode(null);
      setCodeForm({ code: "", limit_use: 50, status: "aktif" });
      fetchCodes();
      fetchStats();
    } catch (e) {
      setAdminError("Gagal menyimpan kode.");
    }
  };

  const handleToggleCodeStatus = async (item: UnlockCode) => {
    try {
      const nextStatus = item.status === "aktif" ? "nonaktif" : "aktif";
      await fetch(`/api/codes/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchCodes();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kode ini?")) return;
    try {
      await fetch(`/api/codes/${id}`, { method: "DELETE" });
      fetchCodes();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Sensitivities actions
  const handleSaveSensitivity = async () => {
    if (!sensForm.brand || !sensForm.device) {
      setAdminError("Merek HP dan Tipe HP wajib diisi.");
      return;
    }
    try {
      setAdminError("");
      const res = await fetch("/api/sensitivities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sensForm)
      });
      if (res.ok) {
        setShowSensModal(false);
        setSensForm({
          id: "", brand: "", device: "", general: 180, reddot: 140, scope2x: 130, scope4x: 120, awm: 80, freelook: 70
        });
        fetchSensitivities();
      } else {
        const err = await res.json();
        setAdminError(err.error || "Gagal menyimpan sensitivitas.");
      }
    } catch (e) {
      setAdminError("Terjadi kesalahan.");
    }
  };

  const handleDeleteSensitivity = async (id: string) => {
    if (!confirm("Hapus sensitivitas kustom untuk HP ini?")) return;
    try {
      await fetch(`/api/sensitivities/${id}`, { method: "DELETE" });
      fetchSensitivities();
    } catch (e) {
      console.error(e);
    }
  };

  // Brand and Devices actions
  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      setAdminError("");
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error);
        return;
      }
      setNewBrandName("");
      await onRefreshBrands();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBrand = async (name: string) => {
    if (!confirm(`Hapus brand ${name} berserta semua tipenya?`)) return;
    try {
      await fetch(`/api/brands/${encodeURIComponent(name)}`, { method: "DELETE" });
      await onRefreshBrands();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDevice = async () => {
    if (!selectedBrandForDevice || !newDeviceName.trim()) {
      setAdminError("Merek HP dan Tipe HP wajib dipilih/diisi.");
      return;
    }
    try {
      setAdminError("");
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: selectedBrandForDevice, deviceName: newDeviceName })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error);
        return;
      }
      setNewDeviceName("");
      await onRefreshBrands();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDevice = async (brandName: string, deviceName: string) => {
    if (!confirm(`Hapus tipe HP ${brandName} ${deviceName}?`)) return;
    try {
      await fetch(`/api/devices/${encodeURIComponent(brandName)}/${encodeURIComponent(deviceName)}`, {
        method: "DELETE"
      });
      await onRefreshBrands();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Users Database actions
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Hapus pengguna ini dari basis data?")) return;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      fetchUsers();
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // CSV/Excel Export function
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) return;
    
    // Header stream
    const headers = ["ID", "WhatsApp", "Merek HP", "Tipe HP", "Tanggal Pembuatan", "Kode Dipakai"];
    
    // Content rows
    const rows = filteredUsers.map((u, i) => [
      i + 1,
      u.whatsapp,
      u.brand,
      u.device,
      new Date(u.created_at).toLocaleString("id-ID"),
      u.code_used
    ]);

    // Format content with proper double quotes to prevent CSV escaping break
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_User_Create_Sensi_FF_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Telegram Config Actions
  const handleSaveTelegram = async () => {
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegram)
      });
      if (res.ok) {
        setTgSaveSuccess(true);
        setTimeout(() => setTgSaveSuccess(false), 2000);
        fetchTelegramConfig();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter users lists client-side dynamically
  const filteredUsers = users.filter(u => {
    const matchWA = u.whatsapp.includes(searchWhatsapp);
    const matchBrand = filterBrand ? u.brand.toLowerCase() === filterBrand.toLowerCase() : true;
    const matchCode = filterCode
      ? (filterCode === "Gratis" ? u.code_used === "Gratis" : u.code_used !== "Gratis")
      : true;
    return matchWA && matchBrand && matchCode;
  });

  return (
    <div className="min-h-[85vh] bg-[#050505]/40 backdrop-blur-xl rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-4 overflow-hidden shadow-2xl animate-fade-in">
      
      {/* Sidebar navigation column */}
      <div className="bg-[#050505]/95 border-r border-white/5 p-5 space-y-6 flex flex-col justify-between">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1 pb-3 border-b border-white/5">
            <Shield className="h-5 w-5 text-[#ff4e00] animate-pulse" />
            <div>
              <h4 className="font-display font-black text-xs text-white uppercase tracking-widest leading-none">
                ADMIN CONSOLE
              </h4>
              <span className="text-[10px] text-[#ff4e00] font-mono tracking-tighter uppercase">Sensitivitas FF</span>
            </div>
          </div>

          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-none font-display font-black text-[10px] uppercase tracking-wider text-left transition-all ${
                activeTab === "dashboard" ? "bg-[#ff4e00]/10 text-white font-black border-l-2 border-[#ff4e00]" : "text-gray-400 hover:bg-white/2 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5 text-[#ff4e00]" />
              Overview Stats
            </button>
            <button
              onClick={() => setActiveTab("codes")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-none font-display font-black text-[10px] uppercase tracking-wider text-left transition-all ${
                activeTab === "codes" ? "bg-[#ff4e00]/10 text-white font-black border-l-2 border-[#ff4e00]" : "text-gray-400 hover:bg-white/2 hover:text-white"
              }`}
            >
              <Key className="h-4.5 w-4.5 text-[#ff4e00]" />
              Kelola Kode
            </button>
            <button
              onClick={() => setActiveTab("sensitivities")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-none font-display font-black text-[10px] uppercase tracking-wider text-left transition-all ${
                activeTab === "sensitivities" ? "bg-[#ff4e00]/10 text-white font-black border-l-2 border-[#ff4e00]" : "text-gray-400 hover:bg-white/2 hover:text-white"
              }`}
            >
              <Gamepad2 className="h-4.5 w-4.5 text-[#ff4e00]" />
              Sensi per HP
            </button>
            <button
              onClick={() => setActiveTab("hp")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-none font-display font-black text-[10px] uppercase tracking-wider text-left transition-all ${
                activeTab === "hp" ? "bg-[#ff4e00]/10 text-white font-black border-l-2 border-[#ff4e00]" : "text-gray-400 hover:bg-white/2 hover:text-white"
              }`}
            >
              <Smartphone className="h-4.5 w-4.5 text-[#ff4e00]" />
              Data HP Indonesia
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-none font-display font-black text-[10px] uppercase tracking-wider text-left transition-all ${
                activeTab === "users" ? "bg-[#ff4e00]/10 text-white font-black border-l-2 border-[#ff4e00]" : "text-gray-400 hover:bg-white/2 hover:text-white"
              }`}
            >
              <Users className="h-4.5 w-4.5 text-[#ff4e00]" />
              Data Pengguna
            </button>
            <button
              onClick={() => setActiveTab("telegram")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-none font-display font-black text-[10px] uppercase tracking-wider text-left transition-all ${
                activeTab === "telegram" ? "bg-[#ff4e00]/10 text-white font-black border-l-2 border-[#ff4e00]" : "text-gray-400 hover:bg-white/2 hover:text-white"
              }`}
            >
              <Settings className="h-4.5 w-4.5 text-[#ff4e00]" />
              Notifikasi Telegram
            </button>
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="w-full text-center py-2.5 px-4 rounded-none skew-x-[-12deg] bg-white/2 border border-white/5 hover:border-red-500/20 text-gray-400 hover:text-red-400 font-display font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
        >
          <span className="block skew-x-[12deg]">Keluar Admin</span>
        </button>
      </div>

      {/* Main panel displays */}
      <div className="md:col-span-3 p-6 md:p-8 bg-[#050505]/40 backdrop-blur-xl overflow-y-auto space-y-6">
        
        {adminError && (
          <div className="bg-red-950/20 border border-white/5 p-4 rounded-xl text-xs text-red-450 flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-red-400" />
            {adminError}
            <button onClick={() => setAdminError("")} className="ml-auto hover:text-white text-gray-500 font-extrabold text-sm font-mono">&times;</button>
          </div>
        )}

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider block">
                  DASHBOARD HOME OVERVIEW
                </h3>
                <span className="text-[10px] text-gray-500">Metrik pendaftaran dan statistik HP terpopuler</span>
              </div>
              
              <button 
                onClick={() => {
                  fetchStats();
                  fetchCodes();
                  fetchSensitivities();
                  fetchUsers();
                }}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-lg transition"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Stats indicators boxes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500">Total User</span>
                <span className="font-mono text-xl font-bold text-white tracking-tight">
                  {stats.totalUsers.toLocaleString("id-ID")}
                </span>
                <div className="text-[9px] text-green-450 font-mono flex items-center gap-1">
                  <span>● Live sync active</span>
                </div>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500">Create Hari Ini</span>
                <span className="font-mono text-xl font-bold text-[#ff4e00] tracking-tight">
                  {stats.todayCreations}
                </span>
                <div className="text-[9px] text-gray-500 font-mono uppercase">
                  Reguler & Premium
                </div>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500">Total Kode Aktif</span>
                <span className="font-mono text-xl font-bold text-[#ff4e00] tracking-tight">
                  {stats.activeCodes}
                </span>
                <div className="text-[9px] text-gray-500 font-mono uppercase">
                  Unlock limits
                </div>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-24">
                <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500">Total Merk HP</span>
                <span className="font-mono text-xl font-bold text-white tracking-tight">
                  {stats.totalBrands}
                </span>
                <div className="text-[9px] text-gray-500 font-mono uppercase">
                  Indonesia database
                </div>
              </div>

            </div>

            {/* Graphics Charts using Recharts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Graphic A: HP Brand distribution bar chart */}
              <div className="bg-white/2 border border-white/5 p-5 rounded-xl">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-white mb-4">
                  DIAGRAM DISTRIBUSI OPERATOR HP INDONESIA (POKOK)
                </h4>
                
                <div className="h-64 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={stats.brandDistribution}>
                      <XAxis dataKey="name" stroke="#888" tickLine={false} />
                      <YAxis stroke="#888" tickLine={false} />
                      <RechartsTooltip contentStyle={{ background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                      <Bar dataKey="count" fill="#ff4e00" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphic B: Popular Devices list & details */}
              <div className="bg-white/2 border border-white/5 p-5 rounded-xl">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-white mb-4">
                  MODEL HP PALING BANYAK DIGUNAKAN
                </h4>
                
                <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                  {stats.popularDevices.map((dev, i) => {
                    return (
                      <div key={dev.name} className="flex items-center justify-between p-3.5 bg-white/2 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-gray-400 rounded bg-[#050505] w-6 h-6 flex items-center justify-center border border-white/5">
                            {i+1}
                          </span>
                          <span className="font-mono text-xs font-extrabold text-white uppercase">{dev.name}</span>
                        </div>
                        <span className="font-mono text-[10px] font-black text-[#ff4e00] bg-[#ff4e00]/10 px-2.5 py-1 rounded">
                          {dev.count} KALI CREATE
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: KELOLA KODE UNLOCK */}
        {activeTab === "codes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                  KELOLA KODE UNLOCK
                </h3>
                <span className="text-[10px] text-slate-500">Kelola kuota pendaftaran ulang sensitivitas</span>
              </div>
              
              <button
                onClick={() => {
                  setEditingCode(null);
                  setCodeForm({ code: "", limit_use: 50, status: "aktif" });
                  setShowCodeModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 font-display font-bold text-xs uppercase tracking-wider text-slate-950 transition cursor-pointer"
              >
                <Plus className="h-4 w-4 text-slate-950" />
                Tambah Kode
              </button>
            </div>

            {/* List Table of Codes */}
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/30 text-slate-400 uppercase font-mono tracking-widest text-[9px] border-b border-slate-900">
                  <tr>
                    <th className="p-3">Kode</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Batas Use</th>
                    <th className="p-3">Terpakai</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-mono">
                  {codes.map((item) => {
                    const isExceeded = item.used >= item.limit_use;
                    return (
                      <tr key={item.id} className="hover:bg-slate-900/30">
                        <td className="p-3 font-bold text-orange-400">{item.code}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleCodeStatus(item)}
                            className={`px-2 py-0.5 rounded text-[10px] items-center gap-1 inline-flex font-mono uppercase cursor-pointer ${
                              item.status === "aktif" && !isExceeded
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            <Power className="h-3 w-3" />
                            {item.status === "aktif" ? (isExceeded ? "limit habis" : "aktif") : "nonaktif"}
                          </button>
                        </td>
                        <td className="p-3 text-slate-300">{item.limit_use}x</td>
                        <td className={`p-3 font-bold ${isExceeded ? "text-red-500" : "text-amber-500"}`}>
                          {item.used}x
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCode(item);
                              setCodeForm({ code: item.code, limit_use: item.limit_use, status: item.status });
                              setShowCodeModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCode(item.id)}
                            className="p-1 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Code Creator modal Dialog */}
            {showCodeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 md:p-6 w-full max-w-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">
                      {editingCode ? "Edit Kode Unlock" : "Tambah Kode Unlock Baru"}
                    </h4>
                    <button onClick={() => setShowCodeModal(false)} className="text-slate-400 hover:text-white">&times;</button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1 font-mono uppercase text-[9px]">KODE</label>
                      <input
                        type="text"
                        value={codeForm.code}
                        onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })}
                        placeholder="Contoh: VIPFF2026"
                        className="w-full bg-slate-950 border border-slate-900 text-orange-400 rounded-xl p-3 outline-none font-mono text-sm focus:border-orange-500 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1 font-mono uppercase text-[9px]">BATAS PEMAKAIAN (KALI)</label>
                      <input
                        type="number"
                        value={codeForm.limit_use}
                        onChange={(e) => setCodeForm({ ...codeForm, limit_use: Number(e.target.value) })}
                        placeholder="50"
                        className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-sm focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1 font-mono uppercase text-[9px]">STATUS KODE</label>
                      <select
                        value={codeForm.status}
                        onChange={(e) => setCodeForm({ ...codeForm, status: e.target.value as "aktif" | "nonaktif" })}
                        className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-sm focus:border-orange-500"
                      >
                        <option value="aktif">AKTIF</option>
                        <option value="nonaktif">NONAKTIF</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => setShowCodeModal(false)}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-mono text-xs uppercase transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveCode}
                      className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 font-display font-bold text-xs uppercase text-slate-950 transition"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: KELOLA TEMPLATE SENSITIVITAS PER HP */}
        {activeTab === "sensitivities" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                  KELOLA TEMPLATE SENSITIVITAS PER HP
                </h3>
                <span className="text-[10px] text-slate-500">Atur setingan presisi kustom dari HP tertentu</span>
              </div>
              
              <button
                onClick={() => {
                  setSensForm({
                    id: "", brand: "Samsung", device: "", general: 180, reddot: 140, scope2x: 130, scope4x: 120, awm: 80, freelook: 70
                  });
                  setShowSensModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 font-display font-bold text-xs uppercase tracking-wider text-slate-950 transition cursor-pointer"
              >
                <Plus className="h-4 w-4 text-slate-950" />
                Atur Sensi HP
              </button>
            </div>

            {/* List Table of Custom Overrides */}
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/30 text-slate-400 uppercase font-mono tracking-widest text-[9px] border-b border-slate-900">
                  <tr>
                    <th className="p-3">HP Tipe</th>
                    <th className="p-3">Sec</th>
                    <th className="p-3">RedDot</th>
                    <th className="p-3">2x</th>
                    <th className="p-3">4x</th>
                    <th className="p-3">AWM</th>
                    <th className="p-3">F-Look</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-mono text-[11px]">
                  {sensitivities.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/30 text-slate-300">
                      <td className="p-3 font-semibold text-white uppercase">{item.brand} {item.device}</td>
                      <td className="p-3 text-orange-400">{item.general}</td>
                      <td className="p-3 text-slate-400">{item.reddot}</td>
                      <td className="p-3 text-slate-400">{item.scope2x}</td>
                      <td className="p-3 text-slate-400">{item.scope4x}</td>
                      <td className="p-3 text-slate-400">{item.awm}</td>
                      <td className="p-3 text-slate-400">{item.freelook}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSensForm({
                              id: item.id,
                              brand: item.brand,
                              device: item.device,
                              general: item.general,
                              reddot: item.reddot,
                              scope2x: item.scope2x,
                              scope4x: item.scope4x,
                              awm: item.awm,
                              freelook: item.freelook
                            });
                            setShowSensModal(true);
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSensitivity(item.id)}
                          className="p-1 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sensitivities.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                        Belum ada sensitivitas kustom yang disimpan. Sistem akan menjana sensi secara deterministik.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Sensitivitas Creator modal dialog */}
            {showSensModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 md:p-6 w-full max-w-lg space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">
                      {sensForm.id ? "Edit Custom Sensitvitas HP" : "Tambah Custom Sensitvitas HP"}
                    </h4>
                    <button onClick={() => setShowSensModal(false)} className="text-slate-400 hover:text-white">&times;</button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase text-[9px]">Merek Brand</label>
                        <select
                          value={sensForm.brand}
                          onChange={(e) => setSensForm({ ...sensForm, brand: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-xs focus:border-orange-500"
                        >
                          {brands.map(b => (
                            <option key={b.name} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase text-[9px]">Tipe Seri HP</label>
                        <input
                          type="text"
                          value={sensForm.device}
                          onChange={(e) => setSensForm({ ...sensForm, device: e.target.value })}
                          placeholder="A15 / Redmi Note 13"
                          className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-xs focus:border-orange-500 uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase text-[8px]">Lihat Sekeliling</label>
                        <input
                          type="number"
                          value={sensForm.general}
                          onChange={(e) => setSensForm({ ...sensForm, general: Number(e.target.value) })}
                          placeholder="180"
                          className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-xs focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase text-[8px]">Red Dot</label>
                        <input
                          type="number"
                          value={sensForm.reddot}
                          onChange={(e) => setSensForm({ ...sensForm, reddot: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-xs focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase text-[8px]">2x Scope</label>
                        <input
                          type="number"
                          value={sensForm.scope2x}
                          onChange={(e) => setSensForm({ ...sensForm, scope2x: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-xs focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase text-[8px]">4x Scope</label>
                        <input
                          type="number"
                          value={sensForm.scope4x}
                          onChange={(e) => setSensForm({ ...sensForm, scope4x: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-xs focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase text-[8px]">AWM Scope</label>
                        <input
                          type="number"
                          value={sensForm.awm}
                          onChange={(e) => setSensForm({ ...sensForm, awm: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-xs focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-mono uppercase text-[8px]">Free Look</label>
                        <input
                          type="number"
                          value={sensForm.freelook}
                          onChange={(e) => setSensForm({ ...sensForm, freelook: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-xs focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => setShowSensModal(false)}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-mono text-xs uppercase transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveSensitivity}
                      className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 font-display font-bold text-xs uppercase text-slate-950 transition cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: KELOLA BRAND DAN DATA HP INDONESIA */}
        {activeTab === "hp" && (
          <div className="space-y-6">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                DATA HP INDONESIA MANAGEMENT
              </h3>
              <span className="text-[10px] text-slate-500">Kelola database series, brand, tipe, dan merek yang didukung</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Box A: Tambah / hapus merek brand */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-4">
                <h4 className="font-display font-bold text-xs uppercase tracking-wide text-white">
                  KELOLA BRAND / MERK
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Contoh: Asus / Infinix"
                    className="flex-1 bg-slate-950 border border-slate-900 rounded-xl p-3 outline-none font-mono font-bold text-orange-400"
                  />
                  <button
                    onClick={handleAddBrand}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white transition flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {brands.map(b => (
                    <div key={b.name} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-900">
                      <div className="font-mono">
                        <span className="font-bold text-white uppercase">{b.name}</span>
                        <span className="text-[10px] text-slate-600 block">{b.devices.length} Perangkat</span>
                      </div>
                      <button
                        onClick={() => handleDeleteBrand(b.name)}
                        className="p-1 px-2.5 rounded bg-red-950/10 hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box B: Tambah / hapus model device per brand */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-4">
                <h4 className="font-display font-bold text-xs uppercase tracking-wide text-white">
                  TAMBAH TIPE / MODEL HP
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-500 text-[9px] uppercase font-mono mb-1">MEREK BRAND</label>
                    <select
                      value={selectedBrandForDevice}
                      onChange={(e) => setSelectedBrandForDevice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono text-xs"
                    >
                      <option value="">-- Pilih Brand --</option>
                      {brands.map(b => (
                        <option value={b.name} key={b.name}>{b.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[9px] uppercase font-mono mb-1">TIPE / MODEL BARU</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        placeholder="Contoh: ROG Phone 8 / Nova 11"
                        className="flex-1 bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono uppercase"
                      />
                      <button
                        onClick={handleAddDevice}
                        className="p-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold transition flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="h-4.5 w-4.5 text-slate-950" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border-t border-slate-900 pt-3">
                  <span className="block text-[9px] text-slate-500 uppercase font-mono tracking-widest mb-1">
                    Daftar HP Terdaftar (Series Samsung & Xiaomi)
                  </span>
                  
                  {brands.slice(0, 3).map(b => (
                    <div key={b.name} className="space-y-1 bg-slate-900/10 p-2 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{b.name} ({b.devices.length})</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {b.devices.map(d => (
                          <div key={d} className="inline-flex items-center gap-1 bg-slate-900 border border-slate-900 text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded">
                            {d}
                            <button
                              onClick={() => handleDeleteDevice(b.name, d)}
                              className="text-slate-500 hover:text-red-400 font-extrabold text-[10px] ml-1"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 5: DATA PENGGUNA (DATABASE LIST) */}
        {activeTab === "users" && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-3">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                  DATA PENGGUNA TERDAFTAR
                </h3>
                <span className="text-[10px] text-slate-500">Lihat riwayat user create sensitivitas yang tersimpan</span>
              </div>

              <button
                disabled={filteredUsers.length === 0}
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed font-display font-bold text-xs uppercase tracking-wider text-slate-950 transition rounded-lg cursor-pointer"
              >
                <Download className="h-4.5 w-4.5 text-slate-950" />
                Export Excel (CSV)
              </button>
            </div>

            {/* Filter controls panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchWhatsapp}
                  onChange={(e) => setSearchWhatsapp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Cari No WhatsApp..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-900 rounded-xl outline-none font-mono text-xs text-orange-400 placeholder:text-slate-600 focus:border-slate-800"
                />
              </div>

              <div>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-900 rounded-xl outline-none text-slate-300 font-mono text-xs"
                >
                  <option value="">Semua Brand</option>
                  {brands.map(b => <option value={b.name} key={b.name}>{b.name.toUpperCase()}</option>)}
                </select>
              </div>

              <div>
                <select
                  value={filterCode}
                  onChange={(e) => setFilterCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-900 rounded-xl outline-none text-slate-300 font-mono text-xs"
                >
                  <option value="">Semua Jenis Pemakaian</option>
                  <option value="Gratis">KUOTA GRATIS</option>
                  <option value="premium">KODE UNLOCK</option>
                </select>
              </div>
            </div>

            {/* Response listing box */}
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/30 text-slate-400 uppercase font-mono tracking-widest text-[9px] border-b border-slate-900">
                  <tr>
                    <th className="p-3">Gawai</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Waktu Create</th>
                    <th className="p-3">Status / Kode</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-mono text-xs">
                  {filteredUsers.map((u) => {
                    const isPremium = u.code_used !== "Gratis";
                    return (
                      <tr key={u.id} className="hover:bg-slate-900/30 text-slate-300">
                        <td className="p-3">
                          <span className="font-extrabold uppercase text-white block">{u.brand} {u.device}</span>
                        </td>
                        <td className="p-3 text-slate-300">{u.whatsapp}</td>
                        <td className="p-3 text-slate-400">
                          {new Date(u.created_at).toLocaleDateString("id-ID")}{" "}
                          {new Date(u.created_at).toLocaleTimeString("id-ID", { hour: "numeric", minute: "numeric" })}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            isPremium ? "bg-amber-500/10 text-amber-500" : "bg-green-500/15 text-green-400"
                          }`}>
                            {u.code_used}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                        Tidak ada kecocokan data pengguna yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 6: TELEGRAM NOTIFICATION BOT SETTINGS */}
        {activeTab === "telegram" && (
          <div className="space-y-6">
            
            <div className="border-b border-slate-900 pb-3">
              <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
                PENGATURAN TELEGRAM BOT
              </h3>
              <span className="text-[10px] text-slate-500">Konfigurasi sinkronisasi notifikasi real-time saat user create sensi baru</span>
            </div>

            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 space-y-4 max-w-xl text-xs">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Status Notifikasi Bot Telegram</h4>
                  <p className="text-[10px] text-slate-500">Hidupkan atau matikan integrasi notifikasi</p>
                </div>
                
                <button
                  onClick={() => setTelegram({ ...telegram, enabled: !telegram.enabled })}
                  className={`w-14 h-7 p-1 rounded-full transition-colors ${
                    telegram.enabled ? "bg-orange-600" : "bg-slate-800"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    telegram.enabled ? "translate-x-7" : "translate-x-0"
                  }`} />
                </button>
              </div>

              <div className="space-y-3.5 pt-3 border-t border-slate-900/60">
                <div>
                  <label className="block text-slate-500 text-[9px] uppercase font-mono mb-1">BOT TOKEN TELEGRAM API</label>
                  <input
                    type="password"
                    value={telegram.botToken}
                    onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })}
                    placeholder={telegram.hasBotToken ? "••••••••••••••••••••••••" : "Masukkan Bot Token Anda..."}
                    className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono focus:border-orange-500"
                  />
                  <span className="block text-[9px] text-slate-500 mt-1">
                    Token yang digenerate oleh @BotFather di Telegram untuk bot Anda.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-500 text-[9px] uppercase font-mono mb-1">CHAT ID GROUP / SALURAN / AKUN</label>
                  <input
                    type="text"
                    value={telegram.chatId}
                    onChange={(e) => setTelegram({ ...telegram, chatId: e.target.value })}
                    placeholder="Contoh: -1002987112 / 6512398"
                    className="w-full bg-slate-950 border border-slate-900 text-white rounded-xl p-3 outline-none font-mono focus:border-orange-500"
                  />
                  <span className="block text-[9px] text-slate-500 mt-1">
                    ID chat/grup tujuan untuk menerima notifikasi pesan bot.
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={handleSaveTelegram}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-display font-bold uppercase text-xs tracking-widest transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Simpan Pengaturan
                </button>
              </div>

              {tgSaveSuccess && (
                <div className="p-3 bg-green-950/20 text-green-400 rounded-xl text-center font-semibold">
                  ✔ Konfigurasi Bot Telegram Berhasil Disimpan!
                </div>
              )}

            </div>

            {/* Telegram Bot Setup Help Guide Card */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 max-w-xl flex gap-3 text-xs">
              <div className="p-1.5 rounded-lg bg-orange-600/10 text-orange-500 h-fit mt-0.5">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">CARA PENYIAPAN BOT TELEGRAM:</h4>
                <ol className="list-decimal pl-4 space-y-1 text-[10px] text-slate-500 leading-relaxed">
                  <li>Buat bot baru melalui chat ke <span className="text-slate-300 font-bold">@BotFather</span> di Telegram, lalu ketik <span className="font-mono bg-slate-900 px-1 rounded">/newbot</span>, dan salin Bot Token API.</li>
                  <li>Buat grup atau channel Telegram baru, lalu tambahkan bot Anda ke dalam grup tersebut sebagai admin.</li>
                  <li>Kirim pesan sembarang ke grup, kemudian buka browser dan panggil URL: <span className="font-mono bg-slate-900 px-1 rounded text-orange-400 break-all">https://api.telegram.org/bot[TOKEN_BOT]/getUpdates</span> untuk menemukan Chat ID (awalan minus seperti -100xxxxxxxx).</li>
                  <li>Masukkan data Token dan Chat ID di kolom dashboard atas, lalu centang tombol aktif untuk Simpan Pengaturan.</li>
                </ol>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
