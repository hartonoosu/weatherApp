import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const port = 3000;
const app = express();
const weather_API_KEY = process.env.VITE_WEATHER_API_KEY;
const location_API_KEY = process.env.VITE_LOCATION_API_KEY;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    res.render("index.ejs", {
        location: "dunno yet", 
        temperature: "-", 
        icon:"?",
        weather: "weather",
        city: "city",
        lat: "-",
        lon: "-",
        locAPI: location_API_KEY
    })
})

app.post("/get-forecast", async (req,res) => {

    try {
        const city = req.body.city;
        const locationAPI = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${weather_API_KEY}`);
        const country = locationAPI.data[0].state;
        const lat = locationAPI.data[0].lat;
        const lon = locationAPI.data[0].lon;

        const weatherAPI = await axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude={part}&units=metric&appid=${weather_API_KEY}`)

        const location = weatherAPI.data.timezone;
        const temperature = Math.round(weatherAPI.data.current.temp);
        const iconURL = `https://openweathermap.org/img/wn/${weatherAPI.data.current.weather[0].icon}@2x.png`;
        const weather = weatherAPI.data.current.weather[0].description;

        console.log(weatherAPI.data.lat, weatherAPI.data.lon)

        res.render("index.ejs", {
            location: location,
            temperature: temperature,
            icon: iconURL,
            weather: weather,
            city: country,
            lat: lat,
            lon: lon,
            locAPI: location_API_KEY 
        })
    }
    catch (error) {
        console.log(error.message);
    }
})

app.listen(port, () => {
    console.log(`app listening to port ${port}`);
})
