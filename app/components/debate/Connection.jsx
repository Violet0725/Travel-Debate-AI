"use client";

import React from "react";

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

export default Connection;
