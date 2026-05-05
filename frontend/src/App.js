import React, { useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);

  const getLocalDate = (timezoneOffset) => {
    const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + timezoneOffset * 1000);
    return cityTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchWeather = async () => {
    try {
      const weatherRes = await axios.get(`https://weather-app-backend-d1r4.onrender.com/weather/${city}`);
      setWeather(weatherRes.data);

      setHistory(prev => {
        const updated = [city, ...prev.filter(c => c.toLowerCase() !== city.toLowerCase())];
        return updated.slice(0, 5);
      });

      const forecastRes = await axios.get(`https://weather-app-backend-d1r4.onrender.com/forecast/${city}`);
      setForecast(forecastRes.data);

      setError('');
    } catch (err) {
      setError('City not found. Please try again!');
      setWeather(null);
      setForecast(null);
    }
  };

  const fetchByLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser!');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const weatherRes = await axios.get(`https://weather-app-backend-d1r4.onrender.com/weather/coords?lat=${latitude}&lon=${longitude}`);
          setWeather(weatherRes.data);
          setCity(weatherRes.data.city);

          const forecastRes = await axios.get(`https://weather-app-backend-d1r4.onrender.com/forecast/coords?lat=${latitude}&lon=${longitude}`);
          setForecast(forecastRes.data);

          setError('');
        } catch (err) {
          setError('Could not get weather for your location!');
        }
      },
      () => {
        setError('Location access denied. Please allow location access!');
      }
    );
  };

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    });
  };

  const convertTemp = (temp) => {
    if (isCelsius) return `${temp}°C`;
    return `${((temp * 9/5) + 32).toFixed(1)}°F`;
  };

  return (
    <div className="app">
      <h1>🌤️ Weather App</h1>

      {weather ? (
        <p className="date">{getLocalDate(weather.timezone)}</p>
      ) : (
        <p className="date">{new Date().toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}</p>
      )}

      <button 
        className="unit-toggle"
        onClick={() => setIsCelsius(!isCelsius)}
      >
        {isCelsius ? '°C → °F' : '°F → °C'}
      </button>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
        />
        <button onClick={fetchWeather}>Search</button>
        <button className="location-btn" onClick={fetchByLocation}>📍</button>
      </div>

      {history.length > 0 && (
        <div className="history">
          {history.map((item, index) => (
            <button
              key={index}
              className="history-btn"
              onClick={() => {
                setCity(item);
                fetchWeather();
              }}
            >
              🕐 {item}
            </button>
        ))}
      </div>
    )}

      {error && <p className="error">{error}</p>}

      {(weather || forecast) && (
        <div className="cards-container">

          {weather && (
            <div className="weather-card">
              <h2>{weather.city}</h2>
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
              />
              <p className="temp">{convertTemp(weather.temperature)}</p>
              <p className="desc">{weather.description}</p>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-icon">🌡️</span>
                  <span className="detail-label">Feels Like</span>
                  <span className="detail-value">{convertTemp(weather.feels_like)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💧</span>
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weather.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💨</span>
                  <span className="detail-label">Wind Speed</span>
                  <span className="detail-value">{weather.wind_speed} m/s</span>
                </div>
              </div>
            </div>
          )}

          {forecast && (
            <div className="forecast-card">
              <h3>24-Hour Temperature Forecast</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[
                  { time: 'Now', temp: weather.temperature },
                  ...forecast.map(item => ({
                    time: formatTime(item.time),
                    temp: item.temperature
                  }))
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.7)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.7)" tick={{ fontSize: 12 }} unit="°" />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,52,96,0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      color: 'white'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#e94560"
                    strokeWidth={3}
                    dot={{ fill: '#e94560', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default App;



