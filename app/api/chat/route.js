import { NextResponse } from 'next/server';
import openai from '@/app/lib/openai';
import { AGENT_PROMPTS } from '@/app/lib/prompts';
import { 
  validateDestination, 
  validateAgent, 
  validateContext,
  ValidationError 
} from '@/app/lib/validation';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate inputs
    const destination = validateDestination(body.destination);
    const agent = validateAgent(body.agent);
    const context = validateContext(body.context);

    // Get the appropriate system prompt
    const systemPrompt = agent === 'mediator' 
      ? AGENT_PROMPTS.mediator(context)
      : AGENT_PROMPTS[agent];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Plan a trip to ${destination}` }
      ],
      model: "gpt-3.5-turbo", 
      max_tokens: 150,
    });

    return NextResponse.json({ 
      text: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field }, 
        { status: 400 }
      );
    }
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate response' }, 
      { status: 500 }
    );
  }
}