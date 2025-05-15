import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get background gradient based on weather
  const getWeatherBackground = (weatherMain, weatherDescription) => {
    switch (weatherMain) {
      case 'Clear':
        return 'linear-gradient(135deg, #00b4db, #0083B0)'; // Clear sky - blue gradient
      case 'Clouds':
        return 'linear-gradient(135deg, #4B6CB7, #182848)'; // Cloudy - dark blue gradient
      case 'Rain':
        return 'linear-gradient(135deg, #373B44, #4286f4)'; // Rainy - blue-gray gradient
      case 'Thunderstorm':
        return 'linear-gradient(135deg, #1F1C2C, #928DAB)'; // Thunderstorm - dark gradient
      case 'Snow':
        return 'linear-gradient(135deg, #E6DADA, #274046)'; // Snow - light gray gradient
      case 'Mist':
      case 'Fog':
        return 'linear-gradient(135deg, #8E9EAB, #eef2f3)'; // Mist/Fog - gray gradient
      default:
        return 'linear-gradient(135deg, #00c6ff, #0072ff)'; // Default - blue gradient
    }
  };

  const fetchWeather = async () => {
    if (!city) return;

    setIsLoading(true);
    setError('');
    setShowSuggestions(false);

    const apiKey = 'bf8511a66f961a339f820add073631ec';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await axios.get(url);
      setWeather(response.data);
      setSuggestions([]);
    } catch (err) {
      setError('City not found. Please try another city.');
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp < 0) return '#00ffff'; // Freezing - Cyan
    if (temp < 5) return '#4169e1'; // Very Cold - Royal Blue
    if (temp < 10) return '#1e90ff'; // Cold - Dodger Blue
    if (temp < 15) return '#32cd32'; // Cool - Lime Green
    if (temp < 20) return '#ffd700'; // Mild - Gold
    if (temp < 25) return '#ffa500'; // Warm - Orange
    if (temp < 30) return '#ff6347'; // Hot - Tomato
    if (temp < 35) return '#ff4500'; // Very Hot - Orange Red
    return '#ff0000'; // Extreme Heat - Red
  };

  const getHumidityColor = (humidity) => {
    if (humidity < 20) return '#ffd700'; // Very Dry - Gold
    if (humidity < 40) return '#ffa500'; // Dry - Orange
    if (humidity < 60) return '#32cd32'; // Moderate - Lime Green
    if (humidity < 80) return '#4169e1'; // Humid - Royal Blue
    return '#000080'; // Very Humid - Navy Blue
  };

  // Fetch city suggestions based on user input
  const fetchCitySuggestions = async (input) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`https://api.teleport.org/api/cities/?search=${input}`);
      const citySuggestions = response.data._embedded['city:search-results']
        .map(city => city._embedded['city:item'].name)
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(citySuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setCity(inputValue);
    fetchCitySuggestions(inputValue);
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeather();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  return (
    <div className="App">
      <h1>Weather App</h1>
      <div className="search-container">
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter city name..."
          autoComplete="off"
        />
        <button onClick={fetchWeather} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list" ref={suggestionsRef}>
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {weather && (
        <div 
          className="weather-info"
          style={{
            background: getWeatherBackground(weather.weather[0].main, weather.weather[0].description)
          }}
        >
          <h2>{weather.name}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
            alt={weather.weather[0].description}
            className="weather-icon"
          />
          <p className="temperature" style={{ 
            color: getTemperatureColor(weather.main.temp),
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            fontWeight: 'bold'
          }}>
            Temperature: {weather.main.temp} °C
          </p>
          <p className="weather-description">
            {weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}
          </p>
          <p className="humidity" style={{ 
            color: getHumidityColor(weather.main.humidity),
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            fontWeight: 'bold'
          }}>
            Humidity: {weather.main.humidity}%
          </p>
          <p>
            Wind Speed: {weather.wind.speed} m/s
          </p>
          <p>
            Pressure: {weather.main.pressure} hPa
          </p>
          <p>
            Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
          </p>
          <p>
            Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;




















// 'bf8511a66f961a339f820add073631ec'

// Explanation of the Code
// State Management: The app maintains state for the city name, weather data, error messages, and suggestions.

// Fetching Weather Data: The fetchWeather function retrieves weather data from the OpenWeatherMap API based on the selected city.

// Fetching City Suggestions: The fetchCitySuggestions function fetches city names from the Teleport API based on user input. It updates the suggestions state with the results.

// Input Handling: The handleInputChange function updates the city state and fetches suggestions as the user types.

// Suggestion Click Handling: The handleSuggestionClick function sets the city to the clicked suggestion and clears the suggestions.

// Rendering Suggestions: The app displays a list of suggestions below the input field, allowing users to click on a suggestion to populate the input.