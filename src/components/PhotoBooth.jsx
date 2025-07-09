import React, { useState, useRef, useEffect } from 'react'

const PhotoBooth = () => {

  const [cameraStarted, setCameraStarted] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('none');
  const [capturedImages, setCapturedImages] = useState([]);
  const [countdown, setCountdown] = useState(null);

  const [error, setError] = useState('');
  const videoRef = useRef(null);

  const handleStart = async () => {

    setCameraStarted(true);

  };

  useEffect(() => {
    if (cameraStarted) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("✅ Video assigned after DOM rendered");
        }
      }).catch((err) => {
        console.error("Camera error:", err);
        setError("❌ Camera permission denied or unavailable.");
      });
    }
  }, [cameraStarted]);

  const handleAutoCapture = () => {
    const photos = [];
    let count = 0;

    const takePhoto = () => {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      // Apply filter while capturing
      ctx.filter = currentFilter;
      ctx.drawImage(videoRef.current, 0, 0);

      const imageUrl = canvas.toDataURL('image/png');
      photos.push(imageUrl);
      setCapturedImages([...photos]);
      count++;

      if (count < 4) {
        setTimeout(() => {
          takePhoto(); // Wait 10 seconds then take next
        }, 10000);
      }
    };

    // Initial 2-second delay for first photo
    setTimeout(() => {
      takePhoto();
    }, 2000);
  };

  const handleDownload = async () => {
    const stripCanvas = document.createElement('canvas');
    const width = 400;
    const height = 300 * capturedImages.length;

    stripCanvas.width = width;
    stripCanvas.height = height;

    const ctx = stripCanvas.getContext('2d');

    for (let i = 0; i < capturedImages.length; i++) {
      const img = new Image();
      img.src = capturedImages[i];
      await new Promise((res) => {
        img.onload = () => {
          ctx.drawImage(img, 0, i * 300, 400, 300);
          res();
        };
      });
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = stripCanvas.toDataURL('image/png');
    downloadLink.download = 'photo_strip.png';
    downloadLink.click();
  };




  return (

    <div className="photo-booth-wapper">
      <div className="main">
        {!cameraStarted ? (
          // landingpage
          <section className="landingpage">
            <div className="projectTitle">
              <h2>"Strike a Pose!"</h2>
            </div>
            <div className="quots">
              <h2>A photograph isn’t just an image—it’s
                a pause button on life.
                Click, hold, and relive.</h2>
            </div>
            <div >
              <button className='button' onClick={handleStart}>start</button>
            </div>
          </section>

        ) : (
          //camerapage
          <section className="camerapage">
            <div>
              <video ref={videoRef} autoPlay playsInline muted className="video-preview" style={{ filter: currentFilter }} />

            </div>
            <div className="instructions">
              <p>📌 Please keep steady when the camera starts.</p>
              <p>📸 Hold your pose for 2 seconds.</p>
              <p>🔄 Change your pose every 10 seconds.</p>
            </div>
            <div className="filter-buttons">
              <button onClick={() => setCurrentFilter('none')}>Normal</button>
              <button onClick={() => setCurrentFilter('grayscale(100%)')}>Black & White</button>
              <button onClick={() => setCurrentFilter('contrast(120%) saturate(150%)')}>Vivid</button>
              <button onClick={() => setCurrentFilter('sepia(100%)')}>Sepia</button>
            </div>
            <div>
              <button className="button" onClick={handleAutoCapture}>Capture</button>
            </div>
          </section>

        )}
      </div>
      {capturedImages.length > 0 && (
        <div className="photo-strip-container">
          <h2>Your Photo Strip 📷</h2>
          <div className="photo-strip">
            {capturedImages.map((img, idx) => (
              <img key={idx} src={img} alt={`Snap ${idx + 1}`} className="strip-photo" />
            ))}
          </div>
          {capturedImages.length === 4 && (
            <button className="buttons" onClick={handleDownload}>Proceed</button>
          )}
        </div>
      )}
    </div>


  )
}

export default PhotoBooth
