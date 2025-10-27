import React, { useState, useEffect, useContext } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaStar, FaHeart } from "react-icons/fa";
import { MdTimer, MdOutlineRestaurant, MdFastfood } from "react-icons/md";
import ContextFile from "../../context/context";

const FavouriteSection = () => {
  const [favourites, setFavourites] = useState([]);
  const { favouriteList } = useContext(ContextFile);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);

        // Real-time listener for favourites
        const unsubscribeSnapshot = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setFavourites(snap.data().favouriteList || []);
          } else {
            // Create document if missing
            setDoc(ref, { favouriteList: [] });
            setFavourites([]);
          }
        });

        // Cleanup snapshot listener on unmount
        return () => unsubscribeSnapshot();
      } else {
        setFavourites([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (favourites.length === 0) {
    return (
      <p style={{ textAlign: "center", margin: "20px 0" }}>
        No favourites yet. Add some!
      </p>
    );
  }

  const deleteFullFavouriteList = async () => {
    if (!user) return;
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { favouriteList: [] });
      setFavourites([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };
  return (
    <div style={{ padding: "20px", fontFamily: "poppins" }}>
      <h2 style={{ textAlign: "center" }}>Your Favourites ❤️</h2>
      <button onClick={deleteFullFavouriteList}>Delete all</button>
      <ul className="main-container">
        {favourites.map((each) => (
          <li
            onClick={() => navigate(`/restaurant-menu/${each.id}`)}
            key={each.id}
            className="restaurant-card"
          >
            <div style={{ overflow: "hidden" }}>
              <img
                src={`https://media-assets.swiggy.com/swiggy/image/upload/${each.imgUrl}`}
                alt={each.name}
                className="thumbnail"
              />
            </div>

            <div className="restaurant-info">
              <div className="res-flex1">
                <p className="restraurant-name">
                  {each.name.split(" ").slice(0, 2).join(" ")}
                </p>
                <div className="rating-container">
                  <p className="rating" style={{ color: "#97ff90ff" }}>
                    <FaStar
                      style={{ marginRight: "5px", color: "#11ff00ff" }}
                    />
                    {each.rating}
                  </p>
                </div>
              </div>

              <div className="res-flex">
                <p className="i" style={{ marginTop: "25px" }}>
                  {each.locality.split(" ").slice(0, 2).join(" ")}...
                </p>
                <p className="i" style={{ marginTop: "25px" }}>
                  {each.price}
                </p>
              </div>
              <div className="res-flex">
                <p className="i">{each.area}...</p>
                <p className="i">
                  <MdTimer /> {each.deliveryTime} min
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavouriteSection;
