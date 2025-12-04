import Link from 'next/link';
import { Map, Calendar } from 'lucide-react';
import { withRedis } from '@/app/lib/redis';
import ItineraryDisplay from '../../components/ItineraryDisplay'; 

export default async function TripPage({ params }) {
  // Await params (Fix for Next.js 15)
  const { id } = await params; 
  
  // Validate ID format (nanoid is 6 chars, alphanumeric)
  if (!id || !/^[A-Za-z0-9_-]{6}$/.test(id)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-slate-200">400</h1>
          <p className="text-xl">Invalid trip ID format.</p>
          <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }
  
  // Fetch from Redis with proper connection handling
  let data = null;
  try {
    data = await withRedis(async (redis) => {
      return await redis.get(`trip:${id}`);
    });
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-slate-200">500</h1>
          <p className="text-xl">Failed to load trip. Please try again.</p>
          <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-slate-200">404</h1>
          <p className="text-xl">Trip not found or expired.</p>
          <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const trip = JSON.parse(data);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-200 mb-8">
          <div className="p-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Map className="mr-2" /> 
                Trip to {trip.destination}
              </h1>
              <p className="opacity-80 mt-1 flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4" /> 
                {trip.days}-Day Itinerary
              </p>
            </div>
            <div className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Shared via TravelDebate
            </div>
          </div>
        </div>
        
        {/* Visual Itinerary Component */}
        <ItineraryDisplay markdown={trip.itinerary} />

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
            Plan your own trip at TravelDebate.ai
          </Link>
        </div>

      </div>
    </div>
  );
}