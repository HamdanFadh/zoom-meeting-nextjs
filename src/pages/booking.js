// pages/booking.js
import { useState } from 'react';

const groups = [
  'da    Husna', 'I02 - Aliyatul Husna', 'I03 - Fatiyyah Hamasah', 'I04 - Fatiyyah Hamasah',
  // Add other groups here...
];

const BookingForm = () => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(15);
  const [meetingDetails, setMeetingDetails] = useState(null); // To store meeting info
  const [statusMessage, setStatusMessage] = useState(''); // To store status (e.g. success, conflict)

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create the meeting data
    const meetingData = {
      topic: `test ${selectedGroup}`,
      start_time: `${startDate}T${startTime}:00+7`, // Ensure UTC time format
      duration,
    };

    try {
      const response = await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData),
      });

      const data = await response.json();

      if (data.success) {
        setMeetingDetails({
          topic: data.meeting.topic,
          start_time: data.meeting.start_time,
          duration: data.meeting.duration,
          join_url: data.meeting.join_url,
        });
        setStatusMessage('Meeting successfully booked!');
      } else {
        setMeetingDetails(null);
        setStatusMessage('Error booking the meeting! There might be a conflict.');
      }
    } catch (error) {
      console.error('Error during booking:', error);
      setMeetingDetails(null);
      setStatusMessage('Error occurred while booking the meeting.');
    }
  };

  return (
    <div>
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-10 w-auto" src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company"/>
        <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        </div>
        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form class="space-y-6" action="#" onSubmit={handleSubmit}>
                <div>
                    <label class="block text-sm/6 font-medium text-gray-900">Kelompok Mentoring</label>
                    <div class="mt-2">
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                        <option value="">Select a group</option>
                        {groups.map((group) => (
                        <option key={group} value={group}>
                            {group}
                        </option>
                        ))}
                    </select>
                    </div>
                </div>

                <div>
                <label>Tanggal Mentoring</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // Minimum date is tomorrow
                />
                </div>

                <div>
                <label>Waktu Mentoring (WIB)</label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
                </div>

                <div>
                <label>Durasi (Menit)</label>
                <input
                    type="number"
                    min="15"
                    max="240"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                />
                </div>

                <button type="submit" class="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white opacity-100 focus:outline-none">Book Meeting</button>
            </form>

            {statusMessage && (
                <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
                <p>{statusMessage}</p>
                </div>
            )}

            {meetingDetails && (
                <div style={{ marginTop: '20px' }}>
                <h3>Meeting Details:</h3>
                <p><strong>Topic:</strong> {meetingDetails.topic}</p>
                <p><strong>Start Time:</strong> {new Date(meetingDetails.start_time).toLocaleString()}</p>
                <p><strong>Duration:</strong> {meetingDetails.duration} minutes</p>
                <p><strong>Join URL:</strong> <a href={meetingDetails.join_url} target="_blank" rel="noopener noreferrer">Join Meeting</a></p>
                </div>
            )}
        </div>
    </div>
  );
};

export default BookingForm;
