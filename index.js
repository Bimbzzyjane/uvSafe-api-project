import express from "express";
import axios from "axios";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;;

// Tell Express that we are using EJS
app.set('view engine', 'ejs');

// Serve files from the public folder
app.use(express.static("public"));

// Allow express to read data submitted from HTML forms
app.use(express.urlencoded({extended: true}));


//OUR HELPER FUNCTIONS

//Converts the UV number into a readable UV risk level
//This was also connected to our p tags to enable us style the color & background color according to the uv number and level respectively
function getUVLevel(uv){
    if(uv < 3){
        return "LOW";

    } else if (uv < 6){
        return "MODERATE";

    } else if (uv < 8){
        return "HIGH";

    } else if (uv < 11){
        return "VERY HIGH";

    } else {
        return "EXTREME";
    }
};

// Creates the heading for the sunscreen recommendation based on the current UV level
function getRecommendationTitle(uv){
    if (uv < 3) {
        return "SUNSCREEN NOT NECESSARY.";

    } else {
        return " 🧴 YES, USE SUNSCREEN.";
    }
};

// Creates the main sunscreen recommendation
function getRecommendationText(uv){
    if (uv < 3) {
        return "Sunscreen is not necessary, but protection is still helpful outdoors.";

    } else {
        return "Apply before leaving the house and keep sunscreen handy for reapplication.";
    }
};

// Creates an additional recommendation based on the highest/Peak UV level expected during the day
function getPeakRecommendation(peakUV) {
    if (peakUV < 3) {
        return "Peak UV is low, so sunscreen is generally not necessary.";
    } else if (peakUV < 6) {
        return "Peak UV is moderate. Use sunscreen if you will be outdoors for an extended period.";
    } else if (peakUV < 8) {
        return "Peak UV will be high. Use sunscreen and take other sun protection measures when outdoors.";
    } else if (peakUV < 11) {
        return "Today's Peak UV is very high, so sunscreen and other sun protection measures are recommended.";
    } else {
        return "Today's Peak UV is extreme. Avoid prolonged sun exposure and use strong sun protection measures.";
    }
};

// Converts the API time into a more user-friendly format. e.g 2026-09-15T11:43:23.247Z → 12:43 PM
function formatTime(time) {
    const date = new Date(time);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};


//ROUTES

//redirect to the Home Page when users click the link
app.get("/", (req, res) => {

    // There's no UV result available when the page first loads,so uvNumber is an empty string, because the server has to consider the if statement in the ejs file.
    //Error is also an empty string cause there's no error when the page first loads, and our server reads the the if statement in the hero section of ejs file.
    res.render("index.ejs", {
        uvNumber: "",
        error: ""
    });
});

//About page
app.get("/about", (req, res) => {
    res.render("about.ejs")
});

//Check UV level when the user submits a location
app.post("/check-uv", async (req, res) => {

    //Get the location entered by the user from the request body
    const userLocation = req.body.userInput;
    
    // Check if the user submitted an empty location, if no, return an error message to the user and render the index page again
    if (!userLocation || userLocation.trim() === "") {
        return res.status(400).render("index.ejs", {
                uvNumber: "",
                error: "Please enter a location."
            });
    }

    try{

        // Send a request to the Geocoding API(open-meteo) to get the latitude and longitude of the user-entered location
        const result = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
            params: {
                name: userLocation,
                count: 1,
            }
        });

        // Check whether the Open-Meteo found the location, if not, return an error message to the user and render the index page again
        if (!result.data?.results?.length) {
            return res.status(404).render("index.ejs", {
                uvNumber: "",
                error: "Location not found. Please enter a valid city or location."
            });
        }; 
        
        //If location is found, get the first matching location from the results
        const locationData = result.data.results[0];

        // Extract the latitude and longitude from the location data
        const latitude = locationData.latitude;
        const longitude = locationData.longitude; 

        //Build the location name that will be displayed on the website. Added name, admin1, and country gotten from the result from Open-Meteo.   
        const actualLocation =  `${locationData.name}, ${locationData.admin1}, ${locationData.country}`;

        //send the latitude and longitude to the OpenUV API to get the current UV forecast for that location
        const uvResponse = await axios.get("https://api.openuv.io/api/v1/uv", {
            params: {
                lat: latitude,
                lng: longitude,
            },
            headers: {
                'x-access-token': process.env.OPENUV_API_KEY, 
            }
        });

        // Extract the current UV data from the response from OpenUV
        const currentUVData = uvResponse.data.result;

        // Convert the current UV number into a readable level such as LOW or VERY HIGH.
        const uvLevel = getUVLevel(currentUVData.uv);

        //Create the current UV sunscreen recommendation
        const recommendationTitle = getRecommendationTitle(currentUVData.uv);
        const recommendationText = getRecommendationText(currentUVData.uv);

        //Create a recommendation based on the highest/Peak UV level expected during the day
        const peakRecommendation = getPeakRecommendation(currentUVData.uv_max);

        // Render the index.ejs file and pass the necessary data to it
        res.render("index.ejs", {
            location: actualLocation,
            uvNumber: currentUVData.uv,
            peakUV: currentUVData.uv_max,
            peakUVTime: formatTime(currentUVData.uv_max_time),//format the time to a more user-friendly format
            uvLevel: uvLevel,
            recommendationTitle: recommendationTitle,
            recommendationText: recommendationText,
            peakRecommendation: peakRecommendation,
            error: "", // There is no error after a successful request
        });
        
    
    } catch(error) {
        // Log the full error while developing
        console.error("FULL ERROR:", error);

        //Send a friendly message instead of the technical error to the user
        res.status(500).send("Something went wrong while checking the UV level. Please try again later.")
    };   
    
})

//Start our server
app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`)
});