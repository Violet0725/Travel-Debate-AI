# Travel Debate AI 🌍✈️

A Multi-Agent Orchestration Engine that simulates a travel-planning negotiation between two AI personas (“Budget” vs. “Luxury”) and a Mediator.

---

## 🚀 Features

- **Multi-Agent System:** Orchestrates 3 distinct GPT-4 agents with conflicting system prompts.  
- **Live Visualization:** Custom SVG graph engine visualizing the agentic workflow and latency.  
- **Streaming Responses:** Real-time token streaming for a polished UX.  
- **Persistence:** Saves generated itineraries to a Redis database for sharing.  
- **Next.js 15:** Built on the latest React Server Components architecture.

---

## 🛠️ Tech Stack

**Frontend:** Next.js 15, Tailwind CSS, Lucide React  
**Backend:** Next.js API Routes (Serverless)  
**Database:** Redis (Upstash / Vercel KV)  
**AI:** OpenAI GPT-4o-mini

---

## 📸 Demo

<p align="center">
  <img src="./public/demo.gif" width="800" />
</p>

---

## 🏃‍♂️ How to Run Locally

1. Clone the repo  
2. `npm install`  
3. Create `.env.local` with:
   - `OPENAI_API_KEY`
   - `REDIS_URL`
4. `npm run dev`
