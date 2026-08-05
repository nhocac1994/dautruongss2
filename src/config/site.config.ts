// Site Configuration - Thay đổi thông tin tại đây mà không cần sửa mã nguồn
export const siteConfig = {
  // Thông tin game
  nameGame: "SEASON2",
  gameTitle: "Mu Online Season 2.0",
  gameSubtitle: "Bản chuẩn Season 2.0 — Không hạ cấp",
  
  // Thông tin server
  serverName: "SEASON2",
  serverVersion: "Season 2.0",
  serverIP: "127.0.0.1",
  serverPort: "55900",
  
  // Links mạng xã hội
  linkFacebook: "https://facebook.com/Mu-hnss1.com",
  linkDiscord: "https://discord.gg/MuHnss1.com",
  linkYoutube: "https://youtube.com/@MuHnss1.com",
  linkZalo: "https://zalo.me/MuHnss1.com",
  linkTikTok: "https://www.tiktok.com/@MuHnss1.com",
  
  // Thông tin liên hệ
  email: "support@season2.com",
  phone: "0123456789",
  address: "Việt Nam",
  
  // Thông tin website
  websiteUrl: "https://MuHnss1.com",
  websiteName: "SEASON2",
  
  // Thông tin game settings
  expRate: "100x",
  dropRate: "99%",
  resetLevel: 400,
  maxReset: 999,
  
  // Thông tin events
  eventStartDate: "2025-10-10",
  eventStartTime: "13:00",
  
  // SEO & Meta
  metaDescription: "SEASON2 - Server Mu Online Season 2.0 bản chuẩn, không hạ cấp. Exp cao, drop tốt, PvP, Guild, Events đặc biệt.",
  metaKeywords: [
    "Mu Online",
    "Mu Online Season 2.0",
    "SEASON2",
    "Season 2.0 bản chuẩn",
    "Mu Online không hạ cấp",
    "Server Mu Online",
    "Game Mu Online Việt Nam"
  ],
  
  // Images
  logoImage: "/NAME.PNG",
  bannerImage: "/panel/muss2.png",
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

