import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { withRedis } from '@/app/lib/redis';
import { 
  validateDestination, 
  validateDays, 
  validateItinerary,
  ValidationError 
} from '@/app/lib/validation';

// Trip expiration: 30 days in seconds
const TRIP_EXPIRATION = 30 * 24 * 60 * 60;

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate inputs
    const itinerary = validateItinerary(body.itinerary);
    const destination = validateDestination(body.destination);
    const days = validateDays(body.days);

    const id = nanoid(6);

    // Save to Redis with proper connection handling
    await withRedis(async (redis) => {
      await redis.set(
        `trip:${id}`, 
        JSON.stringify({ itinerary, destination, days }), 
        'EX', 
        TRIP_EXPIRATION
      );
    });

    return NextResponse.json({ id });
    
  } catch (error) {
    console.error("Share API Error:", error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save trip' }, 
      { status: 500 }
    );
  }
}