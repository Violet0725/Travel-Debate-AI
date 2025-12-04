import { AGENT_PROMPTS } from '@/app/lib/prompts';
import { 
  validateDestination, 
  validateAgent, 
  validateContext,
  ValidationError 
} from '@/app/lib/validation';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Create streaming response from OpenAI
    const stream = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Plan a trip to ${destination}` }
      ],
      model: "gpt-3.5-turbo", 
      max_tokens: 150,
      stream: true,
    });

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // Send as SSE format
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          // Send done signal
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Streaming Chat API Error:", error);
    
    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message, field: error.field }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
