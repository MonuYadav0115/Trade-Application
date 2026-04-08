# Trade Opportunities — Frontend

React + Vite + Tailwind CSS frontend for the Trade Opportunities API.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

> Make sure the backend is running at `http://localhost:8000` first!

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | JWT authentication |
| Dashboard | `/dashboard` | Overview + quick sector access |
| Analyze | `/analyze` | Generate AI trade reports |
| History | `/history` | View past reports (saved locally) |
| Session | `/session` | Session info + server health |

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios (API calls)
- React Markdown (report rendering)
- React Hot Toast (notifications)
- Lucide React (icons)