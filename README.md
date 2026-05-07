<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/users.svg" width="80" height="80" alt="FamSilo Logo" />
  <h1 align="center">FamSilo: The Premium Private Family Network</h1>
  <p align="center">
    <strong>A beautifully crafted, motion-ready social platform built exclusively for families. Powered by Autonomous AI Agents, RAG, and an immersive Glassmorphic UI.</strong>
  </p>
  
  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/AI-Gemini_2.5_Flash-1E88E5?style=for-the-badge&logo=google" alt="Gemini AI" /></a>
  </p>
</div>

---

## ✨ The Vision

**FamSilo** redefines how families stay connected. Instead of noisy group chats or public social media algorithms, FamSilo provides isolated, private **"Silos"** for your family branches. 

What sets FamSilo apart is its **Premium Aesthetic** and **Autonomous AI Agent Suite**. Hardware-accelerated micro-animations, a seamless dark/light theming engine, and AI that actively reads, curates, and facilitates family memories make this platform feel alive.

---

## 🚀 Key Features

### 🎨 Cinematic, Premium UI/UX
- **True Dark Mode Engine:** Instant, flicker-free theme switching built natively with Tailwind v4 `@variant dark`.
- **Glassmorphism & Depth:** Content cards feature dynamic drop-shadows, blurred backdrops, and gradient borders that adapt to the ambient theme.
- **Hardware-Accelerated Motion:** Every interaction feels premium. Silo feeds slide up with staggered entrances, message bubbles spring into view, and our custom `animations.css` ensures locked 60fps rendering without jank.

### 🤖 The Autonomous AI Agent Suite
Powered by **Gemini 2.5 Flash** and **Supabase `pgvector`**, FamSilo doesn't just host your data—it interacts with it.
1. **The Silo Facilitator**: Family chat gone quiet? The Facilitator detects dormancy (24h of no posts) and autonomously generates engaging prompts, nostalgic questions, or family trivia to reignite the conversation.
2. **Interactive RAG Concierge**: A floating, context-aware chatbot (accessible via the ✨ button) that intimately knows your family's history. It streams answers instantly via Server-Sent Events (SSE). *Example: "What did Aunt Mary say about the Thanksgiving recipe?"*
3. **Daily Briefing**: A beautiful, Instagram Story-style morning digest. FamSilo summarizes all unseen activity across your networks into a warm, 9-second auto-dismissing visual presentation.

### 🔒 Privacy & Architecture
- **Complete Isolation**: Data is partitioned securely using Supabase Row Level Security (RLS). You only see what your Silo shares.
- **Automated Content Moderation**: Media and text are scanned by Gemini AI upon upload to quarantine inappropriate content before it reaches the family feed.

---

## 🛠️ Tech Stack (Frontend)

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Vanilla CSS for spatial 3D effects
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Fetching**: `useSWR`, Context API
- **Deployment**: Vercel

*(For backend architecture, please see the `Family_Group_API` repository documentation).*

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Running instance of the `Family_Group_API` backend on port `8000`

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the Development Server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to see FamSilo in action.

---

<div align="center">
  <i>Built with ❤️ for families everywhere.</i>
</div>
