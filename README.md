# AI Explorer - Search & Summarize

A responsive web application that searches for any topic and provides AI-generated summaries across different categories: Overview, Research, News, and Fact-Check.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express
- **APIs**: Tavily (Search), OpenAI (Summarization)

---

## 🚀 Deployment Instructions

### 1. Preparation
- Create a [GitHub](https://github.com) account.
- Create a [Render](https://render.com) account (for Backend).
- Create a [Vercel](https://vercel.com) account (for Frontend).

### 2. Upload to GitHub
1. Open your terminal in this folder.
2. Initialize Git and push to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a new repo on GitHub and follow their "push an existing repository" commands:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### 3. Deploy Backend (Render)
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Name**: `ai-summarizer-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. **Environment Variables** (Add these):
   - `OPENAI_API_KEY`: Your OpenAI API Key.
   - `TAVILY_API_KEY`: Your Tavily API Key.
6. Click **Create Web Service**. Copy the URL once it's live (e.g., `https://ai-summarizer-api.onrender.com`).

### 4. Deploy Frontend (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** > **Project**.
3. Connect your GitHub repository.
4. Settings:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
5. **Environment Variables** (Add this):
   - `VITE_API_URL`: Paste the URL you copied from Render.
6. Click **Deploy**.

---

## 🛠️ Local Development
1. **Backend**:
   ```bash
   cd server
   npm install
   # Create a .env file with OPENAI_API_KEY and TAVILY_API_KEY
   node index.js
   ```
2. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
