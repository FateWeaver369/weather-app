
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
import requests
import os

# Load the API key from .env file
load_dotenv()
API_KEY = os.getenv("OPENWEATHER_API_KEY")

# create the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# route 1 - current weather
@app.route("/weather/<city>")
def get_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        weather_info = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
            "timezone": data["timezone"]
        }
        return jsonify(weather_info)
    else:
        return jsonify({"error": "City not found"}), 404

# route 2 - hourly forecast for graph
@app.route("/forecast/<city>")
def get_forecast(city):
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        forecast_list = []
        for item in data["list"][:6]:  # next 24 hours (8 x 3hr slots)
            forecast_list.append({
                "time": item["dt_txt"],
                "temperature": item["main"]["temp"],
                "description": item["weather"][0]["description"],
                "icon": item["weather"][0]["icon"]
            })
        return jsonify(forecast_list)
    else:
        return jsonify({"error": "City not found"}), 404

# Route 3 - Weather by coordinates
@app.route("/weather/coords")
def get_weather_by_coords():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        weather_info = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
            "timezone": data["timezone"]
        }
        return jsonify(weather_info)
    else:
        return jsonify({"error": "Location not found"}), 404

# Route 4 - Forecast by coordinates
@app.route("/forecast/coords")
def get_forecast_by_coords():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        forecast_list = []
        for item in data["list"][:6]:
            forecast_list.append({
                "time": item["dt_txt"],
                "temperature": item["main"]["temp"],
                "description": item["weather"][0]["description"],
                "icon": item["weather"][0]["icon"]
            })
        return jsonify(forecast_list)
    else:
        return jsonify({"error": "Location not found"}), 404


# start the server
if __name__ == "__main__":
    app.run(debug=True)





















































































































