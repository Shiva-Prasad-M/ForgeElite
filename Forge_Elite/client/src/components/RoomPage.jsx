// src/pages/room/RoomPage.jsx

import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const RoomPage = () => {
  const { roomId } = useParams(); // from route: /room/:roomId
  const containerRef = useRef(null);

  const myMeeting = async () => {
    const appID = 380462879; // 🔑 Replace with your ZEGOCLOUD app ID
    const serverSecret = '8b2d89292f8e812d237efb0992b2606f'; // 🔐 Replace with your secret from ZEGOCLOUD dashboard

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      Date.now().toString(), // unique user ID
      'Interviewer' // display name
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
    });
  };

  useEffect(() => {
    myMeeting();
  }, []);

  
  return (
    <div>
      <h2>Video Interview Room: {roomId}</h2>
      <div ref={containerRef} style={{ width: '100%',padding:'50px 60px', height: '600px' }}></div>
    </div>
  );
};

export default RoomPage;