# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Desktop (optional)

### Running locally with Docker Compose:
```bash
docker compose up --build
```
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/v1/health

---

## Deploying Backend to Render

### Option 1: 1-Click Deployment with Render Blueprints (`render.yaml`)

1. Push your latest repository changes to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub repository (`rent-hub`).
5. Render will automatically detect `render.yaml` and configure:
   - **Web Service:** `rent-hub-backend`
   - **Database:** `rent-hub-db` (PostgreSQL)
6. Click **Apply**. Render will build and deploy your API automatically!

---

### Option 2: Manual Web Service Setup on Render

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`rent-hub`).
4. Configure the Web Service settings:
   - **Name:** `rent-hub-backend`
   - **Language:** `Python 3` (or `Docker`)
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/api/v1/health`

5. **Environment Variables**:
   Add the following in Render **Environment** settings:

   | Key | Example Value / Description |
   | --- | --- |
   | `PYTHON_VERSION` | `3.10.13` |
   | `CORS_ORIGINS` | `*` (or your frontend Render/Vercel URL) |
   | `JWT_SECRET` | Generate a secure random secret string |
   | `DATABASE_URL` | Render PostgreSQL internal connection string (auto-formats `postgres://` to `postgresql://`) |
   | `API_V1_STR` | `/api/v1` |

6. Click **Create Web Service**.

---

## Production Architecture
- **Frontend:** Static web app hosted on Vercel / Netlify / Render Static Site.
- **Backend:** FastAPI Web Service hosted on Render / AWS ECS.
- **Database:** Render PostgreSQL / AWS RDS.
- **Storage:** Local `./uploads` or AWS S3 / Cloudinary for document files.
