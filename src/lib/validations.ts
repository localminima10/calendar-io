import { z } from 'zod'

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Username can only contain alphanumeric characters and hyphens'),
  full_name: z.string().max(100, 'Full name must be at most 100 characters').optional(),
  timezone: z.string(),
  locale: z.string(),
})

export const eventTypeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
  event_slug: z
    .string()
    .min(1, 'Event slug is required')
    .max(100, 'Event slug must be at most 100 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Event slug can only contain alphanumeric characters and hyphens'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  duration_minutes: z.number().int().positive('Duration must be a positive number'),
  location_type: z.enum(['google_meet', 'zoom', 'phone', 'in_person', 'custom']),
  location_value: z.string().optional(),
  is_active: z.boolean().default(true),
  color: z.string().optional(),
  buffer_before: z.number().int().nonnegative('Buffer before must be non-negative').default(0),
  buffer_after: z.number().int().nonnegative('Buffer after must be non-negative').default(0),
  min_notice_hours: z.number().int().positive('Minimum notice must be a positive number').default(1),
})

export const availabilityRuleSchema = z.object({
  day_of_week: z.number().int().min(0, 'Day of week must be between 0 and 6').max(6, 'Day of week must be between 0 and 6'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'),
})
