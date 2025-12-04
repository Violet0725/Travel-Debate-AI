"use client";

import React, { useState } from "react";
import {
  Send,
  User,
  DollarSign,
  Crown,
  Scale,
  Cpu,
  Activity,
  Map,
  Calendar,
  CheckCircle,
  Share2,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import ItineraryDisplay from "./ItineraryDisplay.jsx";
import { AgentNode, Connection, ChatMessage } from "./debate";

// --- MAIN COMPONENT ---
export default function TravelDebateApp() {
  const [input, setInput] = useState("");
  const [activeAgent, setActiveAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("input");
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [days, setDays] = useState(3);
  const [itinerary, setItinerary] = useState("");
  const [debateContext, setDebateContext] = useState("");

  // SHARE STATE
  const [shareId, setShareId] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const POSITIONS = {
    user: { x: 350, y: 20 },
    frugal: { x: 50, y: 220 },
    boujee: { x: 650, y: 220 },
    mediator: { x: 350, y: 420 },
  };

  // Simplified logging (TerminalLog removed)
  const addLog = (message, type = "info") => {
    console.log(`[LOG] [${type.toUpperCase()}] ${message}`);
  };

  // Stream response from API and update messages in real-time
  const streamAgentResponse = async (agent, destination, context = "", messageIndex) => {
    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, agent, context }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullText += parsed.content;
                setMessages((prev) => {
                  const newArr = [...prev];
                  if (newArr[messageIndex]) {
                    newArr[messageIndex] = { agent, text: fullText, isTyping: true };
                  }
                  return newArr;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Mark as done typing
      setMessages((prev) => {
        const newArr = [...prev];
        if (newArr[messageIndex]) {
          newArr[messageIndex] = { agent, text: fullText, isTyping: false };
        }
        return newArr;
      });

      return fullText;
    } catch (error) {
      addLog(`Error streaming ${agent}: ${error.message}`, "error");
      setMessages((prev) => {
        const newArr = [...prev];
        if (newArr[messageIndex]) {
          newArr[messageIndex] = { agent, text: "Connection Error.", isTyping: false };
        }
        return newArr;
      });
      return "Connection Error.";
    }
  };

  const fetchItinerary = async () => {
    setPhase("generating");
    addLog(`Generating ${days}-Day Itinerary [Style: ${selectedPreference}]...`, "system");

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: input,
          preference: selectedPreference,
          days: parseInt(days, 10), // Ensure days is always a number
          context: debateContext,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.text) {
        throw new Error("No itinerary content received");
      }
      
      setItinerary(data.text);
      setPhase("result");
      addLog("Itinerary generated.", "system");
    } catch (error) {
      console.error("Itinerary generation failed:", error);
      addLog(`Failed to generate itinerary: ${error.message}`, "error");
      setPhase("selection");
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itinerary,
          destination: input,
          days,
        }),
      });
      const data = await res.json();
      setShareId(data.id);

      const url = `${window.location.origin}/trip/${data.id}`;

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addLog(`Trip saved! ID: ${data.id}`, "system");
    } catch (error) {
      addLog("Share failed.", "error");
    } finally {
      setIsSharing(false);
    }
  };

  const handleStart = async () => {
    if (!input.trim()) return;

    setPhase("orchestration");
    setItinerary("");
    setShareId(null);
    setActiveAgent("user");

    addLog(`Target Destination: "${input}"`);
    addLog("Initializing Agent Swarm...", "system");

    await new Promise((r) => setTimeout(r, 600));
    
    // Initialize both message slots for parallel streaming
    setMessages([
      { agent: "frugal", text: "", isTyping: true },
      { agent: "boujee", text: "", isTyping: true },
    ]);
    
    addLog("Dispatching PARALLEL requests to Penny & Sterling...", "system");
    setActiveAgent("both"); // Show both agents active

    // Run frugal and boujee in PARALLEL with true streaming
    const [frugalRes, boujeeRes] = await Promise.all([
      streamAgentResponse("frugal", input, "", 0),
      streamAgentResponse("boujee", input, "", 1),
    ]);

    addLog("Both agents responded. Synthesizing compromise...", "system");
    
    await new Promise((r) => setTimeout(r, 400));
    setActiveAgent("mediator");

    // Add mediator message slot
    setMessages((prev) => [...prev, { agent: "mediator", text: "", isTyping: true }]);

    const context = `Budget Option: ${frugalRes}. Luxury Option: ${boujeeRes}`;
    setDebateContext(context);

    // Stream mediator response
    await streamAgentResponse("mediator", input, context, 2);

    addLog("Debate Concluded. Waiting for user decision.", "system");
    setActiveAgent(null);
    setPhase("selection");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center space-x-2">
          <Activity className="text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              TravelDebate<span className="text-blue-600">.ai</span>
            </h1>
            <p className="text-xs text-slate-500">Multi-Agent Orchestration</p>
          </div>
        </div>
        <div className="text-xs bg-slate-100 px-3 py-1 rounded-full font-mono text-slate-500 border border-slate-200">
          State: <span className="font-bold text-blue-600">{phase.toUpperCase()}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANEL: VISUALIZATION */}
        <div className="lg:w-3/5 relative bg-slate-100/50 overflow-hidden flex flex-col border-r border-slate-200">
          <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur p-2 rounded text-xs text-slate-500 border border-slate-200">
            Engine: SVG/CSS Graph
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-[600px]">
            <div className="relative w-[800px] h-[550px]">
              <Connection start={POSITIONS.user} end={POSITIONS.frugal} isActive={activeAgent === "frugal" || activeAgent === "both"} color="#10b981" />
              <Connection start={POSITIONS.user} end={POSITIONS.boujee} isActive={activeAgent === "boujee" || activeAgent === "both"} color="#a855f7" />
              <Connection start={POSITIONS.frugal} end={POSITIONS.mediator} isActive={activeAgent === "mediator"} color="#f59e0b" />
              <Connection start={POSITIONS.boujee} end={POSITIONS.mediator} isActive={activeAgent === "mediator"} color="#f59e0b" />

              <AgentNode type="user" label="Input" icon={User} position={POSITIONS.user} isActive={activeAgent === "user"} />
              <AgentNode
                type="frugal"
                label="Penny"
                icon={DollarSign}
                position={POSITIONS.frugal}
                isActive={activeAgent === "frugal" || activeAgent === "both"}
                isThinking={activeAgent === "frugal" || activeAgent === "both"}
              />
              <AgentNode
                type="boujee"
                label="Sterling"
                icon={Crown}
                position={POSITIONS.boujee}
                isActive={activeAgent === "boujee" || activeAgent === "both"}
                isThinking={activeAgent === "boujee" || activeAgent === "both"}
              />
              <AgentNode
                type="mediator"
                label="Judge"
                icon={Scale}
                position={POSITIONS.mediator}
                isActive={activeAgent === "mediator"}
                isThinking={activeAgent === "mediator"}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTION */}
        <div className="lg:w-2/5 bg-white flex flex-col shadow-xl z-10">
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
            {messages.length === 0 && phase === "input" && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 opacity-60">
                <div className="p-4 bg-slate-100 rounded-full">
                  <Cpu size={48} />
                </div>
                <p className="text-center text-sm max-w-xs">Enter a destination to trigger the Swarm.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={i} agent={msg.agent} text={msg.text} isTyping={msg.isTyping} />
            ))}

            {phase === "selection" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-6 rounded-xl border border-blue-100 shadow-lg space-y-4">
                <div className="flex items-center space-x-2 text-blue-800 font-bold border-b pb-2">
                  <CheckCircle size={20} />
                  <span>Choose Your Style</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setSelectedPreference("frugal")}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedPreference === "frugal"
                        ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold text-emerald-800 flex items-center">
                      <DollarSign size={16} className="mr-2" /> Team Penny (Budget)
                    </div>
                    <div className="text-xs text-slate-500">Save money, authentic local vibes.</div>
                  </button>
                  <button
                    onClick={() => setSelectedPreference("boujee")}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedPreference === "boujee"
                        ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold text-purple-800 flex items-center">
                      <Crown size={16} className="mr-2" /> Team Sterling (Luxury)
                    </div>
                    <div className="text-xs text-slate-500">Comfort first, exclusive experiences.</div>
                  </button>
                  <button
                    onClick={() => setSelectedPreference("mediator")}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedPreference === "mediator"
                        ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold text-amber-800 flex items-center">
                      <Scale size={16} className="mr-2" /> Team Judge (Balanced)
                    </div>
                    <div className="text-xs text-slate-500">Best of both worlds. Smart spending.</div>
                  </button>
                </div>

                {selectedPreference && (
                  <div className="pt-4 animate-in fade-in">
                    <label className="block text-sm font-medium text-slate-700 mb-2">How many days?</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="flex-1"
                      />
                      <span className="font-mono font-bold text-lg w-8">{days}</span>
                    </div>
                    <button
                      onClick={fetchItinerary}
                      className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center space-x-2"
                    >
                      <Map size={18} />
                      <span>Generate Full Itinerary</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {phase === "generating" && (
              <div className="p-8 flex flex-col items-center justify-center space-y-4 text-slate-400 animate-pulse">
                <Map size={48} />
                <span>Crafting your perfect trip...</span>
              </div>
            )}

            {phase === "result" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
                <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-t-xl -mb-4 z-10 relative">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold flex items-center">
                      <Calendar className="mr-2" />
                      {days}-Day Itinerary
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {isSharing ? (
                        <span className="animate-spin">Loading</span>
                      ) : copied ? (
                        <Check size={16} />
                      ) : (
                        <Share2 size={16} />
                      )}
                      <span>{copied ? "Copied!" : "Share Trip"}</span>
                    </button>
                    <button onClick={() => setPhase("input")} className="text-sm text-slate-300 hover:text-white underline">
                      Restart
                    </button>
                  </div>
                </div>

                {shareId && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center justify-between text-sm text-green-800 animate-in fade-in">
                    <span className="flex items-center">
                      <LinkIcon size={14} className="mr-2" /> Trip saved permanently!
                    </span>
                    <a href={`${window.location.origin}/trip/${shareId}`} target="_blank" rel="noopener noreferrer" className="underline font-bold">
                      View Link
                    </a>
                  </div>
                )}

                <ItineraryDisplay markdown={itinerary} />
              </div>
            )}
          </div>

          {phase === "input" && (
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  placeholder="Where do you want to go? (e.g., Tokyo)"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleStart}
                  disabled={!input.trim()}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="mt-2 text-xs text-center text-slate-400">Powered by OpenAI GPT-4 Swarm</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}