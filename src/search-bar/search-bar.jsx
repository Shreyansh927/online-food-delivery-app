import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../header/header.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import "./search-bar.css";

import ContextFile from "../../context/context.jsx";

const SearchBar = () => {
  const [restaurantValue, setRestaurantValue] = useState("");
  const [restrauContainer, setRestrauContainer] = useState([]);

  const [displaySearchHistory, setDisplaySearchHistory] = useState(true);
  const [displaySearchSuggestions, setDisplaySearchSuggestion] =
    useState(false);

  const { currentLat, currentLon, searchHistory, setSearchHistory } =
    useContext(ContextFile);

  const navigate = useNavigate();

  const user = auth.currentUser; // get logged-in user

  //  Fetch search history from Firestore
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          setSearchHistory(docSnap.data().searchHistory || []);
        }
      }
    };
    fetchHistory();
  }, [user]);

  //  Debounced API call on search input
  useEffect(() => {
    if (restaurantValue.trim().length > 2) {
      const delayDebounce = setTimeout(() => {
        getRestrauInfo();
      }, 500); // debounce by 500ms
      return () => clearTimeout(delayDebounce);
    }

    if (restaurantValue === "") {
      setDisplaySearchHistory(true);
      setDisplaySearchSuggestion(false);
    } else {
      setDisplaySearchHistory(false);
      setDisplaySearchSuggestion(true);
    }
  }, [restaurantValue]);

  //  Save searched item in Firebase
  const addSearchedItem = async (item) => {
    if (!item) return;
    if (!user) {
      toast.error("Please login to save your search history");
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        { searchHistory: arrayUnion(item) }, // arrayUnion prevents duplicates
        { merge: true }
      );

      setSearchHistory((prev) => [
        item,
        ...prev.filter((i) => i.suggestion !== item.suggestion),
      ]);
      window.alert("added to firebase");
    } catch (error) {
      console.error("Error saving search:", error);
      toast.error("Could not save search history");
    }
  };

  // Delete single item
  const deleteItem = async (item) => {
    if (!user) return;
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { searchHistory: arrayRemove(item) });
      setSearchHistory((prev) =>
        prev.filter((i) => i.suggestion !== item.suggestion)
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Delete all history
  const deleteFullSearchHistory = async () => {
    if (!user) return;
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { searchHistory: [] });
      setSearchHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const searchItem = (each) => {
    searchSelectedItem(each.suggestion);
    setDisplaySearchHistory(false);
    setDisplaySearchSuggestion(true);
  };

  //  API call for selected search
  const searchSelectedItem = async (query) => {
    try {
      const api = `https://corsproxy.io/https://www.swiggy.com/dapi/restaurants/search/suggest?lat=${currentLat}&lng=${currentLon}&str=${query}&trackingId=621aa4df-5300-1ee3-af28-649afd6ac1ce&includeIMItem=true`;
      const response = await axios.get(api);

      const suggestions = response?.data?.data?.suggestions || [];
      const formattedSuggestion = suggestions.map((s) => ({
        suggestion: s.text,
        thumbNailId: s.cloudinaryId,
        restaurantId: s.restaurantId,
        restaurantSlug: s.slug,
        restaurantName: s.restaurantName,
        restaurantCity: s.city,
        type: s.type,
      }));
      setRestrauContainer(formattedSuggestion);
    } catch (error) {
      console.error("API fetch error:", error);
      toast.error("Error fetching restaurant data");
    }
  };

  //  API call for live search
const getRestrauInfo = async () => {
  try {
    const api = `https://corsproxy.io/https://www.swiggy.com/dapi/restaurants/search/suggest?lat=${currentLat}&lng=${currentLon}&str=${restaurantValue}&trackingId=621aa4df-5300-1ee3-af28-649afd6ac1ce&includeIMItem=true`;

    const response = await axios.get(api);

    const suggestions = response?.data?.data?.suggestions || [];

    const formattedSuggestion = suggestions.map((s) => ({
      suggestion: s.text,
      thumbNailId: s.cloudinaryId,
      restaurantId: s.restaurantId,
      type: s.type,
      tag: s.tagToDisplay,
      deepLink: s.cta?.link || "", // can be useful
    }));

    setRestrauContainer(formattedSuggestion);
  } catch (error) {
    console.error("API fetch error:", error);
    toast.error("Error fetching restaurant data");
  }
};


  return (
    <>
      <Header />
      <div className="hr-container" style={{ marginTop: "40px" }}>
        <hr className="hr1" />
        <input
          type="search"
          value={restaurantValue}
          onChange={(e) => setRestaurantValue(e.target.value)}
          className="navigation-search-bar"
          placeholder="🔍   Search any food, dish or restaurant..."
        />
        <hr className="hr2" />
      </div>

      {/* Suggestions */}
      <div className="main" style={{ textAlign: "center" }}>
        {displaySearchSuggestions && (
          <ul className="result-container">
            {restrauContainer.map((item, index) => (
              <li
                onClick={() => {
                  addSearchedItem(item);
                  navigate(`/restaurant-menu/${item.restaurantId}`);
                }}
                key={index}
                className="suggestions-container"
                style={{ cursor: "pointer" }}
              >
                {item.thumbNailId && (
                  <img
                    src={`https://media-assets.swiggy.com/swiggy/image/upload/${item.thumbNailId}`}
                    className="thumbnail-image"
                    alt="thumbnail"
                  />
                )}
                <div className="searched-item-info">
                  <p className="suggested-dish">{item.suggestion}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search History */}
      {displaySearchHistory && (
        <div className="search-history-main-container">
          {searchHistory.length > 0 ? (
            <>
              <div className="delete-all-section">
                <h1>Recent Searches</h1>
                <button onClick={deleteFullSearchHistory}>Delete All</button>
              </div>
              <ul className="ss">
                {searchHistory.map((each, index) => (
                  <li className="search-history" key={index}>
                    <p onClick={() => searchItem(each)} className="search">
                      {each.suggestion}
                    </p>
                    <p className="delete-icon" onClick={() => deleteItem(each)}>
                      ✖
                    </p>
                    <hr className="hr" />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="empty-image-container">
              <img
                src="https://assets.ccbp.in/frontend/react-js/nxt-watch-no-saved-videos-img.png"
                alt="empty-list"
                className="empty-list-image"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SearchBar;
