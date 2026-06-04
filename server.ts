import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Define types for state persistence
interface Brand {
  name: string;
  devices: string[];
}

interface User {
  id: string;
  whatsapp: string;
  brand: string;
  device: string;
  created_at: string;
  code_used: string;
}

interface Sensitivity {
  id: string;
  brand: string;
  device: string;
  general: number;
  reddot: number;
  scope2x: number;
  scope4x: number;
  awm: number;
  freelook: number;
}

interface UnlockCode {
  id: string;
  code: string;
  status: "aktif" | "nonaktif";
  limit_use: number;
  used: number;
  created_at: string;
}

interface Admin {
  id: string;
  username: string;
  password; // Plain string for simple setup or hash. We'll support a direct plain string admin/adminff as asked.
  role: string;
}

interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

interface DB {
  brands: Brand[];
  users: User[];
  sensitivities: Sensitivity[];
  codes: UnlockCode[];
  admins: Admin[];
  telegram: TelegramConfig;
}

// Initial default data if db.json does not exist
const initialDB: DB = {
  brands: [
    { name: "Samsung", devices: ["A05", "A06", "A15", "A24", "A34", "A54", "S23", "S24"] },
    { name: "Xiaomi", devices: ["Redmi 12", "Redmi Note 13", "Poco X6", "Poco F6"] },
    { name: "Vivo", devices: ["Y28", "Y100", "V30", "V40"] },
    { name: "Oppo", devices: ["A3s", "A58", "Reno 5f", "Reno 11", "Reno 12"] },
    { name: "Realme", devices: ["C53", "C67", "12 Pro"] },
    { name: "Infinix", devices: ["Hot 40 Pro", "Note 40 Pro"] },
    { name: "Tecno", devices: ["Pova 6", "Spark 20"] },
    { name: "Itel", devices: ["P55", "RS4"] },
    { name: "Asus", devices: ["ROG Phone 8"] },
    { name: "Lenovo", devices: ["Legion Y70", "Tab M11"] },
    { name: "Huawei", devices: ["Pura 70 Ultra", "Mate 60 Pro"] },
    { name: "Honor", devices: ["Magic 6 Pro", "90 Lite"] },
    { name: "Nokia", devices: ["G22", "C32"] }
  ],
  users: [
    { id: "1", whatsapp: "081234567890", brand: "Samsung", device: "A15", created_at: "2026-06-03T10:15:30.000Z", code_used: "Gratis" },
    { id: "2", whatsapp: "089876543210", brand: "Xiaomi", device: "Redmi Note 13", created_at: "2026-06-04T02:30:15.000Z", code_used: "VIPFF2026" },
    { id: "3", whatsapp: "085731998822", brand: "Vivo", device: "Y28", created_at: "2026-06-04T05:12:00.000Z", code_used: "FF-2026-ADMIN" },
    { id: "4", whatsapp: "081122334455", brand: "Oppo", device: "A58", created_at: "2026-06-04T08:45:11.000Z", code_used: "Gratis" }
  ],
  sensitivities: [
    { id: "1", brand: "Samsung", device: "A15", general: 180, reddot: 145, scope2x: 135, scope4x: 118, awm: 90, freelook: 75 },
    { id: "2", brand: "Xiaomi", device: "Redmi Note 13", general: 185, reddot: 150, scope2x: 140, scope4x: 120, awm: 95, freelook: 80 },
    { id: "3", brand: "Vivo", device: "Y28", general: 190, reddot: 155, scope2x: 145, scope4x: 122, awm: 85, freelook: 70 }
  ],
  codes: [
    { id: "1", code: "FF-2026-ADMIN", status: "aktif", limit_use: 100, used: 15, created_at: "2026-06-01T00:00:00.000Z" },
    { id: "2", code: "VIPFF2026", status: "aktif", limit_use: 50, used: 8, created_at: "2026-05-15T00:00:00.000Z" },
    { id: "3", code: "SENSIFREE", status: "aktif", limit_use: 200, used: 122, created_at: "2026-05-20T00:00:00.000Z" }
  ],
  admins: [
    { id: "1", username: "admin", password: "APINMODESENSIX", role: "superadmin" }
  ],
  telegram: {
    botToken: "",
    chatId: "",
    enabled: false
  }
};

// Database helper functions
function getDB(): DB {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf8");
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file, resetting:", error);
    return initialDB;
  }
}

function saveDB(db: DB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

// Generate premium random default sensitivities for HPs that do not have custom templates
function generateSens(brand: string, device: string): Omit<Sensitivity, "id" | "brand" | "device"> {
  // Use device/brand string length as a deterministic seed offset so the same model always gets key similar sensi
  const seed = (brand.length + device.length) * 3;
  const general = 160 + (seed % 35); // 160 to 195
  const reddot = 130 + (seed % 28);  // 130 to 158
  const scope2x = 120 + (seed % 25); // 120 to 145
  const scope4x = 110 + (seed % 22); // 110 to 132
  const awm = 75 + (seed % 20);      // 75 to 95
  const freelook = 65 + (seed % 20); // 65 to 85

  return { general, reddot, scope2x, scope4x, awm, freelook };
}

// Function to send Telegram messages
async function sendTelegramNotification(brand: string, device: string, whatsapp: string, dateStr: string) {
  const db = getDB();
  const { botToken, chatId, enabled } = db.telegram;
  if (!enabled || !botToken || !chatId) {
    console.log("Telegram bot notification is skipped (either disabled or missing credentials).");
    return;
  }

  const text = `<b>USER BARU CREATE SENSI</b>\n\n<b>HP :</b>\n${brand} ${device}\n\n<b>WA :</b>\n${whatsapp}\n\n<b>Tanggal :</b>\n${dateStr}`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML"
      })
    });
    const result = await response.json();
    if (!result.ok) {
      console.error("Telegram API error:", result);
    } else {
      console.log("Telegram notification sent successfully.");
    }
  } catch (error) {
    console.error("Failed to send telegram notification:", error);
  }
}

// Ensure database file is initialized on server start
getDB();

app.use(express.json());

// API endpoints

// 1. Get mobile brands list
app.get("/api/brands", (req, res) => {
  const db = getDB();
  res.json(db.brands);
});

// Create Brand
app.post("/api/brands", (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Nama Brand wajib diisi" });
  }

  const db = getDB();
  const existing = db.brands.find(b => b.name.toLowerCase() === name.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: `Brand ${name} sudah terdaftar` });
  }

  const newBrand: Brand = {
    name: name.trim(),
    devices: []
  };

  db.brands.push(newBrand);
  saveDB(db);
  res.json(newBrand);
});

// Delete Brand
app.delete("/api/brands/:name", (req, res) => {
  const brandName = req.params.name;
  const db = getDB();
  const index = db.brands.findIndex(b => b.name.toLowerCase() === brandName.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: "Brand tidak ditemukan" });
  }

  db.brands.splice(index, 1);
  saveDB(db);
  res.json({ message: "Brand berhasil dihapus" });
});

// Update Brand Devices
app.post("/api/devices", (req, res) => {
  const { brandName, deviceName } = req.body;
  if (!brandName || !deviceName) {
    return res.status(400).json({ error: "Brand dan Tipe HP wajib diisi" });
  }

  const db = getDB();
  const brand = db.brands.find(b => b.name.toLowerCase() === brandName.trim().toLowerCase());
  if (!brand) {
    return res.status(404).json({ error: "Brand tidak ditemukan" });
  }

  const exists = brand.devices.some(d => d.toLowerCase() === deviceName.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "Tipe HP ini sudah terdaftar untuk brand tersebut" });
  }

  brand.devices.push(deviceName.trim());
  saveDB(db);
  res.json(brand);
});

// Delete Device
app.delete("/api/devices/:brandName/:deviceName", (req, res) => {
  const { brandName, deviceName } = req.params;
  const db = getDB();
  const brand = db.brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
  if (!brand) {
    return res.status(404).json({ error: "Brand tidak ditemukan" });
  }

  const index = brand.devices.findIndex(d => d.toLowerCase() === deviceName.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: "Tipe HP tidak ditemukan" });
  }

  brand.devices.splice(index, 1);
  saveDB(db);
  res.json(brand);
});

// 2. Generate sensitivity
app.post("/api/generate", async (req, res) => {
  const { brand, device, whatsapp, code } = req.body;

  if (!brand || !device || !whatsapp) {
    return res.status(400).json({ error: "Kolom Brand, Tipe HP, dan WhatsApp wajib diisi." });
  }

  // Validate WhatsApp
  const cleanWA = whatsapp.replace(/\D/g, "");
  if (cleanWA.length < 10 || cleanWA.length > 15) {
    return res.status(400).json({ error: "WhatsApp harus berupa angka 10-15 digit." });
  }

  const db = getDB();

  // Check if user has already created sensitivity
  const isRegisteredWA = db.users.find(u => u.whatsapp === cleanWA);
  const isRegisteredDevice = db.users.find(u => u.brand.toLowerCase() === brand.toLowerCase() && u.device.toLowerCase() === device.toLowerCase() && u.whatsapp === cleanWA);

  let usedCode = "Gratis";

  // If already registered, must supply and validate unlock code
  if (isRegisteredWA || isRegisteredDevice) {
    if (!code) {
      return res.status(400).json({
        error: "LIMIT_REACHED",
        message: "Anda sudah pernah membuat sensitivitas untuk nomor WhatsApp ini atau tipe HP ini. Silakan masukkan Kode Unlock untuk memproses ulang."
      });
    }

    // Validate code
    const foundCode = db.codes.find(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!foundCode) {
      return res.status(400).json({ error: "KODE_INVALID", message: "Kode Unlock tidak ditemukan atau salah. Pastikan kode yang Anda masukkan benar." });
    }

    if (foundCode.status !== "aktif") {
      return res.status(400).json({ error: "KODE_INACTIVE", message: "Kode Unlock tersebut sedang tidak aktif." });
    }

    if (foundCode.used >= foundCode.limit_use) {
      return res.status(400).json({ error: "KODE_EXPIRED", message: "Batas pemakaian Kode Unlock ini sudah habis." });
    }

    // Code is valid - upgrade state & use count!
    foundCode.used += 1;
    usedCode = foundCode.code.trim().toUpperCase();
  }

  // Record user activity
  const newUser: User = {
    id: String(db.users.length + 1) + "_" + Date.now(),
    whatsapp: cleanWA,
    brand: brand,
    device: device,
    created_at: new Date().toISOString(),
    code_used: usedCode
  };
  db.users.push(newUser);
  saveDB(db);

  // Look for custom sensitivity
  const customSens = db.sensitivities.find(
    s => s.brand.toLowerCase() === brand.toLowerCase() && s.device.toLowerCase() === device.toLowerCase()
  );

  const stats = customSens ? {
    general: customSens.general,
    reddot: customSens.reddot,
    scope2x: customSens.scope2x,
    scope4x: customSens.scope4x,
    awm: customSens.awm,
    freelook: customSens.freelook
  } : generateSens(brand, device);

  // Send Telegram Notification nicely in background
  const currentDateStr = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  sendTelegramNotification(brand, device, cleanWA, currentDateStr);

  res.json({
    success: true,
    user: newUser,
    sensitivities: stats
  });
});

// 3. Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi." });
  }

  const db = getDB();
  const admin = db.admins.find(a => a.username === username && a.password === password);
  if (!admin) {
    return res.status(401).json({ error: "Username atau password salah!" });
  }

  res.json({
    success: true,
    user: {
      id: admin.id,
      username: admin.username,
      role: admin.role
    }
  });
});

// 4. Statistics
app.get("/api/stats", (req, res) => {
  const db = getDB();

  // Baseline simulated offsets because user specifies high authentic baselines (Total: 4.521, 245 Today, etc)
  const baseTotalUsers = 4521;
  const baseTodayCreate = 241;
  const baseActiveCodes = 56;

  const actualUsers = db.users.length;
  // Calculate today's registration count
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const actualToday = db.users.filter(u => new Date(u.created_at) >= startOfToday).length;

  const totalRegisteredUsers = baseTotalUsers + actualUsers;
  const todayCreations = baseTodayCreate + actualToday;
  
  const activeCodesInDB = db.codes.filter(c => c.status === "aktif").length;
  const totalActiveCodes = activeCodesInDB + 53; // simulate base codes size offset

  const totalBrandsCount = db.brands.length;

  // Let's create realistic stats for the most popular devices
  // Group real user devices
  type BrandCount = Record<string, number>;
  const rawBrandCount: BrandCount = {};
  db.users.forEach(u => {
    rawBrandCount[u.brand] = (rawBrandCount[u.brand] || 0) + 1;
  });

  // Blend in high offline mock distributions to populate beautiful Recharts diagrams instantly
  const mockedBrandDistribution = [
    { name: "Samsung", count: 1420 + (rawBrandCount["Samsung"] || 0) },
    { name: "Xiaomi", count: 1100 + (rawBrandCount["Xiaomi"] || 0) },
    { name: "Vivo", count: 750 + (rawBrandCount["Vivo"] || 0) },
    { name: "Oppo", count: 680 + (rawBrandCount["Oppo"] || 0) },
    { name: "Realme", count: 320 + (rawBrandCount["Realme"] || 0) },
    { name: "Infinix", count: 251 + (rawBrandCount["Infinix"] || 0) }
  ];

  // Group real devices to get the top list
  const deviceCounts: Record<string, number> = {
    "Samsung A15": 142 + db.users.filter(u => u.brand === "Samsung" && u.device === "A15").length,
    "Redmi Note 13": 128 + db.users.filter(u => u.brand === "Xiaomi" && u.device === "Redmi Note 13").length,
    "Vivo Y28": 95 + db.users.filter(u => u.brand === "Vivo" && u.device === "Y28").length,
    "Oppo A58": 80 + db.users.filter(u => u.brand === "Oppo" && u.device === "A58").length,
    "Infinix Hot 40 Pro": 67 + db.users.filter(u => u.brand === "Infinix" && u.device === "Hot 40 Pro").length,
    "Poco X6": 55 + db.users.filter(u => u.brand === "Xiaomi" && u.device === "Poco X6").length
  };

  const formattedDeviceRank = Object.keys(deviceCounts)
    .map(key => ({ name: key, count: deviceCounts[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.json({
    totalUsers: totalRegisteredUsers,
    todayCreations: todayCreations,
    activeCodes: totalActiveCodes,
    totalBrands: totalBrandsCount,
    brandDistribution: mockedBrandDistribution,
    popularDevices: formattedDeviceRank
  });
});

// 5. Manage Codes API
app.get("/api/codes", (req, res) => {
  const db = getDB();
  res.json(db.codes);
});

app.post("/api/codes", (req, res) => {
  const { code, status, limit_use } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Kode wajib diisi" });
  }

  const db = getDB();
  const exists = db.codes.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "Kode tersebut sudah dibuat" });
  }

  const newCode: UnlockCode = {
    id: String(db.codes.length + 1) + "_" + Date.now(),
    code: code.trim().toUpperCase(),
    status: status || "aktif",
    limit_use: Number(limit_use) || 50,
    used: 0,
    created_at: new Date().toISOString()
  };

  db.codes.push(newCode);
  saveDB(db);
  res.json(newCode);
});

app.put("/api/codes/:id", (req, res) => {
  const codeId = req.params.id;
  const { code, status, limit_use, used } = req.body;

  const db = getDB();
  const index = db.codes.findIndex(c => c.id === codeId);
  if (index === -1) {
    return res.status(404).json({ error: "Kode tidak ditemukan" });
  }

  const item = db.codes[index];
  if (code) item.code = code.toUpperCase();
  if (status) item.status = status;
  if (limit_use !== undefined) item.limit_use = Number(limit_use);
  if (used !== undefined) item.used = Number(used);

  db.codes[index] = item;
  saveDB(db);
  res.json(item);
});

app.delete("/api/codes/:id", (req, res) => {
  const codeId = req.params.id;
  const db = getDB();
  const index = db.codes.findIndex(c => c.id === codeId);
  if (index === -1) {
    return res.status(404).json({ error: "Kode tidak ditemukan" });
  }

  const deleted = db.codes.splice(index, 1);
  saveDB(db);
  res.json({ message: "Kode berhasil dihapus", item: deleted[0] });
});

// 6. Manage Sensitivities (HP Templates)
app.get("/api/sensitivities", (req, res) => {
  const db = getDB();
  res.json(db.sensitivities);
});

app.post("/api/sensitivities", (req, res) => {
  const { brand, device, general, reddot, scope2x, scope4x, awm, freelook } = req.body;
  if (!brand || !device) {
    return res.status(400).json({ error: "Merek and Tipe HP wajib diisi" });
  }

  const db = getDB();
  const index = db.sensitivities.findIndex(
    s => s.brand.toLowerCase() === brand.trim().toLowerCase() && s.device.toLowerCase() === device.trim().toLowerCase()
  );

  const sensitivityRecord: Sensitivity = {
    id: index !== -1 ? db.sensitivities[index].id : (String(db.sensitivities.length + 1) + "_" + Date.now()),
    brand: brand.trim(),
    device: device.trim(),
    general: Number(general) || 180,
    reddot: Number(reddot) || 140,
    scope2x: Number(scope2x) || 130,
    scope4x: Number(scope4x) || 120,
    awm: Number(awm) || 80,
    freelook: Number(freelook) || 70
  };

  if (index !== -1) {
    db.sensitivities[index] = sensitivityRecord;
  } else {
    db.sensitivities.push(sensitivityRecord);
  }

  saveDB(db);
  res.json(sensitivityRecord);
});

app.delete("/api/sensitivities/:id", (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const index = db.sensitivities.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Sensitivitas kustom HP tidak ditemukan" });
  }

  db.sensitivities.splice(index, 1);
  saveDB(db);
  res.json({ message: "Sensitivitas kustom berhasil dihapus" });
});

// 7. Manage Users
app.get("/api/users", (req, res) => {
  const db = getDB();
  // Return descending (latest first)
  const reversed = [...db.users].reverse();
  res.json(reversed);
});

app.delete("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const db = getDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Pengguna tidak ditemukan" });
  }

  db.users.splice(index, 1);
  saveDB(db);
  res.json({ message: "Data pengguna berhasil dihapus" });
});

// 8. Admin Settings / Telegram Config
app.get("/api/admin/config", (req, res) => {
  const db = getDB();
  res.json({
    botToken: db.telegram.botToken ? `${db.telegram.botToken.substring(0, 6)}...` : "",
    chatId: db.telegram.chatId,
    enabled: db.telegram.enabled,
    hasBotToken: !!db.telegram.botToken
  });
});

app.post("/api/admin/config", (req, res) => {
  const { botToken, chatId, enabled } = req.body;
  const db = getDB();

  db.telegram.enabled = !!enabled;
  if (chatId !== undefined) db.telegram.chatId = chatId.trim();
  // Protect overwriting if token provided is our mask or empty
  if (botToken && !botToken.endsWith("...")) {
    db.telegram.botToken = botToken.trim();
  }

  saveDB(db);
  res.json({ success: true, message: "Pengaturan Telegram berhasil disimpan" });
});

// Serve frontend assets under production
if (process.env.NODE_ENV !== "production") {
  const initVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  };
  initVite();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start Server on PORT 3000, 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Sensitivitas FF running on http://localhost:${PORT}`);
});
