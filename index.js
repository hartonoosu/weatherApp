import express from "express";
import axios from "axios";

const port = 3000;
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    res.render("index.ejs", {
        location: "dunno yet", 
        temperature: "-", 
        icon:"?",
        weather: "weather",
        city: "city"
    })
})

app.post("/get-forecast", async (req,res) => {
    const apiKey = "1ff2e987c420ff26cea44dde73aa4efa";

    // if (!lat || !lon){
    //     lat = (Math.random()*180 - 90).toFixed(6);
    //     lon = (Math.random()*360 - 90).toFixed(6);
    // }

    try {
        const city = req.body.city;
        const locationAPI = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
        const country = locationAPI.data[0].state;
        const lat = locationAPI.data[0].lat;
        const lon = locationAPI.data[0].lon;

        const weatherAPI = await axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude={part}&units=metric&appid=${apiKey}`)

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
            lon: lon 
        })
    }
    catch (error) {
        console.log(error.message);
    }
})

app.listen(port, () => {
    console.log(`app listening to port ${port}`);
})
