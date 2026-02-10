'use client';

import { useState, useEffect } from 'react';

interface TimezoneSelectorProps {
  onChange: (timezone: string) => void;
  defaultValue?: string;
}

export default function TimezoneSelector({ onChange, defaultValue }: TimezoneSelectorProps) {
  const [timezones, setTimezones] = useState<string[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState<string>('');

  useEffect(() => {
    try {
      const tzList = Intl.supportedValuesOf('timeZone');
      setTimezones(tzList);
      
      const browserTz = defaultValue || Intl.DateTimeFormat().resolvedOptions().timeZone;
      setSelectedTimezone(browserTz);
      onChange(browserTz);
    } catch (error) {
      const fallbackTz = defaultValue || 'UTC';
      setTimezones(['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']);
      setSelectedTimezone(fallbackTz);
      onChange(fallbackTz);
    }
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTz = e.target.value;
    setSelectedTimezone(newTz);
    onChange(newTz);
  };

  const formatTimezone = (tz: string) => {
    const now = new Date();
    try {
      const offset = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short'
      }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || '';
      
      return `${tz.replace('_', ' ')} (${offset})`;
    } catch {
      return tz.replace('_', ' ');
    }
  };

  return (
    <div className="relative">
      <select
        value={selectedTimezone}
        onChange={handleChange}
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
      >
        {timezones.map((tz) => (
          <option key={tz} value={tz}>
            {formatTimezone(tz)}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    </div>
  );
}