import React, { useContext } from "react";

import ContextFile from "../../context/context.jsx";
import "./deals.css";

const Deals = () => {
  const { mainCity } = useContext(ContextFile);

  return (
    <>
      <div className="bg-container">
        <div>
          <img
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/testing/seo-home/Veggies_new.png"
            alt="img1"
            className="home-image"
          />
        </div>
        <div className="content-part">
          <h1 className="tagline">
            Order food. Discover best restaurants in{" "}
            <span style={{color: 'black'}}>{mainCity}.</span>
            <br /> Swiggy it!
          </h1>
        </div>
        <div>
          <img
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/testing/seo-home/Sushi_replace.png"
            alt="img2"
            className="home-image2"
          />
        </div>
      </div>
    </>
  );
};

export default Deals;
