import React, { useState } from 'react';
import ResumeAnalyzer from './ResumeAnalyzer';
import VoiceToGemini from './VoiceToGemini';

const Home = () => {
  const [transcript, setTranscript] = useState('');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🎯 Smart Interview Portal</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <ResumeAnalyzer />
      </section>

      <section>
        <h2>🎙 AI Interviewer</h2>
        {/* Uncomment below if you want to show raw transcript */}
        {/* <VoiceRecorder onTranscription={setTranscript} />
        <h3>Transcript:</h3>
        <p>{transcript}</p> */}
        <VoiceToGemini />
      </section>
    </div>
  );
};

export default Home;