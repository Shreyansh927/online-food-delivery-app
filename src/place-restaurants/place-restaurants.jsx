import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./place-restaurants.css";
import { FaStar, FaHeart } from "react-icons/fa";
import { MdTimer, MdOutlineRestaurant, MdFastfood } from "react-icons/md";
import { toast } from "react-toastify";
import ContextFile from "../../context/context";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const PlaceRestaurants = () => {
  const [restaurantList, setRestaurantList] = useState([]);
  const [restaurantListCopy, setRestaurantListCopy] = useState([]);
  const [dishesList, setDishesList] = useState([]);
  const [bestFoodPlaces, setBestFoodPlaces] = useState([]);
  const [pureVegMode, setPureVegMode] = useState(false);
  const [fastestDeliveryModeOn, setFastestDeliveryModeOn] = useState(false);
  const [lowToHigh, setLowToHigh] = useState("high to low");
  const [topRating, setTopRating] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const {
    currentLat,
    currentLon,
    mainCity,
    setCurrentLat,
    setCurrentLon,
    favouriteList,
    setFavouriteList,
  } = useContext(ContextFile);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchFavouriteList(u.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getAllRestaurantsList();
    navigateLocation();
    setPureVegMode(false);
    setFastestDeliveryModeOn(false);
    setTopRating(false);
  }, [currentLat, currentLon]);

  const fetchFavouriteList = async (uid) => {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    const docRef = await getDoc(ref);
    if (docRef.exists()) setFavouriteList(docRef.data().favouriteList || []);
    else await setDoc(ref, { favouriteList: [] });
  };

  const getAllRestaurantsList = async () => {
    try {
      const restaurantsApi = `https://corsproxy.io/https://www.swiggy.com/dapi/restaurants/list/v5?lat=${currentLat}&lng=${currentLon}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`;
      const response = await axios.get(restaurantsApi);

      const formattedRestaurants =
        response.data?.data?.cards[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants?.map(
          (each) => ({
            name: each.info.name || "",
            id: each.info.id || "",
            imgUrl: each.info.cloudinaryImageId || "",
            rating: parseFloat(each.info.avgRating) || 0,
            deliveryTime: each.info.sla?.deliveryTime || 0,
            area: each.info.areaName || "",
            veg: each.info.veg || false,
            price: each.info.costForTwo || "",
            intPrice:
              parseInt(
                each.info.costForTwo?.split("₹")[1]?.split(" ")[0] || 0
              ) / 2,
            locality: each.info.locality || "",
          })
        ) || [];

      const formattedDishesList =
        response.data.data.cards[0].card.card.imageGridCards.info.map(
          (eachDish) => ({
            dishName: eachDish.action.text || "",
            dishId: eachDish.id || "",
            imgId: eachDish.imageId || "",
            collectionId: eachDish.action.link
              ?.split("collection_id=")[1]
              ?.split("&")[0],
          })
        );

      const formattedBestFoodPlaces =
        response.data.data.cards[7].card.card.brands.map((each) => ({
          text: each.text || "",
        }));

      setRestaurantList(formattedRestaurants);
      setRestaurantListCopy(formattedRestaurants);
      setDishesList(formattedDishesList);
      setBestFoodPlaces(formattedBestFoodPlaces);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    }
  };

  const navigateLocation = async () => {
    if (!mainCity) return;
    try {
      const weatherApi = `https://api.openweathermap.org/geo/1.0/direct?q=${mainCity}&limit=1&appid=d8ff55d5ebb2aaf1901fb2153e39c50e`;
      const response = await axios.get(weatherApi);
      if (response.data.length > 0) {
        const lat = response.data[0].lat;
        const lon = response.data[0].lon;
        setCurrentLat(lat);
        setCurrentLon(lon);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const addToFavourite = async (item) => {
    if (!user) {
      toast.error("Please login to save favourites");
      return;
    }

    const ref = doc(db, "users", user.uid);

    try {
      const docSnap = await getDoc(ref);
      const currentFav = docSnap.exists()
        ? docSnap.data().favouriteList || []
        : [];

      // Check if already exists
      const exists = currentFav.some((fav) => fav.id === item.id);

      if (!exists) {
        // Add full object to Firestore
        await updateDoc(ref, { favouriteList: arrayUnion(item) });
        setFavouriteList((prev) => [item, ...prev]);
        toast.success(`${item.name} added to favourites`);
      } else {
        // Remove by id
        await updateDoc(ref, { favouriteList: arrayRemove(item) });
        setFavouriteList((prev) => prev.filter((f) => f.id !== item.id));
        toast.info(`${item.name} removed from favourites`);
      }
    } catch (err) {
      console.error("Error updating favourites:", err);
      toast.error("Failed to update favourites");
    }
  };

  const popMessage = (e) => {
    toast.info(`${e.target.innerText} Under Construction...`);
  };

const applyFilters = ({
  topRating: topRatingParam = topRating,
  pureVegMode: pureVegParam = pureVegMode,
  fastestDeliveryModeOn: fastestParam = fastestDeliveryModeOn,
  lowToHigh: lowToHighParam = lowToHigh,
}) => {
  let filtered = [...restaurantListCopy];
  if (pureVegParam) filtered = filtered.filter((r) => r.veg);
  if (topRatingParam) filtered = filtered.filter((r) => r.rating >= 4);
  if (fastestParam)
    filtered = filtered.sort((a, b) => a.deliveryTime - b.deliveryTime);
  if (lowToHighParam === "low to high")
    filtered = filtered.sort((a, b) => a.intPrice - b.intPrice);
  else filtered = filtered.sort((a, b) => b.intPrice - a.intPrice);
  setRestaurantList(filtered);
};


  // Filters
  const ratingFilter = () => {
    setTopRating((prev) => !prev);
    applyFilters({ topRating: !topRating });
  };

  const vegMode = () => {
    setPureVegMode((prev) => !prev);
    applyFilters({ pureVegMode: !pureVegMode });
  };

  const fastestDeliveryMode = () => {
    setFastestDeliveryModeOn((prev) => !prev);
    applyFilters({ fastestDeliveryModeOn: !fastestDeliveryModeOn });
  };

  const revert = (e) => {
    const value = e.target.value;
    setLowToHigh(value);
    applyFilters({ lowToHigh: value });
  };

  return (
    <div className="place-restaurant-container">
      {restaurantList.length === 0 ? (
        <div className="animtion-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="a"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="head-container">
            <h1 style={{ marginBottom: "20px" }} className="restra-heading">
              Top dishes in <span className="city-name">{mainCity}</span>
            </h1>
            <div className="filters-container">
              <ul className="filters-inner-container">
                <li
                  className={pureVegMode ? "active-filters" : "filters"}
                  onClick={vegMode}
                >
                  Pure Veg
                </li>
                <li
                  className={
                    fastestDeliveryModeOn ? "active-filters" : "filters"
                  }
                  onClick={fastestDeliveryMode}
                >
                  Fastest Delivery
                </li>
                <li
                  className={topRating ? "active-filters" : "filters"}
                  onClick={ratingFilter}
                >
                  Rating 4.0+
                </li>

                <select value={lowToHigh} onChange={revert} className="filters">
                  <option value="high to low">High to low</option>
                  <option value="low to high">Low to high</option>
                </select>
              </ul>
            </div>
          </div>

          <div className="dishes-main-container">
            <ul className="dishes-min-container">
              {dishesList.map((each) => (
                <li
                  onClick={() => navigate(`/dish/${each.collectionId}`)}
                  key={each.dishId}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={`https://media-assets.swiggy.com/swiggy/image/upload/${each.imgId}`}
                    alt="dish-image"
                    className="dish-image"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="hr-container">
            <hr className="hr1" />
            <div className="hr-span">
              <MdOutlineRestaurant
                style={{ color: "#cb135d", marginRight: "10px" }}
              />
              <span>Restaurants</span>
            </div>
            <hr className="hr2" />
          </div>

          <div>
            <h1 className="restra-heading">
              Top restaurant chains in{" "}
              <span className="city-name">{mainCity}</span>
            </h1>
          </div>

          <ul className="main-container">
            {restaurantList.map((each) => (
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
                <div
                  className={
                    favouriteList.some((fav) => fav.id === each.id)
                      ? "favourite-card-added"
                      : "favourite-card"
                  }
                  onClick={() => addToFavourite(each)}
                >
                  <FaHeart className="heart" />
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

          <div className="hr-container">
            <hr className="hr1" />
            <div className="hr-span">
              <MdFastfood style={{ color: "#cb135d", marginRight: "10px" }} />
              <span>Best Cuisines Near Me</span>
            </div>
            <hr className="hr2" />
          </div>

          <ul className="cuisines-container">
            {bestFoodPlaces.map((each, index) => (
              <li className="cuisines-card" key={index} onClick={popMessage}>
                <p>{each.text}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default PlaceRestaurants;
