-- Calendar.io Phase 1 Initial Schema Migration
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'en' NOT NULL,
  timezone TEXT DEFAULT 'UTC' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_username ON profiles(username);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- 2. event_types table
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_slug TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  location_type TEXT,
  location_value TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  color TEXT,
  buffer_before INTEGER DEFAULT 0 NOT NULL CHECK (buffer_before >= 0),
  buffer_after INTEGER DEFAULT 0 NOT NULL CHECK (buffer_after >= 0),
  min_notice_hours INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(profile_id, event_slug)
);

CREATE INDEX idx_event_types_profile_id ON event_types(profile_id);
CREATE INDEX idx_event_types_profile_id_event_slug ON event_types(profile_id, event_slug);

ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own event types" ON event_types
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Public can view active event types" ON event_types
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can insert their own event types" ON event_types
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own event types" ON event_types
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own event types" ON event_types
  FOR DELETE USING (auth.uid() = profile_id);

-- 3. availability_rules table
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_availability_rules_event_type_id ON availability_rules(event_type_id);

ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own availability rules" ON availability_rules
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM event_types WHERE event_types.id = availability_rules.event_type_id AND event_types.profile_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own availability rules" ON availability_rules
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM event_types WHERE event_types.id = availability_rules.event_type_id AND event_types.profile_id = auth.uid()
  ));

CREATE POLICY "Users can update their own availability rules" ON availability_rules
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM event_types WHERE event_types.id = availability_rules.event_type_id AND event_types.profile_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own availability rules" ON availability_rules
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM event_types WHERE event_types.id = availability_rules.event_type_id AND event_types.profile_id = auth.uid()
  ));

-- 4. calendar_connections table
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  email TEXT,
  display_name TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar connections" ON calendar_connections
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own calendar connections" ON calendar_connections
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own calendar connections" ON calendar_connections
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own calendar connections" ON calendar_connections
  FOR DELETE USING (auth.uid() = profile_id);

-- 5. calendars table
CREATE TABLE calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
  provider_calendar_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendars" ON calendars
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM calendar_connections WHERE calendar_connections.id = calendars.connection_id AND calendar_connections.profile_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own calendars" ON calendars
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM calendar_connections WHERE calendar_connections.id = calendars.connection_id AND calendar_connections.profile_id = auth.uid()
  ));

CREATE POLICY "Users can update their own calendars" ON calendars
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM calendar_connections WHERE calendar_connections.id = calendars.connection_id AND calendar_connections.profile_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own calendars" ON calendars
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM calendar_connections WHERE calendar_connections.id = calendars.connection_id AND calendar_connections.profile_id = auth.uid()
  ));

-- 6. selected_calendars table
CREATE TABLE selected_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE selected_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own selected calendars" ON selected_calendars
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own selected calendars" ON selected_calendars
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own selected calendars" ON selected_calendars
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own selected calendars" ON selected_calendars
  FOR DELETE USING (auth.uid() = profile_id);

-- 7. destination_calendars table
CREATE TABLE destination_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type_id UUID REFERENCES event_types(id) ON DELETE SET NULL,
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE destination_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own destination calendars" ON destination_calendars
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own destination calendars" ON destination_calendars
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own destination calendars" ON destination_calendars
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own destination calendars" ON destination_calendars
  FOR DELETE USING (auth.uid() = profile_id);

-- 8. bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guest_email TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_timezone TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' NOT NULL,
  public_uid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  location TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bookings_event_type_id ON bookings(event_type_id);
CREATE INDEX idx_bookings_host_id ON bookings(host_id);
CREATE INDEX idx_bookings_public_uid ON bookings(public_uid);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Public can insert bookings" ON bookings
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Users can delete their own bookings" ON bookings
  FOR DELETE USING (auth.uid() = host_id);

-- 9. booking_additional_guests table
CREATE TABLE booking_additional_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE booking_additional_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view additional guests for their bookings" ON booking_additional_guests
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = booking_additional_guests.booking_id AND bookings.host_id = auth.uid()
  ));

CREATE POLICY "Public can insert additional guests" ON booking_additional_guests
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update additional guests for their bookings" ON booking_additional_guests
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = booking_additional_guests.booking_id AND bookings.host_id = auth.uid()
  ));

CREATE POLICY "Users can delete additional guests for their bookings" ON booking_additional_guests
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = booking_additional_guests.booking_id AND bookings.host_id = auth.uid()
  ));

-- 10. booking_references table
CREATE TABLE booking_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  provider_event_id TEXT NOT NULL,
  provider_event_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE booking_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view references for their bookings" ON booking_references
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = booking_references.booking_id AND bookings.host_id = auth.uid()
  ));

CREATE POLICY "Users can insert references for their bookings" ON booking_references
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = booking_references.booking_id AND bookings.host_id = auth.uid()
  ));

CREATE POLICY "Users can update references for their bookings" ON booking_references
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = booking_references.booking_id AND bookings.host_id = auth.uid()
  ));

CREATE POLICY "Users can delete references for their bookings" ON booking_references
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = booking_references.booking_id AND bookings.host_id = auth.uid()
  ));

-- 11. webhook_subscriptions table
CREATE TABLE webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  event_types TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own webhook subscriptions" ON webhook_subscriptions
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own webhook subscriptions" ON webhook_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own webhook subscriptions" ON webhook_subscriptions
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own webhook subscriptions" ON webhook_subscriptions
  FOR DELETE USING (auth.uid() = profile_id);

-- 12. sync_cursors table
CREATE TABLE sync_cursors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
  cursor_value TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE sync_cursors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync cursors" ON sync_cursors
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM calendar_connections WHERE calendar_connections.id = sync_cursors.connection_id AND calendar_connections.profile_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own sync cursors" ON sync_cursors
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM calendar_connections WHERE calendar_connections.id = sync_cursors.connection_id AND calendar_connections.profile_id = auth.uid()
  ));

CREATE POLICY "Users can update their own sync cursors" ON sync_cursors
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM calendar_connections WHERE calendar_connections.id = sync_cursors.connection_id AND calendar_connections.profile_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own sync cursors" ON sync_cursors
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM calendar_connections WHERE calendar_connections.id = sync_cursors.connection_id AND calendar_connections.profile_id = auth.uid()
  ));

-- 13. notification_logs table
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notification logs for their bookings" ON notification_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = notification_logs.booking_id AND bookings.host_id = auth.uid()
  ));

CREATE POLICY "Users can insert notification logs for their bookings" ON notification_logs
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = notification_logs.booking_id AND bookings.host_id = auth.uid()
  ));

CREATE POLICY "Users can update notification logs for their bookings" ON notification_logs
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = notification_logs.booking_id AND bookings.host_id = auth.uid()
  ));

CREATE POLICY "Users can delete notification logs for their bookings" ON notification_logs
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM bookings WHERE bookings.id = notification_logs.booking_id AND bookings.host_id = auth.uid()
  ));

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON event_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_connections_updated_at BEFORE UPDATE ON calendar_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_subscriptions_updated_at BEFORE UPDATE ON webhook_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_cursors_updated_at BEFORE UPDATE ON sync_cursors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();