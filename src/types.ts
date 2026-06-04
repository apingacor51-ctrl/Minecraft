export interface Brand {
  name: string;
  devices: string[];
}

export interface User {
  id: string;
  whatsapp: string;
  brand: string;
  device: string;
  created_at: string;
  code_used: string;
}

export interface Sensitivity {
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

export interface UnlockCode {
  id: string;
  code: string;
  status: "aktif" | "nonaktif";
  limit_use: number;
  used: number;
  created_at: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  hasBotToken?: boolean;
}

export interface AdminState {
  id: string;
  username: string;
  role: string;
}

export interface SensitivityValues {
  general: number;
  reddot: number;
  scope2x: number;
  scope4x: number;
  awm: number;
  freelook: number;
}
