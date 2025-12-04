"use client";

import React from "react";
import { DollarSign, Crown, Scale, Cpu } from "lucide-react";

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

export default ChatMessage;
