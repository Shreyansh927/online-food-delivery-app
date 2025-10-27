import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dish.css";
import Header from "../header/header";
import { FaStar, FaHeart } from "react-icons/fa";
import { MdTimer, MdOutlineRestaurant, MdFastfood } from "react-icons/md";
import { toast } from "react-toastify";

import { useParams, useNavigate } from "react-router-dom";

const Dish = () => {
  const [restaurantDishList, setRestaurantDishList] = useState([]);
  const [dishInfo, setDishInfo] = useState({});
  const { collectionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getAllDishRestaurant();
  }, [collectionId]);

  const getAllDishRestaurant = async () => {
    const api = `https://corsproxy.io/https://www.swiggy.com/dapi/restaurants/list/v5?lat=26.4148245&lng=80.23213129999999&collection=${collectionId}&tags=layout_CCS_Idli&sortBy=&filters=&type=rcv2&offset=0&carousel=true&third_party_vendor=1`;

    try {
      const response = await axios.get(api);

      // Defensive check because structure may vary
      const cards = response?.data?.data?.cards || response?.data?.cards || [];

      const formattedDishRestaurants = cards
        .map((each) => {
          const info = each?.card?.card?.info;
          return info
            ? {
                id: info.id,
                name: info.name,
                imgUrl: info.cloudinaryImageId,
                rating: info.avgRating,
                locality: info.locality,
                area: info.areaName,
                deliveryTime: info.sla.slaString,
                price: info.costForTwo,
              }
            : null;
        })
        .filter(Boolean); // remove null values

      const dishInfoEndPoints = response?.data?.data?.cards[0]?.card?.card;

      setDishInfo({
        title: dishInfoEndPoints?.title || "No Title",
        description: dishInfoEndPoints?.description || "No Description",
        collectionId: dishInfoEndPoints?.collectionId || "N/A",
        imageId: dishInfoEndPoints?.imageId || "",
      });

      setRestaurantDishList(formattedDishRestaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  return (
    <>
      <Header />
      <hr style={{ margin: "0px" }} />
      <div>
        <div className="dish-info">
          <h1>{dishInfo.title}</h1>
          <p>{dishInfo.description}</p>
        </div>

        <div className="hr-container">
          <hr className="hr1" />
          <div className="hr-span">
            <MdFastfood style={{ color: "#cb135d", marginRight: "10px" }} />
            <span> {dishInfo.title} Restaurants</span>
          </div>
          <hr className="hr2" />
        </div>

        <ul className="main-container">
          {restaurantDishList.map((each) => (
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
                    <MdTimer /> {each.deliveryTime} 
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Dish;
