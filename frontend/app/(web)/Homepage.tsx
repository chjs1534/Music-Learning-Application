import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import "../styles/website.css";

const Homepage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode === "enabled") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    } else {
      setIsDarkMode(false);
      document.body.classList.remove("dark-mode");
    }
    setToken(localStorage.getItem("token"));
    setUserId(localStorage.getItem("id"));
  }, []);

  const fetchTTS = async (text: string) => {
    try {
      const response = await axios.get(
        `https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/tts?text=${encodeURIComponent(
          text
        )}`,
        {
          responseType: "arraybuffer",
        }
      );
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(response.data);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error("Error fetching TTS:", error);
    }
  };

  const clickMe = () => {
    console.log("authToken:", token);
    console.log("userId:", userId);
    fetchTTS(token);
  };

  return (
    <div className="homepage">
      <NavBar />
      <div className="dashboard">
        <span className="header die">Mewsic!</span>

        <div className="welcome-section">
          Your ultimate destination for mastering
          <br /> musical instruments and music theory.
        </div>
        <div className="content-section">
          <div className="text-box">
            <h2>Discover New Lessons</h2>
            <p>
              Explore a variety of lessons and tutorials tailored to help you
              improve your musical skills.
            </p>
          </div>
          <div className="quote-box">
            <h2>Quote of the Day</h2>
            <p>
              "Music is the universal language of mankind." - Henry Wadsworth
              Longfellow
            </p>
          </div>
        </div>
        <button className="title-pill" onClick={clickMe}>
          click me!
        </button>
      </div>
      <div className="footer-section">
        <p>© 2024 Mewsic. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Homepage;
