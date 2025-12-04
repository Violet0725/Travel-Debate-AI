# Travel Debate AI 🌍✈️

A Multi-Agent Orchestration Engine that simulates a travel-planning negotiation between two AI personas (“Budget” vs. “Luxury”) and a Mediator.

---

## 🌐 Live Website
 
[https://travel-debate-ai.vercel.app/](https://travel-debate-ai.vercel.app/)
---

## 🚀 Features

- **Multi-Agent System:** Orchestrates 3 distinct AI agents with conflicting personas (Budget, Luxury, Mediator).  
- **Parallel Execution:** Budget and Luxury agents run simultaneously via `Promise.all()`, reducing response time by 50%.  
- **True SSE Streaming:** Real-time token-by-token streaming from OpenAI using Server-Sent Events.  
- **Live Visualization:** Custom SVG graph engine visualizing the agentic workflow in real-time.  
- **Persistence:** Saves generated itineraries to Redis with 30-day TTL and shareable links.  
- **Error Boundaries:** Graceful error handling with React Error Boundaries and input validation.  
- **Next.js 15:** Built on the latest React Server Components architecture.

---

## 🏗️ Architecture

```
app/
├── api/
│   ├── chat/stream/    # SSE streaming endpoint
│   ├── itinerary/      # Itinerary generation
│   └── share/          # Redis persistence
├── components/
│   ├── debate/         # AgentNode, Connection, ChatMessage
│   └── ui/             # ErrorBoundary, LoadingSkeleton
└── lib/
    ├── openai.js       # Shared OpenAI client
    ├── redis.js        # Connection pooling
    ├── prompts.js      # Centralized AI prompts
    └── validation.js   # Input validation
```

---

## 🛠️ Tech Stack

**Frontend:** Next.js 15, React 19, Tailwind CSS, Lucide React  
**Backend:** Next.js API Routes (Serverless), Server-Sent Events  
**Database:** Redis (Upstash / Vercel KV)  
**AI:** OpenAI GPT-3.5-turbo (configurable)

---

## 📸 Demo

<p align="center">
  <img src="./public/demo.gif" width="800" />
</p>

---

## 🏃‍♂️ How to Run Locally

1. Clone the repo  
2. `npm install`  
3. Copy `.env.example` to `.env.local` and fill in:
   - `OPENAI_API_KEY`
   - `REDIS_URL`
4. `npm run dev`

---

## 📄 License

MIT
