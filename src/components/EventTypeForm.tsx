'use client';

import { useState, useEffect } from 'react';

interface EventTypeFormData {
  title: string;
  event_slug: string;
  description: string;
  duration_minutes: number;
  location_type: string;
  location_value: string;
  is_active: boolean;
  color: string;
  buffer_before: number;
  buffer_after: number;
  min_notice_hours: number;
}

interface EventTypeFormProps {
  initialData?: Partial<EventTypeFormData>;
  onSubmit: (data: EventTypeFormData) => Promise<void>;
  isLoading: boolean;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const LOCATION_TYPES = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'in_person', label: 'In Person' },
  { value: 'custom', label: 'Custom' },
];

const PRESET_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#6366F1', '#14B8A6', '#84CC16',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EventTypeForm({ initialData, onSubmit, isLoading }: EventTypeFormProps) {
  const [formData, setFormData] = useState<EventTypeFormData>({
    title: initialData?.title || '',
    event_slug: initialData?.event_slug || '',
    description: initialData?.description || '',
    duration_minutes: initialData?.duration_minutes || 30,
    location_type: initialData?.location_type || 'zoom',
    location_value: initialData?.location_value || '',
    is_active: initialData?.is_active ?? true,
    color: initialData?.color || '#3B82F6',
    buffer_before: initialData?.buffer_before || 0,
    buffer_after: initialData?.buffer_after || 0,
    min_notice_hours: initialData?.min_notice_hours || 0,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.event_slug);

  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      setFormData(prev => ({ ...prev, event_slug: slugify(formData.title) }));
    }
  }, [formData.title, slugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: keyof EventTypeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 30 Minute Meeting"
        />
      </div>

      <div>
        <label htmlFor="event_slug" className="block text-sm font-medium text-gray-700 mb-2">
          Event URL Slug *
        </label>
        <div className="flex items-center">
          <span className="text-gray-500 text-sm mr-2">calendar.io/username/</span>
          <input
            type="text"
            id="event_slug"
            value={formData.event_slug}
            onChange={(e) => {
              setSlugManuallyEdited(true);
              handleChange('event_slug', slugify(e.target.value));
            }}
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="30min"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe what this meeting is about..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration *
          </label>
          <select
            id="duration"
            value={formData.duration_minutes}
            onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DURATION_OPTIONS.map(duration => (
              <option key={duration} value={duration}>{duration} minutes</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location_type" className="block text-sm font-medium text-gray-700 mb-2">
            Location Type *
          </label>
          <select
            id="location_type"
            value={formData.location_type}
            onChange={(e) => handleChange('location_type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LOCATION_TYPES.map(loc => (
              <option key={loc.value} value={loc.value}>{loc.label}</option>
            ))}
          </select>
        </div>
      </div>

      {formData.location_type === 'custom' && (
        <div>
          <label htmlFor="location_value" className="block text-sm font-medium text-gray-700 mb-2">
            Location Details
          </label>
          <input
            type="text"
            id="location_value"
            value={formData.location_value}
            onChange={(e) => handleChange('location_value', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter location details..."
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="buffer_before" className="block text-sm font-medium text-gray-700 mb-2">
            Buffer Before (min)
          </label>
          <input
            type="number"
            id="buffer_before"
            value={formData.buffer_before}
            onChange={(e) => handleChange('buffer_before', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="buffer_after" className="block text-sm font-medium text-gray-700 mb-2">
            Buffer After (min)
          </label>
          <input
            type="number"
            id="buffer_after"
            value={formData.buffer_after}
            onChange={(e) => handleChange('buffer_after', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="min_notice" className="block text-sm font-medium text-gray-700 mb-2">
            Min Notice (hours)
          </label>
          <input
            type="number"
            id="min_notice"
            value={formData.min_notice_hours}
            onChange={(e) => handleChange('min_notice_hours', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Color</label>
        <div className="flex items-center space-x-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => handleChange('color', color)}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Active (available for booking)
        </label>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Event Type'}
        </button>
      </div>
    </form>
  );
}