🍔 FOODY --- Online Food Ordering System

A full-stack, Swiggy-inspired food ordering web application built with
React, Firebase, real-time restaurant/menu APIs, geolocation, search,
cart management, favourites, order history, and weather-aware location
handling.








📌 Project Overview

FOODY is an online food ordering platform designed around a modern
food-delivery experience.

The application allows users to:

Discover restaurants based on their location

Browse restaurant menus using live Swiggy data

Search for restaurants and dishes

View restaurant details and menus dynamically

Add/remove food items from the cart

Persist cart and user data

Manage favourites

Maintain search history

Place orders and preserve order history

Use browser geolocation to determine latitude/longitude

Retrieve weather information for the detected location using
OpenWeather

Use responsive layouts across desktop and mobile-sized screens

The project was built as a hands-on learning project during the
beginning of 3rd year, with a strong focus on practical React
development, API integration, asynchronous programming, authentication,
persistence, and reusable UI components.

Screen shots 


<img width="1920" height="1080" alt="Screenshot 2026-08-28 142920" src="https://github.com/user-attachments/assets/ceb14397-b360-4741-91ee-2b347a1a4447" />


✨ Core Features

🏠 Restaurant Discovery

Location-aware restaurant discovery

Restaurant cards with:

Restaurant name

Rating

Cost for two

Delivery time

Location

Restaurant imagery

Cuisine and category discovery

Filtering and sorting options

🔎 Smart Search

Search restaurants and food items

Debounced API requests to reduce unnecessary network calls

Swiggy search suggestion integration

Restaurant ID extraction from API metadata when the direct
restaurantId is unavailable

Search history stored in Firestore

Delete individual searches

Delete complete search history

🍽️ Dynamic Restaurant Menus

Restaurant-specific menu pages

Dynamic menu/category rendering

Food item images and descriptions

Vegetarian/non-vegetarian classification

Dynamic pricing

Add-to-cart functionality

Quantity controls

🛒 Cart Management

Add food items

Increase/decrease quantity

Remove items

Persistent cart state

Live item count

Dynamic total bill calculation

❤️ Favourites

Save restaurants to favourites

Persist favourite data using Firestore

Retrieve favourites for authenticated users

📜 Order History

Persist order information

Retrieve previous orders

Authenticated user-specific history

🔐 Authentication

Firebase Authentication supports:

Email/password authentication

Google authentication

Persistent login sessions

User-specific Firestore data

📍 Geolocation + Weather

The application can obtain the user's coordinates using the browser
Geolocation API:

navigator.geolocation.getCurrentPosition(
  (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
  },
  (error) => {
    console.error("Unable to retrieve location:", error);
  }
);

Those coordinates can then be passed to OpenWeather.

🌦️ OpenWeather Integration

FOODY can use the user's latitude and longitude to retrieve current
weather conditions.

API flow

Browser
   │
   │ navigator.geolocation
   ▼
Latitude + Longitude
   │
   ▼
OpenWeather API
   │
   ▼
Current Weather Data
   │
   ├── Temperature
   ├── Weather condition
   ├── Humidity
   ├── Wind speed
   └── Weather icon

OpenWeather request

https://api.openweathermap.org/data/2.5/weather
?lat={LATITUDE}
&lon={LONGITUDE}
&appid={OPENWEATHER_API_KEY}
&units=metric

React/Axios implementation

const getWeather = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: import.meta.env.VITE_OPENWEATHER_API_KEY,
          units: "metric",
        },
      }
    );

    const weather = response.data;

    return {
      temperature: weather.main.temp,
      condition: weather.weather[0]?.main,
      description: weather.weather[0]?.description,
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
      icon: weather.weather[0]?.icon,
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
};

Recommended environment variable

VITE_OPENWEATHER_API_KEY=your_openweather_api_key

Do not commit API keys to GitHub.

🧭 Location Architecture

The location logic can be structured as:

                    ┌──────────────────────┐
                    │ Browser Geolocation  │
                    └──────────┬───────────┘
                               │
                         latitude
                         longitude
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
       Swiggy API                         OpenWeather API
              │                                 │
              ▼                                 ▼
     Restaurant / Menu                  Weather information
              │                                 │
              └────────────────┬────────────────┘
                               ▼
                         React UI

A shared React Context can hold:

{
  currentLat,
  currentLon
}

This allows components such as the header, restaurant listing, search
page, and weather component to use the same location state.

🛠️ Tech Stack

Frontend

Technology                    Purpose

React.js                      Component-based UI
React Router                  Client-side routing
Context API                   Shared application state
Axios                         HTTP/API requests
CSS                           Responsive UI and styling
React Toastify / SweetAlert   User feedback
Vite                          Development and production build tooling

Backend / Services

Technology / Service      Purpose

Firebase Authentication   User authentication
Cloud Firestore           User data persistence
Swiggy API                Restaurant and menu data
OpenWeather API           Weather data using latitude/longitude
CORS Proxy                Browser-side API access where required

🏗️ High-Level Architecture

                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │     React UI        │
                       │                     │
                       │ Header              │
                       │ Search              │
                       │ Restaurants         │
                       │ Menu                │
                       │ Cart                │
                       │ Favourites          │
                       │ Orders              │
                       └─────────┬───────────┘
                                 │
                ┌────────────────┼─────────────────┐
                │                │                 │
                ▼                ▼                 ▼
          Swiggy APIs       Firebase          OpenWeather
                │          Auth/Firestore          │
                │                │                 │
                └────────────────┼─────────────────┘
                                 ▼
                         Persistent App Data

🔄 Restaurant Search Flow

One of the important implementation details is handling inconsistent
restaurant IDs returned by the search suggestion API.

Some restaurant suggestions can return:

restaurantId: 0

while the actual restaurant ID is available inside metadata.

The application handles this using:

let restaurantId = s.restaurantId;

if ((!restaurantId || restaurantId === 0) && s.metadata) {
  try {
    const metadata = JSON.parse(s.metadata);

    restaurantId =
      metadata?.data?.primaryRestaurantId || null;
  } catch (error) {
    console.error("Failed to parse metadata:", error);
  }
}

The normalized object is then stored as:

{
  suggestion: s.text || "",
  thumbNailId: s.cloudinaryId || "",
  restaurantId,
  type: s.type || "",
  tag: s.tagToDisplay || "",
  deepLink: s.cta?.link || ""
}

The selected restaurant can then be routed using:

navigate(`/restaurant-menu/${item.restaurantId}`);

This keeps the UI independent from the inconsistent shape of the
upstream API response.

🔍 Search Performance

The search input uses debouncing so that an API request is not made
on every keystroke.

User types:
p
pa
pan
pane
paneer
       │
       ▼
Wait 500 ms
       │
       ▼
API request

Example:

useEffect(() => {
  if (restaurantValue.trim().length > 2) {
    const delayDebounce = setTimeout(() => {
      getRestaurantSuggestions(restaurantValue);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }
}, [restaurantValue]);

This reduces unnecessary requests and improves the search experience.

🔐 Firebase Data Model

A user document can follow a structure similar to:

users
 └── {uid}
      ├── searchHistory
      ├── favourites
      ├── cart
      └── orders

Example:

{
  "searchHistory": [
    {
      "suggestion": "Good Food Kanpur",
      "restaurantId": 1381944
    }
  ],
  "favourites": [],
  "cart": [],
  "orders": []
}

User-specific data is associated with the authenticated Firebase UID.

📱 Responsive Design

The UI is designed to adapt to different viewport sizes.

The project includes:

Responsive restaurant grids

Mobile-friendly search UI

Responsive navigation

Flexible menu layouts

Adaptive cards

Mobile-sized search experience

📸 Screenshots

🏠 Homepage



The landing page provides location-aware restaurant discovery,
navigation, search, cart, favourites, and history.

🔎 Restaurant Search



Live restaurant suggestions are displayed while searching.

🌐 Search API Response



The application processes the upstream restaurant suggestion response
and extracts the restaurant ID from metadata when necessary.

🍽️ Restaurant Menu



A restaurant's menu is rendered dynamically using live API data.

🛒 Menu + Cart



Users can add items and modify quantities directly from the menu.

🍰 Menu Items



Food items display category, name, price, image, and cart controls.

📜 Extended Menu



The menu supports a large number of dynamically loaded food items.

🥘 Cuisine Discovery



Cuisine/category discovery helps users explore food beyond individual
restaurants.

🏪 Restaurant Listing



Restaurant cards display important decision-making information such as
rating, price, delivery time, and location.

🍕 Top Dishes



The application provides category-based food discovery and filtering.

📱 Responsive Search View



The search experience is adapted for smaller screen dimensions.

🚀 Deployed Application



The application is deployed and accessible through a public web
environment.

📁 Suggested Project Structure

src/
├── components/
│   ├── header/
│   ├── search-bar/
│   ├── restaurant/
│   ├── menu/
│   ├── cart/
│   └── weather/
│
├── context/
│   └── context.jsx
│
├── pages/
│   ├── home/
│   ├── search/
│   ├── restaurant-menu/
│   ├── cart/
│   ├── favourites/
│   └── history/
│
├── firebase/
│   └── firebase.js
│
├── utils/
│   ├── api.js
│   ├── weather.js
│   └── helpers.js
│
├── App.jsx
└── main.jsx

foody-readme-assets/
└── screenshots...

⚙️ Environment Variables

Create a .env file:

VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_CORS_PROXY_API_KEY=your_cors_proxy_key

Firebase configuration should also be supplied through environment
variables where applicable.

Important

Never commit:

.env
.env.local

to the repository.

Add them to .gitignore.

🚀 Getting Started

1. Clone the repository

git clone <your-repository-url>
cd foody

2. Install dependencies

npm install

3. Configure environment variables

Create .env and add the required Firebase, proxy, and OpenWeather
credentials.

4. Start the development server

npm run dev

The application will normally be available at:

http://localhost:5173

🔒 Security Considerations

The project uses third-party APIs and Firebase services, so API
credentials must be handled carefully.

Recommended practices:

Store secrets in environment variables

Never commit API keys

Restrict API keys by domain where supported

Configure Firebase Firestore security rules

Validate authenticated user access before reading/writing
user-specific data

Handle failed API requests gracefully

Do not trust restaurant IDs or client-side values without validation

🧪 Error Handling

The application handles common asynchronous failures such as:

API request failures

Missing restaurant IDs

Invalid API responses

Firebase offline errors

Metadata parsing errors

Geolocation permission failures

Weather API failures

Example:

try {
  const response = await axios.get(api);
  // process response
} catch (error) {
  console.error("API fetch error:", error);
  toast.error("Unable to fetch data");
}

🎯 Engineering Concepts Demonstrated

This project demonstrates practical understanding of:

React component architecture

React Hooks

useState

useEffect

Context API

Client-side routing

Dynamic route parameters

Debouncing

REST API consumption

Axios

Asynchronous JavaScript

Error handling

Browser Geolocation API

Firebase Authentication

Firestore CRUD operations

Persistent user data

Array operations

Dynamic rendering

Responsive UI

Third-party API integration

Environment variables

Deployment

📈 Possible Future Improvements

The project can be extended with:

Dedicated backend API layer instead of exposing third-party API
calls directly from the client

Redis caching for restaurant/menu responses

Server-side API proxying

Rate limiting

Better API fallback handling

Skeleton loading states

Pagination / infinite scrolling

Restaurant recommendations

Personalized food recommendations

Payment gateway integration

Order tracking

Push notifications

Automated testing with Jest/React Testing Library

CI/CD pipeline

Dockerized deployment

Production monitoring and logging

💡 Key Learning Outcome

FOODY was built as a practical third-year development project rather
than a simple static frontend.

The project combines frontend engineering, API integration,
authentication, database persistence, geolocation, asynchronous
programming, and deployment into a single application.

The most valuable part of the project is the integration between
independent services:

React
  │
  ├── Firebase Authentication
  ├── Firestore
  ├── Swiggy Restaurant/Menu APIs
  ├── Browser Geolocation
  └── OpenWeather API

This makes the project a strong demonstration of building a real-world,
API-driven application rather than only implementing UI screens.

👨‍💻 Author

Shreyansh Dixit

Built as a hands-on full-stack learning project during the beginning of
3rd year.
