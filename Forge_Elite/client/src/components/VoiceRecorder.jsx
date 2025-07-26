import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function VoiceRecorder({ onTranscription }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
          const res = await axios.post('http://localhost:5000/api/whisper', formData);
          onTranscription(res.data.text);
        } catch (err) {
          console.error('Upload error:', err);
          if (err.response) {
            console.error('Server response:', err.response.data);
          } else if (err.request) {
            console.error('No response:', err.request);
          } else {
            console.error('Error setting up request:', err.message);
          }
          onTranscription('❌ Failed to transcribe audio.');
        }
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      onTranscription('❌ Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? '🛑 Stop Recording' : '🎙 Start Recording'}
      </button>
    </div>
  );
}