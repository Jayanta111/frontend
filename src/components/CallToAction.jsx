import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CallToAction() {
  const [meetingInput, setMeetingInput] = useState("");
  const navigate = useNavigate();

  // Join Meeting using ID or full URL
  const handleJoinMeeting = () => {
    if (meetingInput.trim() !== "") {
      // Check if it's a full URL
      const url = meetingInput.startsWith("http://") || meetingInput.startsWith("https://")
        ? meetingInput
        : `/${meetingInput}`;
      window.location.href = url; // redirect to full URL or local route
    } else {
      alert("Please enter a meeting ID or link to join");
    }
  };

  // Host Meeting → redirect to a host page or generate meeting
  const handleHostMeeting = () => {
    // Example: redirect to /host page
    navigate("/host"); 
    // Or if you want to generate a random meeting ID:
    // const newMeetingId = Math.floor(100000 + Math.random() * 900000);
    // navigate(`/${newMeetingId}`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-6 mt-10">
      {/* Input Field for joining */}
      <input
        type="text"
        placeholder="Enter meeting link or ID"
        value={meetingInput}
        onChange={(e) => setMeetingInput(e.target.value)}
        className="w-64 h-10 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
      />

      {/* Join Meeting Button */}
      <button
        onClick={handleJoinMeeting}
        className="
          w-40
          h-10
          bg-blue-950
          text-white 
          font-semibold 
          text-lg 
          rounded-lg 
          shadow-lg 
          hover:bg-blue-700 
          hover:shadow-xl 
          transition-all 
          duration-300 
          ease-in-out
        "
      >
        Join Meeting
      </button>

      {/* Host Meeting Button */}
      <button
        onClick={handleHostMeeting}
        className="
          w-40
          h-10
          bg-green-600
          text-white 
          font-semibold 
          text-lg 
          rounded-lg 
          shadow-lg 
          hover:bg-green-500 
          hover:shadow-xl 
          transition-all 
          duration-300 
          ease-in-out
        "
      >
        Host Meeting
      </button>
    </div>
  );
}
