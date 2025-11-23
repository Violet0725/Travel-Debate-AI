import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { destination, preference, days, context } = await request.json();

    let stylePrompt = "";
    if (preference === 'frugal') {
      stylePrompt = "Strict budget. Hostels, street food, free walking tours, public transit.";
    } else if (preference === 'boujee') {
      stylePrompt = "Unlimited luxury. 5-star hotels, Michelin dining, private chauffeurs, exclusive access.";
    } else {
      stylePrompt = "Balanced mix. Great value boutique hotels, one nice dinner, mostly local authentic spots, mix of walking and taxis.";
    }

    const systemPrompt = `You are an Expert Travel Planner. 
    Create a detailed ${days}-day hour-by-hour itinerary for ${destination}.
    Style: ${stylePrompt}
    
    Context from previous debate: ${context}
    
    Format your response in clean Markdown. 
    For each day include: 
    - Morning Activity 
    - Lunch Spot (Specific restaurant name)
    - Afternoon Activity
    - Dinner Spot (Specific restaurant name)
    - Hotel Recommendation for the stay.
    
    Be specific. Do not give generic advice. Give real names of places.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate the itinerary.` }
      ],
      model: "gpt-3.5-turbo", // Switch to gpt-4 for better itineraries if you have credits
      max_tokens: 1000,
    });

    return NextResponse.json({ 
      text: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error("Itinerary API Error:", error);
    return NextResponse.json({ error: 'Failed to generate itinerary' }, { status: 500 });
  }
}