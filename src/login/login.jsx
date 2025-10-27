import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);

      toast.success("Login successful!");
      navigate("/"); // Redirect to home or another page
      // Redirect to home or another page
    } catch (error) {
      console.log("Login error:", error.message);
      toast.error("Login Failed:", error.message);
    }
  };
  return (
    <>
      <div className="register-container">
        <div>
          <img
            src="https://images.squarespace-cdn.com/content/v1/54a43027e4b0e8454930051c/1544213616126-XGR35ABBUG5IUG883TZ3/JEDI-Beginnings1.gif"
            alt="singup-image"
            className="signup-image"
          />
        </div>
        <div className="form-container">
          <h1 className="heading">Login</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="Email"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="Password..."
              />
            </div>

            <button className="register-button" type="submit">
              Login
            </button>
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                style={{ color: "blue", cursor: "pointer" }}
              >
                Sign Up
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
