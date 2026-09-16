# ☀️ UV-Safe

UV-Safe is a simple web application that helps users check the UV level for any city or location.
The project was built as a practice project to learn how to work with public APIs using Node.js, Express.js, Axios and EJS.

## About the Project

Users can enter a city or location, and UV-Safe retrieves the location's coordinates and uses them to get UV information.

The application displays:

* Current UV Index
* UV Risk Level
* Today's Peak UV
* Peak UV Time
* Sunscreen Recommendation
* Peak UV Recommendation

## How It Works

1. The user enters a city or location.
2. UV-Safe sends the location to the Open-Meteo Geocoding API.
3. Open-Meteo returns the latitude and longitude of the location.
4. The coordinates are sent to the OpenUV API.
5. OpenUV returns the UV information.
6. UV-Safe displays the results and sunscreen recommendations.

## Technologies Used

* HTML5
* CSS3
* JavaScript
* Node.js
* Express.js
* EJS
* Axios
* Open-Meteo Geocoding API
* OpenUV API

## Getting Started

### 1. Clone the repository

git clone URL

### 2. Navigate into the project folder

cd 'Use Public API Project'

### 3. Install the dependencies

npm i

### 4. Create your environment file

Create a file named `.env` in the root folder of the project.

Add your OpenUV API key:
OPENUV_API_KEY = your_api_key_here

Replace `your_api_key_here` with your actual OpenUV API key.

### 5. Start the server

Using nodemon:

nodemon index.js

Or using the npm start script:

npm start

The application should then be available at:

http://localhost:3000


### Open-Meteo Geocoding API

Used to convert a city or location entered by the user into latitude and longitude coordinates.
URL: https://open-meteo.com/en/docs/geocoding-api

### OpenUV API

Used to retrieve UV information based on the location's coordinates.
URL: https://www.openuv.io

## Author

**Janet Okedoyin**
