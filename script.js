const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "b05a6636e496494e7aa3c99cc0da1d18"; // API key for OpenWeatherMap API

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const tempCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
    const windSpeed = weatherItem.wind.speed;
    const humidity = weatherItem.main.humidity;
    const description = weatherItem.weather[0].description;
    const iconUrl = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png`;

    if (index === 0) {
        // HTML for the main weather card
        return `
            <div class="details">
                <h2>${cityName} (${date})</h2>
                <h6>Temperature: ${tempCelsius}°C</h6>
                <h6>Wind: ${windSpeed} M/S</h6>
                <h6>Humidity: ${humidity}%</h6>
            </div>
            <div class="icon">
                <img src="${iconUrl}" alt="weather-icon">
                <h6>${description}</h6>
            </div>`;
    } else {
        // HTML for the 5-day forecast card
        return `
            <li class="card">
                <h3>(${date})</h3>
                <img src="${iconUrl}" alt="weather-icon">
                <h6>Temp: ${tempCelsius}°C</h6>
                <h6>Wind: ${windSpeed} M/S</h6>
                <h6>Humidity: ${humidity}%</h6>
            </li>`;
    }
};

// Function to fetch weather details
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            // Filter forecasts to get one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Clear previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Create and append weather cards to the DOM
            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        })
        .catch(error => {
            console.error("Error fetching weather details:", error);
            alert("An error occurred while fetching the weather forecast. Please try again later.");
        });
};

// Function to fetch city coordinates based on user input
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) {
                return alert(`No coordinates found for ${cityName}`);
            }
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(error => {
            console.error("Error fetching city coordinates:", error);
            alert("An error occurred while fetching the coordinates. Please try again later.");
        });
};

// Function to get the user's current location and weather details
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(error => {
                    console.error("Error fetching city name:", error);
                    alert("An error occurred while fetching the city name. Please try again later.");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please allow location access to use this feature.");
            } else {
                alert("An error occurred while requesting your location. Please try again.");
            }
        }
    );
};

// Event listeners for search button, location button, and 'Enter' key press
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
