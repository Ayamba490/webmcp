/**
 * WebMCP Challenge Types & Data Models
 * Standard spec definition for document.modelContext
 */

export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (input: any) => Promise<any> | any;
}

export interface ModelContextHost {
  registerTool: (tool: WebMCPTool) => void;
  unregisterTool: (toolName: string) => void;
  getRegisteredTools: () => WebMCPTool[];
  invokeTool: (toolName: string, input: any) => Promise<any>;
}

export interface ProductSpec {
  material: string;
  connectivity: string;
  batteryLife?: string;
  weight: string;
  dimensions: string;
  warranty: string;
}

export interface CustomizationOptions {
  materials: { name: string; hex: string; finish: string; surcharge: number }[];
  accentGlows: { name: string; hex: string }[];
  engravingFonts: string[];
  firmwareProfiles: { id: string; name: string; description: string }[];
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "peripherals" | "audio" | "wearables" | "computing" | "studio";
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  stock: number;
  vendor: string;
  leadTimeDays: number;
  carbonKg: number;
  badge?: string;
  imageType: "keyboard" | "headset" | "ring" | "server" | "camera" | "mouse";
  specs: ProductSpec;
  customization?: CustomizationOptions;
  warehouseStock: {
    hubId: string;
    city: string;
    stock: number;
    shippingDays: number;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  customConfig?: {
    material: string;
    engravingText: string;
    accentGlow: string;
    firmwareProfile: string;
    engravingFont?: string;
  };
}

export interface ToolInvocationLog {
  id: string;
  timestamp: string;
  toolName: string;
  input: any;
  output: any;
  durationMs: number;
  status: "success" | "error" | "pending";
  invoker: "agent" | "human_inspector" | "external_webmcp";
}

export interface HumanConfirmationRequest {
  id: string;
  action: string;
  title: string;
  details: string;
  payload: any;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

export interface AgentChatMessage {
  id: string;
  sender: "human" | "agent" | "system";
  text: string;
  timestamp: string;
  toolCalls?: {
    tool: string;
    args: any;
    result?: any;
    purpose?: string;
    status: "running" | "done" | "failed";
  }[];
  thought?: string;
}

export interface NegotiationState {
  originalTotal: number;
  offeredDiscountPct: number;
  discountedTotal: number;
  status: "idle" | "negotiating" | "accepted" | "countered" | "declined";
  history: {
    round: number;
    party: "agent" | "store_ai";
    pct: number;
    reason: string;
    timestamp: string;
  }[];
}

export type ThemeMode = "dark_obsidian" | "clean_light" | "cyber_neon" | "warm_editorial";

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  badge: string;
}

export interface LogisticsDispatch {
  orderId: string;
  originHub: string;
  destinationZip: string;
  courier: string;
  estimatedArrival: string;
  carbonOffsetTons: number;
  status: "staged" | "dispatched" | "in_transit";
}
