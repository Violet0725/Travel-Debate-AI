import { NextResponse } from 'next/server';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';

// Connect to Redis using the URL you have
const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    const body = await request.json();
    const { itinerary, destination, days } = body;

    const id = nanoid(6); 

    // Save to Redis
    await redis.set(`trip:${id}`, JSON.stringify({ itinerary, destination, days }), 'EX', 2592000);

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Share API Error:", error);
    return NextResponse.json({ error: 'Failed to save trip' }, { status: 500 });
  }
}