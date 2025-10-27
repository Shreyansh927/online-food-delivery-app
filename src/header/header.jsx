import React, { useState, useEffect, useContext } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import ClipLoader from "react-spinners/ClipLoader";
import { FaCartArrowDown } from "react-icons/fa";

import { MdOutlineSearch } from "react-icons/md";
import SearchBar from "../search-bar/search-bar.jsx";
import ContextFile from "../../context/context";
import { toast } from "react-toastify";
import axios from "axios";
import { IoMdLocate } from "react-icons/io";

import "./header.css";

const Header = () => {
  const [userDetails, setUserDetails] = useState(null);

  const [classn, setClassn] = useState(true);
  const [showLogoutWarningMessage, setShowLogoutWarningMessage] =
    useState(false);
  const navigate = useNavigate();

  const { setCurrentLon, setCurrentLat, city, setCity, mainCity, setMainCity } =
    useContext(ContextFile);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {
        if (user) {
          console.log("User is logged in:", user);
          try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserDetails(docSnap.data());
            } else {
              toast.error("User data not found.");
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error("Error fetching user details.");
          }
        } else {
          console.log("No user is logged in");
          toast.error("No user is logged in");
          navigate("/login");
        }
      },
      [city]
    );

    // Cleanup on unmount
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("main-city", JSON.stringify(mainCity));
  }, [mainCity]);

  const logout = () => {
    auth.signOut();
    navigate("/login");
  };

  const toggleDetail = () => {
    setClassn((prev) => !prev);
  };

  const toggleWarningMessage = () => {
    setShowLogoutWarningMessage((prev) => !prev);
  };

  const hideLogoutWarningMessage = () => {
    setShowLogoutWarningMessage(false);
    setClassn(true);
  };

  const getLocationOnKeyDown = (e) => {
    if (e.key === "Enter") {
      navigateLocation2();
    }
  };

  const navigateLocation2 = async () => {
    const weatherApi = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=d8ff55d5ebb2aaf1901fb2153e39c50e`;
    try {
      const response = await axios.get(weatherApi);
      if (response.data.length > 0) {
        setCurrentLat(response.data[0].lat);
        setCurrentLon(response.data[0].lon);

        console.log(response.data[0].lat);
        setMainCity(city);
        localStorage.setItem("main-city", JSON.stringify(mainCity));
      } else {
        console.log("Location not found");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <>
      <div className="nav-container">
        <div className="logo-container">
          <h1 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            Food
          </h1>
        </div>

        <div className="location-section">
          <input
            placeholder={`${mainCity}...`}
            value={city}
            className="navigation-point"
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigateLocation2();
              }
            }}
            type="text"
          />
          <button className="navigate-button" onClick={navigateLocation2}>
            <IoMdLocate className="location-icon" />
          </button>
        </div>

        <div className="nav-content">
          <p className="item" onClick={() => navigate("/search")}>
            <MdOutlineSearch style={{ marginRight: "8px", fontSize: "20px" }} />
            <span style={{ fontSize: "20px" }}>Search</span>
          </p>
          <p className="item" onClick={() => navigate("/Cart")}>
            <FaCartArrowDown style={{ marginRight: "8px", fontSize: "20px" }} />
            <span style={{ fontSize: "20px" }}>Cart</span>
          </p>
          <p className="item" onClick={() => navigate("/favourite")}>
            <FaCartArrowDown style={{ marginRight: "8px", fontSize: "20px" }} />
            <span style={{ fontSize: "20px" }}>Favourites</span>
          </p>
          <p className="item" onClick={() => navigate("/history")}>
            <FaCartArrowDown style={{ marginRight: "8px", fontSize: "20px" }} />
            <span style={{ fontSize: "20px" }}>History</span>
          </p>
          <div className="first-name-container item2" onClick={toggleDetail}>
            <p className="item1" style={{ fontSize: "20px" }}>
              {userDetails ? (
                userDetails.firstName.split("")[0].toUpperCase()
              ) : (
                <ClipLoader color="#e85612" loading={true} size={25} />
              )}{" "}
            </p>
          </div>
        </div>
        <div
          className={
            showLogoutWarningMessage
              ? "visible-logout-warning-message"
              : "hidden-logout-warning-message"
          }
        >
          <h1 className="quit-message">Are you sure to Log Out ?</h1>
          <div className="button-container">
            <button onClick={logout} className="yesButton">
              Yes
            </button>
            <button onClick={hideLogoutWarningMessage} className="noButton">
              No
            </button>
          </div>
        </div>
      </div>

      <div className={classn ? "hide-info-container" : "show-info-container"}>
        <button
          className="logout"
          onClick={toggleWarningMessage}
          style={{ marginBottom: "10px" }}
        >
          Log Out
        </button>
        <button className="logout" onClick={() => navigate("./profile")}>
          More Info
        </button>
      </div>
    </>
  );
};

export default Header;
