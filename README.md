# Frontend New Season 1

Bản copy frontend để **thiết kế lại UI**. Dùng chung backend với site gốc.

| App | Port | Thư mục |
|-----|------|---------|
| Frontend gốc | `3000` | root project |
| Frontend new season 1 | `3002` | `frontend-newseason1/` |
| Backend API | `3001` | `backend/` |

## Chạy local

```bash
# Terminal 1 — backend (nếu chưa chạy)
cd backend && npm run dev

# Terminal 2 — frontend redesign
cd frontend-newseason1
npm install
npm run dev
```

Mở: http://localhost:3002

API backend mặc định: `http://localhost:3001` (file `.env.local`).
