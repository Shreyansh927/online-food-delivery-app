import React, { createContext, useState } from "react";

const ContextFile = createContext();

export const ContextProvider = ({ children }) => {
  const [currentLat, setCurrentLat] = useState("");
  const [currentLon, setCurrentLon] = useState("");

  const [city, setCity] = useState("");
  const [mainCity, setMainCity] = useState(
    JSON.parse(localStorage.getItem("main-city"))
  );
  const [favouriteList, setFavouriteList] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [cartList, setCartList] = useState(
    JSON.parse(localStorage.getItem("cart-list") || "[]")
  );

  return (
    <ContextFile.Provider
      value={{
        currentLat,
        currentLon,
        setCurrentLat,
        setCurrentLon,
        city,
        setCity,
        mainCity,
        setMainCity,
        favouriteList,
        setFavouriteList,
        searchHistory,
        setSearchHistory,
        cartList,
        setCartList,
      }}
    >
      {children}
    </ContextFile.Provider>
  );
};

export default ContextFile;
