// src/register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "./register.css";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save extra data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      alert("Registration successful!");
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.message);
      alert("Registration failed. " + error.message);
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
          <h1 class="heading">Sign Up</h1>
          <form onSubmit={handleRegister}>
            <div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="input"
                placeholder="First Name"
              />
            </div>
            <div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="input"
                placeholder="Last Name..."
              />
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="Email..."
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
            <div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="input"
                placeholder="Phone No..."
              />
            </div>
            <button className="register-button" type="submit">
              Register
            </button>
            <p>
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                style={{ color: "blue", cursor: "pointer" }}
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
