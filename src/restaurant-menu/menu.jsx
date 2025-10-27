import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../header/header.jsx";
import { FaStar, FaHeart } from "react-icons/fa";
import { FaPlus, FaCartPlus } from "react-icons/fa6";
import { FiMinus } from "react-icons/fi";
import { MdTimer, MdOutlineRestaurant, MdFastfood } from "react-icons/md";
import axios from "axios";
import ContextFile from "../../context/context.jsx";
import "./menu.css";

const RestaurantMenu = () => {
  const { restaurantId } = useParams();
  const [dishName, setDishName] = useState("");
  const [restrauMenu, setRestrauMenu] = useState([]);
  const [restrauInfo, setRestrauInfo] = useState({});
  const [restrauDeals, setRestrauDeals] = useState([]);
  const [fullMenu, setFullMenu] = useState([]);
  const navigate = useNavigate();

  const { cartList, setCartList } = useContext(ContextFile);

  useEffect(() => {
    getRestaurantMenu();
  }, [restaurantId]);

  const getRestaurantMenu = async () => {
    const api = `https://corsproxy.io/https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=20.9792905&lng=75.636406&restaurantId=${restaurantId}&submitAction=ENTER`;

    try {
      const response = await axios.get(api);
      const cards = response?.data?.data?.cards || [];

      // Find the REGULAR menu group
      const regularMenuGroup = cards.find(
        (c) => c.groupedCard?.cardGroupMap?.REGULAR
      )?.groupedCard?.cardGroupMap?.REGULAR?.cards;

      const itemsCards =
        regularMenuGroup?.flatMap((c) => c.card?.card?.itemCards || []) || [];

      const formattedRestrauMenuResponse = itemsCards.map((each) => {
        const info = each?.card?.info;

        return {
          name: info?.name || "No Name",
          id: each?.card?.info?.id,
          q: 0,
          category: info?.category || "N/A",
          description: info?.description || "No Description",
          imageId: info?.imageId || "",
          price: info?.price || info?.defaultPrice || 0,
          exactPrice: ((info?.price || info?.defaultPrice || 0) / 100).toFixed(
            2
          ),
          veg:
            info?.veg !== undefined
              ? info.veg
              : info?.itemAttribute?.vegClassifier || "UNKNOWN",
        };
      });

      const restrauInfoEndPoints = response.data.data.cards[2].card.card.info;

      const formattedRestrauInfo = {
        name: restrauInfoEndPoints.name,
        id: restrauInfoEndPoints.id,
        city: restrauInfoEndPoints.city,
        cloudinaryImageId: restrauInfoEndPoints.cloudinaryImageId,
        locality: restrauInfoEndPoints.locality,
        areaName: restrauInfoEndPoints.areaName,
        costForTwoMessage: restrauInfoEndPoints.costForTwoMessage,
        avgRating: restrauInfoEndPoints.avgRating,
      };

      const restrauDealsEndPoints =
        response.data.data.cards[3].card.card.gridElements.infoWithStyle.offers;
      const formattedRestrauDeals = restrauDealsEndPoints.map((each) => ({
        offer: each.info.header,
        offerTag: each.info.offerTag,
      }));

      setFullMenu(formattedRestrauMenuResponse);
      setRestrauDeals(formattedRestrauDeals);
      setRestrauInfo(formattedRestrauInfo);
      setRestrauMenu(formattedRestrauMenuResponse);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  useEffect(() => {
    if (dishName.trim() === "") {
      setRestrauMenu(fullMenu); // show full menu if no search
    } else {
      const filtered = fullMenu.filter((each) =>
        each.name.toLowerCase().includes(dishName.toLowerCase())
      );
      setRestrauMenu(filtered);
    }
  }, [dishName, fullMenu]);

  const addItem = (item) => {
    item.q = 1; // Initialize quantity to 1 when adding to cart
    const existingItem = cartList.find((each) => each.id === item.id);
    if (!existingItem) {
      const updatedCart = [...cartList, item];
      setCartList(updatedCart);

      localStorage.setItem("cart-list", JSON.stringify(updatedCart));
    }
  };

  const increaseQuantity = (each) => {
    const updatedCart = cartList.map((item) =>
      item.id === each.id ? { ...item, q: item.q + 1 } : item
    );
    setCartList(updatedCart);
    localStorage.setItem("cart-list", JSON.stringify(updatedCart));
  };

  const decreaseQuantity = (each) => {
    let updatedCart = cartList.map((item) =>
      item.id === each.id ? { ...item, q: item.q - 1 } : item
    );

    updatedCart = updatedCart.filter((item) => item.q > 0);
    setCartList(updatedCart);

    localStorage.setItem("cart-list", JSON.stringify(updatedCart));
  };

  return (
    <>
      <hr style={{ margin: "0px" }} />
      <div className="restrau-info-deals-container">
        <div className="restrau-info-container">
          <div className="heading-container">
            <h2>{restrauInfo.name}</h2>
          </div>
          <hr className="hr-menu" />
          <li className="min-info">
            <p>
              <FaStar style={{ marginRight: "10px", color: "green" }} />
              {restrauInfo.avgRating}
            </p>
            <p className="b">{restrauInfo.costForTwoMessage}</p>
          </li>

          <li className="min-info">
            <p className="c">{restrauInfo.locality}</p>
            <h3 className="d" style={{ color: "red" }}>
              {restrauInfo.city}
            </h3>
          </li>
        </div>
        <div className="restrau-deals-container">
          <h2>Deals for you...</h2>
          <ul className="deals-list">
            <div className="deals-container">
              {restrauDeals.map((deal, index) => (
                <li className="deals" key={index}>
                  <p>{deal.offer}</p>
                </li>
              ))}
            </div>
          </ul>
        </div>
      </div>

      <div className="hr-container">
        <hr className="hr1" />
        <div className="hr-span" style={{ margin: "20px 30px" }}>
          <MdFastfood style={{ color: "#cb135d", marginRight: "10px" }} />
          <span> Full Menu</span>
        </div>
        <hr className="hr2" />
      </div>
      <div className="hr-container" style={{ marginTop: "40px" }}>
        <hr className="hr1" />
        <input
          type="search"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          className="navigation-search-bar"
          placeholder="🔍   Search any food, dish or restaurant..."
        />
        <hr className="hr2" />
      </div>
      <ul className="food-menu-container">
        {restrauMenu.map((each) => (
          <li className="indivisual-food" key={each.id}>
            <div className="food-info">
              <p>{each.veg}</p>
              <h3 className="food-name">{each.name}</h3>
              <h4 style={{ color: "green" }}>₹{each.exactPrice}</h4>
            </div>
            <div className="food-image-container">
              <img
                className="food-image"
                src={`https://media-assets.swiggy.com/swiggy/image/upload/${each.imageId}`}
                alt="img"
              />

              <button className="add-button" onClick={() => addItem(each)}>
                {cartList.some((item) => item.id === each.id) &&
                cartList.find((item) => item.id === each.id)?.q >= 1 ? (
                  <span className="quantity-container">
                    <FiMinus
                      onClick={(e) => {
                        e.stopPropagation();
                        decreaseQuantity(each);
                      }}
                      style={{ marginRight: "10px", cursor: "pointer" }}
                    />
                    {
                      cartList.find((item) => item.id === each.id)?.q // show per-item quantity
                    }
                    <FaPlus
                      onClick={(e) => {
                        e.stopPropagation();
                        increaseQuantity(each);
                      }}
                      style={{ marginLeft: "10px", cursor: "pointer" }}
                    />
                  </span>
                ) : (
                  "ADD"
                )}
              </button>
            </div>
          </li>
        ))}
        <div
          className={
            cartList.length > 0 ? "show-cart-button" : "hide-cart-button"
          }
          onClick={() => navigate("/cart")}
        >
          <FaCartPlus className="cart-icon" /> <span className="cart-length">{cartList.length}</span>
        </div>
      </ul>
    </>
  );
};

export default RestaurantMenu;
