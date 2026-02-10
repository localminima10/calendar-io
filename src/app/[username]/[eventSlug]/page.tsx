import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import TimezoneSelector from '@/components/TimezoneSelector';

interface PageProps {
  params: {
    username: string;
    eventSlug: string;
  };
}

export default async function PublicBookingPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('username', params.username)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">This user does not exist.</p>
        </div>
      </div>
    );
  }

  const { data: eventType } = await supabase
    .from('event_types')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('event_slug', params.eventSlug)
    .single();

  if (!eventType || !eventType.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Unavailable</h1>
          <p className="text-gray-600">This event type is not currently available for booking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-5 gap-0">
            <div className="md:col-span-2 p-8 md:p-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-r border-gray-200">
              <div className="flex items-center space-x-4 mb-8">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Host'}
                    width={64}
                    height={64}
                    className="rounded-full ring-4 ring-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-white shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {(profile.full_name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{profile.full_name}</h2>
                  <p className="text-sm text-gray-600">@{params.username}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventType.title}</h1>
                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{eventType.duration_minutes} minutes</span>
                  </div>
                </div>

                {eventType.description && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{eventType.description}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600 capitalize">{eventType.location_type.replace('_', ' ')}</p>
                      {eventType.location_value && (
                        <p className="text-sm text-gray-500 mt-1">{eventType.location_value}</p>
                      )}
                    </div>
                  </div>

                  {(eventType.buffer_before > 0 || eventType.buffer_after > 0) && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Buffer Time</p>
                        {eventType.buffer_before > 0 && (
                          <p className="text-sm text-gray-600">{eventType.buffer_before} min before</p>
                        )}
                        {eventType.buffer_after > 0 && (
                          <p className="text-sm text-gray-600">{eventType.buffer_after} min after</p>
                        )}
                      </div>
                    </div>
                  )}

                  {eventType.min_notice_hours > 0 && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Minimum Notice</p>
                        <p className="text-sm text-gray-600">{eventType.min_notice_hours} hours</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-3 p-8 md:p-12">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Timezone</label>
                <TimezoneSelector onChange={(tz) => console.log('Timezone changed:', tz)} />
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar & Time Slots</h3>
                <p className="text-gray-600">Time slot selection will be available in Phase 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}