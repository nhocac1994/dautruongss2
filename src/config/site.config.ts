// Site Configuration - Thay đổi thông tin tại đây mà không cần sửa mã nguồn
export const siteConfig = {
  // Thông tin game
  nameGame: "MUDAUTRUONGSS1.NET",
  gameTitle: "Mu Online Season 1.0",
  gameSubtitle: "Bản chuẩn Season 1.0 — Không hạ cấp",
  
  // Thông tin server
  serverName: "MUDAUTRUONGSS1.NET",
  serverVersion: "Season 1.0",
  serverIP: "127.0.0.1",
  serverPort: "55900",
  
  // Links mạng xã hội
  linkFacebook: "https://facebook.com/mudautruongss1.net",
  linkDiscord: "https://discord.gg/mudautruongss1",
  linkYoutube: "https://youtube.com/@mudautruongss1",
  linkZalo: "https://zalo.me/mudautruongss1",
  linkTikTok: "https://www.tiktok.com/@mudautruongss1",
  
  // Thông tin liên hệ
  email: "support@mudautruongss1.net",
  phone: "0123456789",
  address: "Việt Nam",
  
  // Thông tin website
  websiteUrl: "https://mudautruongss1.net",
  websiteName: "MUDAUTRUONGSS1.NET",
  
  // Thông tin game settings
  expRate: "x50",
  dropRate: "90%",
  resetLevel: 400,
  maxReset: 999,
  
  // Thông tin events
  eventStartDate: "2025-10-10",
  eventStartTime: "13:00",
  
  // SEO & Meta
  metaDescription: "MUDAUTRUONGSS1.NET - Server Mu Online Season 1.0 bản chuẩn, không hạ cấp. Exp cao, drop tốt, PvP, Guild, Events đặc biệt.",
  metaKeywords: [
    "Mu Online",
    "Mu Online Season 1.0",
    "MUDAUTRUONGSS1.NET",
    "Season 1.0 bản chuẩn",
    "Mu Online không hạ cấp",
    "Server Mu Online",
    "Game Mu Online Việt Nam"
  ],
  
  // Images
  logoImage: "/NAME.webp",
  bannerImage: "/panel/muss2.webp",
  favicon: "/favicon.ico",
  
  // Colors theme
  primaryColor: "#FFD700",
  secondaryColor: "#FFA500",
  accentColor: "#FF0000",
  
  // Features
  features: {
    pvp: true,
    guild: true,
    events: true,
    reset: true,
    chaosMix: true
  }
};

// Export type for TypeScript
export type SiteConfig = typeof siteConfig;
