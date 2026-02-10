'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import EventTypeForm from '@/components/EventTypeForm';

export default function EditEventTypePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventType, setEventType] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    loadEventType();
  }, [id]);

  async function loadEventType() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('event_types')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Event type not found');

      setEventType(data);
    } catch (err: any) {
      console.error('Error loading event type:', err);
      setError(err.message || 'Failed to load event type');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: any) {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('event_types')
        .update({
          title: data.title,
          slug: data.slug,
          description: data.description,
          duration: data.duration,
          active: data.active,
          color: data.color,
          location: data.location,
          buffer_time: data.buffer_time,
          min_notice: data.min_notice,
          max_bookings_per_day: data.max_bookings_per_day,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      router.push('/dashboard/event-types');
    } catch (err: any) {
      console.error('Error updating event type:', err);
      setError(err.message || 'Failed to update event type');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !eventType) {
    return (
      <div className="max-w-3xl">
        <div className="p-4 rounded-md bg-red-50 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Event Type</h1>
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800">
          {error}
        </div>
      )}
      <EventTypeForm onSubmit={handleSubmit} initialData={eventType} />
    </div>
  );
}