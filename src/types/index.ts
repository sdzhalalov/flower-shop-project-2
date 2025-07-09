export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  featured: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: Date;
  role: "guest" | "admin" | "moderator";
  guestId?: string;
}

export interface ChatConversation {
  guestId: string;
  guestName: string;
  messages: ChatMessage[];
  unreadCount: number;
}

export interface Promo {
  id: number;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  active: boolean;
  expiresAt: Date;
  description: string;
}

export interface User {
  id: number;
  username: string;
  role: "admin" | "moderator" | "guest";
  name: string;
}

export interface SiteSettings {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export interface Category {
  value: string;
  label: string;
}

export interface LoginForm {
  username: string;
  password: string;
}
