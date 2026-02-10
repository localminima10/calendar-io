'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import EventTypeForm from '@/components/EventTypeForm';

export default function NewEventTypePage() {
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(data: any) {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase
        .from('event_types')
        .insert({
          user_id: user.id,
          title: data.title,
          slug: data.slug,
          description: data.description,
          duration: data.duration,
          active: data.active,
          color: data.color,
          location: data.location,
          buffer_time: data.buffer_time,
          min_notice: data.min_notice,
          max_bookings_per_day: data.max_bookings_per_day
        });

      if (insertError) throw insertError;

      router.push('/dashboard/event-types');
    } catch (err: any) {
      console.error('Error creating event type:', err);
      setError(err.message || 'Failed to create event type');
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Event Type</h1>
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800">
          {error}
        </div>
      )}
      <EventTypeForm onSubmit={handleSubmit} />
    </div>
  );
}