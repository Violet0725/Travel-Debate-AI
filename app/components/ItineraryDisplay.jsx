"use client";

import React, { useState } from 'react';
import { Sun, Moon, Utensils, Camera, Bed, ChevronDown, ChevronUp } from 'lucide-react';

// --- ROBUST PARSER ---
const parseItineraryToCards = (markdownText) => {
  if (!markdownText) return [];

  const rawDays = markdownText.split(/###\s*Day\s*\d+/i).slice(1);

  return rawDays.map((dayBlock, index) => {
    const lines = dayBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const dayNumber = index + 1;
    const activities = [];
    let currentActivity = null;

    lines.forEach(line => {
      // Matches "**Label:** Content" or "- **Label**: Content" etc.
      const keyMatch = line.match(/(\*\*|__)?(.*?)(:|:\*\*|\*\*:)/);

      if (keyMatch) {
        const potentialLabel = keyMatch[2].trim().toLowerCase();

        // Skip lines that are just times or numbers (e.g., "8:00 am", "12")
        if (potentialLabel.match(/^(\d+|\d{1,2}:\d{2})\s*(am|pm)?$/i)) {
          if (currentActivity && currentActivity.content.length > 0) {
            activities.push(currentActivity);
          }
          currentActivity = null;
          return;
        }

        // Push previous valid activity before starting new one
        if (currentActivity && currentActivity.content.length > 0) {
          activities.push(currentActivity);
        }

        // Clean label
        const label = keyMatch[2].trim().replace(/\*\*/g, '').replace(/^-/, '').trim();

        // Extract and clean content
        let content = line.replace(keyMatch[0], '').trim();
        content = content.replace(/^-\s*/, '');
        content = content.replace(/\*\*/g, '').replace(/\*/g, '').trim();

        const key = label.toLowerCase();
        let type = 'activity';

        // Assign type based on keywords
        if (key.includes('morning')) type = 'morning';
        else if (key.includes('lunch') || key.includes('restaurant')) type = 'lunch';
        else if (key.includes('afternoon')) type = 'afternoon';
        else if (key.includes('dinner')) type = 'dinner';
        else if (key.includes('hotel') || key.includes('stay')) type = 'hotel';

        currentActivity = { type, label, content };
      } else if (currentActivity) {
        // Append additional lines to current activity
        let cleanLine = line.replace(/\*\*/g, '').replace(/\*/g, '').trim();
        if (cleanLine) {
          currentActivity.content += (currentActivity.content ? " " : "") + cleanLine;
        }
      }
    });

    // Push the last activity if valid
    if (currentActivity && currentActivity.content.length > 0) {
      activities.push(currentActivity);
    }

    return { day: dayNumber, activities };
  });
};

// --- CARD COMPONENT ---
const ItineraryCard = ({ activity }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className={`p-4 hover:bg-slate-50 transition-all cursor-pointer border-b border-slate-50 ${isOpen ? 'bg-slate-50' : ''}`}
    >
      <div className="flex gap-4 items-start">
        <div className="mt-1 shrink-0">
          {/* Icon based on activity type */}
          {activity.type === 'morning' && (
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Sun size={18} />
            </div>
          )}
          {(activity.type === 'lunch' || activity.label.toLowerCase().includes('restaurant')) && (
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Utensils size={18} />
            </div>
          )}
          {activity.type === 'afternoon' && (
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Camera size={18} />
            </div>
          )}
          {activity.type === 'dinner' && (
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Moon size={18} />
            </div>
          )}
          {activity.type === 'hotel' && (
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Bed size={18} />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-900">{activity.label}</h4>
            {isOpen ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </div>

          {/* Expanded content */}
          <div
            className={`text-sm text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ${
              isOpen ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            {activity.content}
          </div>

          {/* Truncated preview when closed */}
          {!isOpen && (
            <p className="text-xs text-slate-400 mt-1 truncate max-w-[250px]">
              {activity.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function ItineraryDisplay({ markdown }) {
  const parsedItinerary = parseItineraryToCards(markdown);

  return (
    <div className="space-y-6">
      {parsedItinerary.map((day) => (
        <div
          key={day.day}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 font-bold text-slate-700 flex justify-between items-center">
            <span>Day {day.day}</span>
            <span className="text-xs font-normal text-slate-400 uppercase tracking-wider">
              Schedule
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {day.activities.map((act, idx) => (
              <ItineraryCard key={idx} activity={act} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}