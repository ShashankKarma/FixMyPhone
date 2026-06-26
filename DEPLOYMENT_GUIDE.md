# Free Tier Deployment Guide - FixMyPhone

This guide provides step-by-step instructions to deploy the **FixMyPhone** application (Spring Boot backend + React/Vite frontend) completely for free using cloud platforms.

## Deployment Architecture

1. **Frontend (React)**: Hosted on **Vercel** or **Render Static Sites** (Free, 24/7 online, fast global CDN).
2. **Backend (Spring Boot)**: Hosted on **Render Web Services** (Free, built automatically using the provided Dockerfile).
3. **Database Options**:
   - **In-Memory (H2)**: Default. No setup required. Note: Data resets when the backend container sleeps/restarts.
   - **PostgreSQL (Neon / Supabase)**: Recommended for data persistence. Both offer excellent free tiers.

---

## Part 1: Deploying the Backend on Render (Free)

Render builds and runs your Java Spring Boot application using the existing `backend/Dockerfile`.

### Step 1: Create a Render Account & Connect GitHub
1. Go to [Render](https://render.com/) and sign up.
2. Connect your GitHub account.

### Step 2: Create a Web Service
1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Choose the `FixMyPhone` repository.

### Step 3: Configure Service Settings
* **Name**: `fixmyphone-backend` (or similar)
* **Region**: Choose the region closest to you or your target users (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`).
* **Branch**: `main`
* **Root Directory**: `backend` (This points Render to the backend folder containing your Pom.xml and Dockerfile).
* **Runtime**: `Docker` (Render automatically detects and builds your Dockerfile).
* **Instance Type**: `Free`

### Step 4: Add Environment Variables
Scroll down, click **Advanced**, and add the following Environment Variables:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `JWT_SECRET` | *A random 64-character hex string* | E.g., `9a4f2c8d3b7a1e5f8c6b2d4e7a9f0c1b3d5e7f8a2c4b6d8e0f1a3c5b7d9e1f2a` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend-vercel-url.vercel.app` | **Note:** Set this *after* deploying your frontend, or update it later. |
| `SPRING_MAIL_HOST` | `smtp.gmail.com` | Or your SMTP mail server of choice. |
| `CLOUDINARY_CLOUD_NAME`| *Your Cloudinary cloud name* | Required for persistent image uploads (highly recommended since Render's free tier has an ephemeral file system). |
| `CLOUDINARY_API_KEY` | *Your Cloudinary API key* | |
| `CLOUDINARY_API_SECRET`| *Your Cloudinary API secret* | |

#### Optional: If using an External PostgreSQL Database (Neon/Supabase)
By default, the backend falls back to an in-memory H2 database. To keep your data permanently:
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech/) or [Supabase](https://supabase.com/).
2. Copy the Connection URL.
3. Add these environment variables to Render:

| Key | Value |
| :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://your-db-host:5432/your-db-name` |
| `SPRING_DATASOURCE_USERNAME` | `your-db-username` |
| `SPRING_DATASOURCE_PASSWORD` | `your-db-password` |
| `SPRING_DATASOURCE_DRIVER` | `org.postgresql.Driver` |
| `SPRING_JPA_DATABASE_PLATFORM`| `org.hibernate.dialect.PostgreSQLDialect` |

### Step 5: Deploy
Click **Create Web Service**. Render will pull the code, execute the Docker multi-stage build, compile the Spring Boot application, and start the service.
* Once active, note down the generated URL (e.g., `https://fixmyphone-backend.onrender.com`).

---

## Part 2: Deploying the Frontend on Vercel (Free)

Vercel is optimized for React static frontends and provides fast edge performance.

### Step 1: Create a Vercel Account
1. Go to [Vercel](https://vercel.com/) and sign up with GitHub.

### Step 2: Import Project
1. Click **Add New...** -> **Project**.
2. Select your `FixMyPhone` repository.

### Step 3: Configure Project Settings
* **Project Name**: `fixmyphone-frontend`
* **Framework Preset**: `Vite` (Vercel automatically detects this).
* **Root Directory**: Click *Edit* and select the `frontend` folder.
* **Build and Output Settings**:
  - Keep defaults (Build Command: `npm run build`, Output Directory: `dist`).

### Step 4: Add Environment Variables
Open the **Environment Variables** accordion and add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-backend-render-url.onrender.com/api` | Point this to your Render backend URL (make sure it ends with `/api`). |

### Step 5: Deploy
Click **Deploy**. Vercel will build the frontend assets and host them.
* Note down your live frontend URL (e.g., `https://fixmyphone-frontend.vercel.app`).

---

## Part 3: Link Frontend & Backend (Finalizing CORS)

To allow the frontend to communicate with the backend securely:
1. Go back to your Render Dashboard -> **fixmyphone-backend** -> **Environment**.
2. Update `CORS_ALLOWED_ORIGINS` to point to your live Vercel URL (e.g. `https://fixmyphone-frontend.vercel.app`).
3. Save changes. Render will automatically redeploy the backend with the updated CORS rule.

---

## Important Free Tier Behavior to Remember

> [!WARNING]
> **Cold Starts**: On Render's Free tier, if your backend doesn't receive any requests for 15 minutes, it will spin down (sleep). The next time someone visits your frontend and makes an API request, Render has to spin up the container again, which takes about 30 to 50 seconds. Once awake, performance returns to normal.
