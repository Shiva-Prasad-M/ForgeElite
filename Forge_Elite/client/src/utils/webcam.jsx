// Initializes the webcam and returns a Promise
export const initWebcam = (videoRef, setError) => {
    return new Promise((resolve, reject) => {
      if (videoRef.current) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            // Attach the webcam stream to the video element
            videoRef.current.srcObject = stream;
            resolve(); // Resolve the promise if webcam access is successful
          })
          .catch((err) => {
            console.error("Webcam access denied", err);
            setError("Unable to access the webcam. Please grant permissions.");
            reject(err); // Reject the promise if there is an error
          });
      } else {
        setError("Video reference is not available.");
        reject(new Error("Video reference is not available.")); // Reject if videoRef is not available
      }
    });
  };
  
  
  // Captures an image from the webcam and returns it as a data URL
  export const captureAndSendImage = (videoRef, canvasRef) => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or Canvas reference is missing.");
      return null;
    }
  
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 320, 240); // Adjust the dimensions here
    const image = canvasRef.current.toDataURL("image/jpeg", 1.0); // Capture image in JPEG format
    return image;
  };
  
  // Sends the captured image to the proctor server
  export const sendToProctorServer = async (image, userId, setError) => {
    if (!image || !userId) {
      console.error("Image or User ID is missing.");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5000/proctor/upload", {
        method: "POST",
        body: JSON.stringify({ image, userId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!res.ok) {
        throw new Error("Failed to send image to the proctoring server");
      }
  
      const data = await res.json();
  
      if (data.warning) {
        alert(data.warning); // If face is not detected
      } else {
        console.log(data.status); // You can handle the status as needed
      }
    } catch (err) {
      console.error("Error sending image to proctoring server", err);
      setError("An error occurred while sending the image to the proctoring server.");
    }
  };
  
  // Cleanup function to stop the webcam stream (optional but recommended)
  export const stopWebcamStream = (videoRef) => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop all tracks
      }
      videoRef.current.srcObject = null; // Detach the stream
    }
  };
  