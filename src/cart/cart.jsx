import React, { useState, useContext, useEffect } from "react";
import ContextFile from "../../context/context";
import { FaStar, FaHeart } from "react-icons/fa";
import { FaPlus, FaCartPlus } from "react-icons/fa6";
import { FiMinus } from "react-icons/fi";
import { MdTimer, MdOutlineRestaurant, MdFastfood } from "react-icons/md";

import "./cart.css";

const Cart = () => {
  const { cartList, setCartList } = useContext(ContextFile);
  const [totalBill, setTotalBill] = useState(0);
  const [showTotalBill, setShowTotalBill] = useState(false);
  const [allItemsPrice, setAllItemsPrice] = useState([]);

  useEffect(() => {
    getAllItemsPrice();
  }, []);

  const getAllItemsPrice = () => {
    const updatedAllItems = cartList.map((each) => [
      ...allItemsPrice,
      each.exactPrice * each.q,
    ]);
    const total = updatedAllItems.reduce(
      (acc, curr) => parseInt(acc) + parseInt(curr)
    );
    setTotalBill(total);
    setAllItemsPrice(updatedAllItems);
  };

  const emptyList = () => {
    const empty = [];
    setCartList(empty);
    localStorage.setItem("cart-list", JSON.stringify(empty));
  };

  const toggleTotalBill = () => {
    setShowTotalBill(!showTotalBill);
  };

  const addItem = (item) => {
    const existingItem = cartList.find((each) => each.id === item.id);
    if (!existingItem) {
      item.q = 1;
      const updatedCart = [...cartList, item];
      setCartList(updatedCart);
      localStorage.setItem("cart-list", JSON.stringify(updatedCart));
    }
  };

  const increaseQuantity = (item) => {
    const updatedCart = cartList.map((each) =>
      each.id === item.id ? { ...each, q: each.q + 1 } : each
    );
    setCartList(updatedCart);
    localStorage.setItem("cart-list", JSON.stringify(updatedCart));
    getAllItemsPrice();
  };

  const decreaseQuantity = (item) => {
    let updatedCart = cartList.map((each) =>
      each.id === item.id ? { ...each, q: each.q - 1 } : each
    );

    updatedCart = updatedCart.filter((each) => each.q > 0);
    setCartList(updatedCart);
    localStorage.setItem("cart-list", JSON.stringify(updatedCart));
  };

  return (
    <>
      <div className="cart-container">
        <div className="cart-main-container">
          <ul className="food-menu-container">
            {cartList.map((each) => (
              <li className="indivisual-food" key={each.id}>
                <div className="food-info">
                  <p className="">{each.veg}</p>
                  <h3 className="food-name">{each.name}</h3>
                  <h4 style={{ color: "green" }}>
                    ₹{each.exactPrice * each.q}
                  </h4>
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
          </ul>
        </div>
      </div>
      <div
        className={
          showTotalBill
            ? "show-total-bill-container"
            : "hide-total-bill-container"
        }
      >
        <div className="total-bill-details">
          <div className="item-name">
            {cartList.map((each, i) => (
              <p key={i}>{each.name}</p>
            ))}
          </div>
          <div>
            {cartList.map((each, i) => (
              <p key={i}>{each.q}</p>
            ))}
          </div>
          <div>
            {allItemsPrice.map((each, i) => (
              <p key={i}>₹{each}</p>
            ))}
          </div>
        </div>
        <hr />
        <div className="final-total-amount">
          <h4 style={{ color: "#b31436" }}>Total Amount</h4>
          <h4 style={{ color: "#0da308" }}>₹{totalBill}</h4>
        </div>
        <hr />
        <div>
          <button className="payment-button">Payment</button>
        </div>
      </div>
      <div className="payment-button-container">
        <button className="total-bill" onClick={toggleTotalBill}>
          Total Bill
        </button>
        <p>all</p>
      </div>
    </>
  );
};

export default Cart;
