const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "7f0d60e8b2f65260ed5897ea473ad066"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

document.addEventListener("DOMContentLoaded", function() {
    const messageForm = document.getElementById('answer-form');
    const messageInput = document.getElementById('answer');
    const resultContainer = document.getElementById('result');
    const equationContainer = document.getElementById('equation');
    const correctAnswerInput = document.getElementById('correct_answer');

    // Fetch questions from the JSON file
    fetch("questions.json")
        .then(response => response.json())
        .then(questionsData => {
            const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
            const todaysQuestion = questionsData.find(question => question.date === today);

            if (todaysQuestion) {
                equationContainer.textContent = todaysQuestion.Equation;
                correctAnswerInput.value = todaysQuestion.Answer;
            } else {
                equationContainer.textContent = "No question for today!";
            }
        })
        .catch(error => {
            console.error("Error loading questions:", error);
        });

    messageForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const userAnswer = messageInput.value.trim();
        const correctAnswer = correctAnswerInput.value.trim();

        if (userAnswer === correctAnswer) {
            resultContainer.textContent = "Correct!";
        } else {
            resultContainer.textContent = "Incorrect. Try again!";
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    let attempts = 0;

    const showPopupBtn = document.getElementById('showPopupBtn');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('closePopup');
    const attemptsText = document.getElementById('attemptsText');
    const shareBtn = document.getElementById('shareBtn');

    showPopupBtn.addEventListener('click', () => {
        attemptsText.textContent = `Attempts: ${attempts}`;
        popup.style.display = 'block';
    });

    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == popup) {
            popup.style.display = 'none';
        }
    });

    shareBtn.addEventListener('click', () => {
        const message = `I have attempted ${attempts} times!`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    async function fetchQuestion() {
        const response = await fetch('questions.json');
        const questions = await response.json();
        const today = new Date().toISOString().split('T')[0];
        const question = questions.find(q => q.date === today);

        if (question) {
            document.getElementById('equation').innerText = question.Equation;
            document.getElementById('correct_answer').value = question.Answer;
        } else {
            document.getElementById('equation').innerText = 'No question for today!';
        }
    }

    fetchQuestion();

    window.checkAnswer = function() {
        const userAnswer = document.getElementById('answer').value.trim();
        const correctAnswer = document.getElementById('correct_answer').value.trim();

        if (userAnswer === correctAnswer) {
            attempts++;
            document.getElementById('result').innerText = 'Correct!';
            showPopupBtn.click(); // Show popup automatically after correct answer
        } else {
            document.getElementById('result').innerText = 'Incorrect. Try again.';
        }
    };
});
