import Header from "../header/header";
import PlaceRestaurants from "../place-restaurants/place-restaurants.jsx";
import Deals from "../deals-section/deals.jsx";

import "./home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="min-bg">
        <Header />
        <Deals />
      </div>

      <PlaceRestaurants />
    </div>
  );
};

export default Home;
