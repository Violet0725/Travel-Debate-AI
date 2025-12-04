"use client";

import React from "react";

// Generic skeleton shimmer animation
const Skeleton = ({ className = "" }) => (
  <div 
    className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded ${className}`}
    style={{ animation: "shimmer 1.5s infinite" }}
  />
);

// Skeleton for chat messages during loading
export const MessageSkeleton = () => (
  <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 mb-4">
    <div className="flex items-center space-x-2 mb-3">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="w-24 h-4" />
    </div>
    <div className="space-y-2">
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  </div>
);

// Skeleton for itinerary cards
export const ItinerarySkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((day) => (
      <div key={day} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
          <Skeleton className="w-20 h-5" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-full h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Loading spinner with message
export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
    </div>
    <p className="text-slate-500 text-sm font-medium">{message}</p>
  </div>
);

// Progress indicator for multi-step processes
export const ProgressIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    {steps.map((step, index) => (
      <React.Fragment key={step}>
        <div 
          className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
            index < currentStep 
              ? "bg-green-500 text-white" 
              : index === currentStep 
                ? "bg-blue-600 text-white animate-pulse" 
                : "bg-slate-200 text-slate-500"
          }`}
        >
          {index < currentStep ? "✓" : index + 1}
        </div>
        {index < steps.length - 1 && (
          <div 
            className={`w-12 h-1 rounded transition-colors ${
              index < currentStep ? "bg-green-500" : "bg-slate-200"
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default Skeleton;
