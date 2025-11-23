import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with the key from .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { destination, agent, context } = await request.json();

    // 1. Define Personas (System Prompts)
    let systemPrompt = "";
    
    if (agent === 'frugal') {
      systemPrompt = "You are Penny, a budget travel expert. You hate spending money. Ignore comfort. Focus on hostels, walking, and street food. Be brief (max 3 sentences) and enthusiastic about saving money.";
    } else if (agent === 'boujee') {
      systemPrompt = "You are Sterling, a luxury travel snob. Cost is irrelevant. Focus on 5-star hotels, private drivers, and Michelin dining. Be brief (max 3 sentences) and condescending about 'budget' options.";
    } else if (agent === 'mediator') {
      systemPrompt = `You are a Mediator. Analyze the previous two arguments. Propose a compromise that satisfies the budget constraints of the first agent but the comfort needs of the second. Be diplomatic and brief. Context of arguments: ${context}`;
    }

    // 2. Call OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Plan a trip to ${destination}` }
      ],
      model: "gpt-3.5-turbo", 
      max_tokens: 150,
    });

    // 3. Return the text
    return NextResponse.json({ 
      text: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}