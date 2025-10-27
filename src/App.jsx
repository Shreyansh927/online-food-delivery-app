import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./register/register.jsx";
import Login from "./login/login.jsx";
import Home from "./home/home.jsx";
import Cart from "./cart/cart.jsx";
import SearchBar from "./search-bar/search-bar.jsx";
import ProfileInfo from "./more-info/more-info.jsx";
import FavouriteSection from "./favourites/favourite.jsx";
import Historyy from "./search-history/history.jsx";
import RestaurantMenu from "./restaurant-menu/menu.jsx";
import Dish from "./dish-restaurant/dish.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/forgot-password"
          element={<h2>Forgot Password Page</h2>}
        />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/search" element={<SearchBar />} />
        <Route path="/profile" element={<ProfileInfo />} />
        <Route path="/favourite" element={<FavouriteSection />} />
        <Route path="/history" element={<Historyy />} />
        <Route
          path="/restaurant-menu/:restaurantId"
          element={<RestaurantMenu />}
        />
        <Route path="/dish/:collectionId" element={<Dish />} />
      </Routes>
    </Router>
  );
};

export default App;
