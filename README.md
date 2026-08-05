# dautruongss2 — SEASON2 (Next.js)

Website Mu Online Season 2.0 bản chuẩn (không hạ cấp). Frontend Next.js gọi Backend API qua `/api/*`.

## Cấu trúc thư mục

```
frontend/
├── public/                 # Ảnh, favicon, manifest (phục vụ tĩnh)
│   ├── favicon/
│   ├── icons/
│   └── manifest.json
│
├── src/
│   ├── app/                # App Router (trang + API routes)
│   │   ├── page.tsx        # Trang chủ
│   │   ├── layout.tsx      # Layout gốc
│   │   ├── globals.css
│   │   ├── login/          # Đăng nhập game
│   │   ├── register/       # Đăng ký
│   │   ├── dashboard/      # Tài khoản / nhân vật
│   │   ├── rankings/       # Bảng xếp hạng
│   │   ├── news/           # Tin tức
│   │   ├── admin/          # Admin website (proxy backend)
│   │   ├── download/       # Tải client
│   │   ├── donate/         # Donate
│   │   ├── info/           # Thông tin server
│   │   └── api/            # Next.js API (proxy → backend)
│   │       ├── login/
│   │       ├── register/
│   │       ├── characters/
│   │       ├── dashboard/
│   │       ├── rankings/
│   │       ├── admin/
│   │       ├── config/
│   │       └── remote/     # Proxy config/site từ backend
│   │
│   ├── components/         # UI dùng chung
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── RankingTable.tsx
│   │   ├── GuildRankingTable.tsx
│   │   └── admin/          # ConfigEditor, NewsEditor
│   │
│   ├── lib/                # Logic client + server helpers
│   │   ├── api-client.ts
│   │   ├── ranking-api.ts
│   │   ├── news-api.ts
│   │   ├── config-api.ts
│   │   ├── mu-classes.ts   # Tên class MU
│   │   └── guild-mark.ts   # Logo guild từ G_Mark
│   │
│   ├── config/             # Cấu hình site (fallback local)
│   ├── hooks/
│   ├── styles/
│   └── middleware.ts       # Bảo mật / redirect
│
├── .env.local              # Biến môi trường (không commit — tạo thủ công)
├── next.config.ts
├── package.json
├── tsconfig.json
├── vercel.json             # Deploy Vercel
└── netlify.toml            # Deploy Netlify
```

## Chạy local

```bash
npm install
npm run dev
```

Tạo file `.env.local` (không commit):

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001
```

Mở: **http://localhost:3000**

Backend dev mặc định: `http://localhost:3001` (nếu chưa set `.env.local`).

Production/VPS: set `NEXT_PUBLIC_BACKEND_API_URL` trên Vercel hoặc `.env.local`.

## Biến môi trường

| Biến | Mô tả |
|------|--------|
| `NEXT_PUBLIC_BACKEND_API_URL` | URL backend API (bắt buộc) |
| `NEXT_PUBLIC_SITE_URL` | Domain production (Vercel HTTPS) |

## Luồng dữ liệu

```
Trình duyệt → Next.js /api/* → Backend Express → SQL Server
```

Database **không** kết nối trực tiếp từ trình duyệt; chỉ qua backend.

## Admin

| Vị trí | URL |
|--------|-----|
| Admin website | `/admin` (Next.js) |
| Admin backend từ xa | `{BACKEND_URL}/admin` (HTML trên backend) |

Cùng tài khoản `ADMIN_USERNAME` / `ADMIN_PASSWORD` trên backend.
