import React, { useEffect, useState, MouseEvent, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import "../styles/auth.css";
import "../styles/mobile_auth.css";
import { poolData } from "../config/poolData";
import { View } from "react-native";

const UserPool = new CognitoUserPool(poolData);

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

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
  }, []);

  const authenticate = async () => {
    let jwtToken;
    let userId;
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });
    const userData = {
      Username: username,
      Pool: UserPool,
    };
    const cognitoUser = new CognitoUser(userData);
    await new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          jwtToken = result.idToken.jwtToken;
          const jwtPayload = JSON.parse(atob(jwtToken.split(".")[1]));
          userId = jwtPayload.sub;
          resolve();
        },
        onFailure: function (err) {
          reject(err);
        },
      });
    });

    const queryParams = new URLSearchParams({ jwtToken, userId });
    localStorage.setItem("id", userId);
    localStorage.setItem("token", jwtToken);
    await fetch(
      `https://ld2bemqp44.execute-api.ap-southeast-2.amazonaws.com/mewsic_stage/user/getUser/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: jwtToken,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        } else {
          console.log(response);
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("userType", data.userType);
        console.log(data.userType);
      });
    console.log(jwtToken, userId);
    window.location.href = `/homepage?${queryParams.toString()}`;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "username") setUsername(value);
    if (id === "password") setPassword(value);
  };

  const handleInputFocus = (e: ChangeEvent<HTMLInputElement>) => {
    const { id } = e.target;
    const label = document.querySelector(`label[for=${id}]`);
    if (label) {
      label.classList.add("active");
    }
  };

  const handleInputBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const label = document.querySelector(`label[for=${id}]`);
    if (label && !value) {
      label.classList.remove("active");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  const login = async () => {
    if (username.length < 3) {
      setErrorMessage("Invalid email or username is less than 3 characters");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password should be longer than 8 characters");
      return;
    }

    await authenticate();
  };

  const handleLogoClick = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div>
          <span className="auth-header-subtext">Login to</span>
          <h1 className="auth-header header">Mewsic</h1>
        </div>
        <div className="input-container">
          <input
            className="form-inputs"
            placeholder=""
            type="text"
            id="username"
            value={username}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
          />
          <label htmlFor="email">Email / Username</label>
        </div>
        <div className="input-container password-container">
          <input
            className="form-inputs"
            placeholder=""
            type={passwordVisible ? "text" : "password"}
            id="password"
            value={password}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
          />
          <label htmlFor="password">Password</label>
          <img
            src={
              passwordVisible
                ? "https://cdn-icons-png.flaticon.com/128/2767/2767146.png"
                : "https://cdn-icons-png.flaticon.com/128/709/709612.png"
            }
            alt={passwordVisible ? "Hide password" : "Show password"}
            className="password-toggle"
            onClick={togglePasswordVisibility}
          />
        </div>
        <div className="error-message-container">
          {errorMessage && (
            <span className="error-message">{"*" + errorMessage}</span>
          )}
          <a className="forgot-password-anchor" href="/">
            Forgot Password?
          </a>
        </div>
        <button className="button1" type="submit" onClick={login}>
          Login
        </button>
        <p className="auth-text">────────── Or Continue With ──────────</p>
        <div className="alternate-auth-options">
          <img
            src="https://cdn-icons-png.flaticon.com/128/300/300221.png"
            alt="Google"
            className="company-button"
            data-text="Register with Google"
            onClick={() => handleLogoClick('https://www.google.com')}
          />
          <img
            src="https://cdn-icons-png.flaticon.com/128/731/731985.png"
            alt="Apple"
            className="company-button"
            data-text="Register with Apple"
            onClick={() => handleLogoClick('https://www.apple.com')}
          />
          <img
            src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png"
            alt="Facebook"
            className="company-button"
            data-text="Register with Facebook"
            onClick={() => handleLogoClick('https://www.facebook.com')}
          />
        </div>
        
        <span className="auth-text">
          Don't have an account?{" "}
          <a className="anchor1" href="/register">
            Register Now
          </a>
        </span>
      </div>
    </div>
  );
};

export default Login;
