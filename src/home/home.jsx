import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Header from "../header/header";
import SmallHeader from "../small-header/small-header.jsx";
import PlaceRestaurants from "../place-restaurants/place-restaurants.jsx";
import Deals from '../deals-section/deals.jsx'
import "./home.css";

const Home = () => {
  return (
    <>
      <div className="home-container">
        <div className="min-bg">
          <Header />
          <Deals />
        </div>
        <PlaceRestaurants />
      </div>
    </>
  );
};

export default Home;
