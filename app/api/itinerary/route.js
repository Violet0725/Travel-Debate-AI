import { NextResponse } from 'next/server';
import openai from '@/app/lib/openai';
import { ITINERARY_STYLES, getItineraryPrompt } from '@/app/lib/prompts';
import { 
  validateDestination, 
  validatePreference, 
  validateDays,
  validateContext,
  ValidationError 
} from '@/app/lib/validation';

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate inputs
    const destination = validateDestination(body.destination);
    const preference = validatePreference(body.preference);
    const days = validateDays(body.days);
    const context = validateContext(body.context);

    // Get style and generate prompt
    const style = ITINERARY_STYLES[preference];
    const systemPrompt = getItineraryPrompt({ destination, days, style, context });

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate the itinerary.` }
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 1500,
    });

    return NextResponse.json({ 
      text: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error("Itinerary API Error:", error);
    
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
      { error: 'Failed to generate itinerary' }, 
      { status: 500 }
    );
  }
}