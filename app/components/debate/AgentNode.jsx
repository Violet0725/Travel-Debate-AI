"use client";

import React from "react";

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

export default AgentNode;
