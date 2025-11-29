"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  DollarSign,
  Crown,
  Scale,
  Terminal,
  Cpu,
  Activity,
  Map,
  Calendar,
  CheckCircle,
  Share2,
  Link as LinkIcon,
  Check,
  Sun,
  Moon,
  Utensils,
  Camera,
  Bed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// FIX: Corrected import path with explicit .jsx extension
import ItineraryDisplay from "./ItineraryDisplay.jsx";

// --- SUB-COMPONENTS ---
const AgentNode = ({ type, isActive, isThinking, label, icon: Icon, position }) => {
  const getColors = () => {
    switch (type) {
      case "user":
        return "border-blue-500 bg-blue-50 text-blue-700";
      case "frugal":
        return "border-emerald-500 bg-emerald-50 text-emerald-700";
      case "boujee":
        return "border-purple-500 bg-purple-50 text-purple-700";
      case "mediator":
        return "border-amber-500 bg-amber-50 text-amber-700";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <div
      className={`absolute transition-all duration-500 flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 shadow-xl z-10 ${getColors()} ${
        isActive
          ? "scale-110 ring-4 ring-offset-2 ring-opacity-50 ring-blue-400"
          : "scale-100 opacity-90"
      }`}
      style={{ left: position.x, top: position.y }}
    >
      <Icon size={32} className="mb-1" />
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      {isThinking && (
        <div className="absolute -top-3 right-0 flex space-x-1 bg-white px-2 py-1 rounded-full shadow border border-gray-200">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )}
    </div>
  );
};

const Connection = ({ start, end, isActive, color }) => {
  const offset = 56;
  const startX = start.x + offset;
  const startY = start.y + offset;
  const endX = end.x + offset;
  const endY = end.y + offset;

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
      <defs>
        <marker
          id={`arrow-${color}`}
          markerWidth="10"
          markerHeight="10"
          refX="20"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={color} />
        </marker>
      </defs>

      <path
        d={`M${startX},${startY} C${startX},${(startY + endY) / 2} ${endX},${(startY + endY) / 2} ${endX},${endY}`}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {isActive && (
        <path
          d={`M${startX},${startY} C${startX},${(startY + endY) / 2} ${endX},${(startY + endY) / 2} ${endX},${endY}`}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="12,12"
          markerEnd={`url(#arrow-${color})`}
          className="animate-flow"
        />
      )}
    </svg>
  );
};

const ChatMessage = ({ agent, text, isTyping }) => {
  const getStyles = () => {
    switch (agent) {
      case "frugal":
        return { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-900", name: "Penny (Frugal)", icon: DollarSign };
      case "boujee":
        return { bg: "bg-purple-50 border-purple-200", text: "text-purple-900", name: "Sterling (Luxury)", icon: Crown };
      case "mediator":
        return { bg: "bg-amber-50 border-amber-200", text: "text-amber-900", name: "Judge (Mediator)", icon: Scale };
      default:
        return { bg: "bg-gray-50", text: "text-gray-900", name: "System", icon: Cpu };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  return (
    <div
      className={`flex flex-col p-4 rounded-xl border ${style.bg} ${style.text} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm`}
    >
      <div className="flex items-center space-x-2 mb-2 font-bold opacity-90">
        <div className="p-1 bg-white/50 rounded-full">
          <Icon size={14} />
        </div>
        <span>{style.name}</span>
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {text}
        {isTyping && <span className="animate-pulse ml-1">|</span>}
      </div>
    </div>
  );
};

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

  const fetchAgentResponse = async (agent, destination, context = "") => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, agent, context }),
      });
      const data = await res.json();
      return data.text;
    } catch (error) {
      addLog(`Error fetching ${agent}: ${error.message}`, "error");
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
          days,
          context: debateContext,
        }),
      });
      const data = await res.json();
      setItinerary(data.text);
      setPhase("result");
      addLog("Itinerary generated.", "system");
    } catch (error) {
      addLog("Failed to generate itinerary.", "error");
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

  const streamText = async (agent, fullText) => {
    return new Promise((resolve) => {
      let currentText = "";
      setMessages((prev) => [...prev, { agent, text: "", isTyping: true }]);
      let i = 0;

      const interval = setInterval(() => {
        currentText += fullText[i];
        setMessages((prev) => {
          const newArr = [...prev];
          newArr[newArr.length - 1] = { agent, text: currentText, isTyping: true };
          return newArr;
        });
        i++;
        if (i >= fullText.length) {
          clearInterval(interval);
          setMessages((prev) => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { agent, text: currentText, isTyping: false };
            return newArr;
          });
          resolve();
        }
      }, 10);
    });
  };

  const handleStart = async () => {
    if (!input.trim()) return;

    setPhase("orchestration");
    setMessages([]);
    setItinerary("");
    setShareId(null);
    setActiveAgent("user");

    addLog(`Target Destination: "${input}"`);
    addLog("Initializing Agent Swarm...", "system");

    await new Promise((r) => setTimeout(r, 800));
    setActiveAgent(null);
    addLog("Dispatching parallel requests...", "system");

    setActiveAgent("frugal");
    const frugalRes = await fetchAgentResponse("frugal", input);
    await streamText("frugal", frugalRes);

    setActiveAgent("boujee");
    const boujeeRes = await fetchAgentResponse("boujee", input);
    await streamText("boujee", boujeeRes);

    setActiveAgent(null);
    await new Promise((r) => setTimeout(r, 800));
    setActiveAgent("mediator");
    addLog("Synthesizing compromise...", "system");

    const context = `Budget Option: ${frugalRes}. Luxury Option: ${boujeeRes}`;
    setDebateContext(context);

    const mediatorRes = await fetchAgentResponse("mediator", input, context);
    await streamText("mediator", mediatorRes);

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
              <Connection start={POSITIONS.user} end={POSITIONS.frugal} isActive={activeAgent === "frugal"} color="#10b981" />
              <Connection start={POSITIONS.user} end={POSITIONS.boujee} isActive={activeAgent === "boujee"} color="#a855f7" />
              <Connection start={POSITIONS.frugal} end={POSITIONS.mediator} isActive={activeAgent === "mediator"} color="#f59e0b" />
              <Connection start={POSITIONS.boujee} end={POSITIONS.mediator} isActive={activeAgent === "mediator"} color="#f59e0b" />

              <AgentNode type="user" label="Input" icon={User} position={POSITIONS.user} isActive={activeAgent === "user"} />
              <AgentNode
                type="frugal"
                label="Penny"
                icon={DollarSign}
                position={POSITIONS.frugal}
                isActive={activeAgent === "frugal"}
                isThinking={activeAgent === "frugal"}
              />
              <AgentNode
                type="boujee"
                label="Sterling"
                icon={Crown}
                position={POSITIONS.boujee}
                isActive={activeAgent === "boujee"}
                isThinking={activeAgent === "boujee"}
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