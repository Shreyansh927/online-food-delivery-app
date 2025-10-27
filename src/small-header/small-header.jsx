import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import "./small-header.css";

const Header = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [classn, setClassn] = useState(true);
  const [showLogoutWarningMessage, setShowLogoutWarningMessage] =
    useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
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
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, [navigate]);

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
  return (
    <>
      <div className="nav-container">
        <div className="logo-container">
          <h1>Food</h1>
        </div>
        <div className="nav-content">
          <p className="item">Cart</p>
          <p className="item" onClick={() => navigate('/cart')}>Cart</p>
          <div className="first-name-container item2" onClick={toggleDetail}>
            <p className="item">
              {userDetails
                ? userDetails.firstName.split("")[0].toUpperCase()
                : "Loading..."}{" "}
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

      <hr />
      <div className={classn ? "hide-info-container" : "show-info-container"}>
        <button
          className="logout"
          onClick={toggleWarningMessage}
          style={{ marginBottom: "10px" }}
        >
          Log Out
        </button>
        <button className="logout" onClick={() => navigate("./more-info")}>
          More Info
        </button>
      </div>
    </>
  );
};

export default Header;
