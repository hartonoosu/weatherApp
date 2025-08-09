import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const port = 3000;
const app = express();
const weather_API_KEY = process.env.VITE_WEATHER_API_KEY;
const location_API_KEY = process.env.VITE_LOCATION_API_KEY;

//CONVERT OFFSETSECONDS INTO READABLE TIME
function convertTime(offset){
 const nowUTC = new Date();
    const localTime = new Date(nowUTC.getTime() + offset *1000);
    const hours = localTime.getUTCHours().toString().padStart(2,'0');
    const minutes = localTime.getUTCMinutes().toString().padStart(2,'0');

    return `${hours}:${minutes}`;
}

//CONVERT DT INTO READABLE TIME
function convertDT(dt, offset){
    const date = new Date((dt + offset) * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    });
}

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
        locAPI: location_API_KEY,
        humidity: "-",
        wind: "-",
        feels_like: "-",
        uv: "-",
        currentTime: "-",
        // dateTime: "-",
        tempts: [],
        icons:[],
        dt:[]
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
        const humidity = weatherAPI.data.current.humidity;
        const wind = weatherAPI.data.current.wind_speed;
        const feels_like = weatherAPI.data.current.feels_like;
        const uv = weatherAPI.data.current.uvi;

        const offsetSeconds = weatherAPI.data.timezone_offset;
        const currentTime = convertTime(offsetSeconds);
        
        // const dt = weatherAPI.data.hourly[1].dt;

        const arr = []
        for(let i = 1;i<11;i++){
            arr.push({
                dt: convertDT(weatherAPI.data.hourly[i].dt, offsetSeconds),
                tempts: weatherAPI.data.hourly[i].temp,
                icons: `https://openweathermap.org/img/wn/${weatherAPI.data.hourly[i].weather[0].icon}@2x.png`,
            })
        }

        console.log(arr)
        // const dateTime = convertDT(arr[0].dt, offsetSeconds);

        res.render("index.ejs", {
            location: location,
            temperature: temperature,
            icon: iconURL,
            weather: weather,
            city: country,
            lat: lat,
            lon: lon,
            locAPI: location_API_KEY,
            humidity: humidity,
            wind: wind,
            feels_like: feels_like,
            uv: uv,
            currentTime: currentTime,
            // dateTime: dateTime,
            dt: arr,
            tempts: arr,
            icons: arr
        })
    }
    catch (error) {
        console.log(error.message);
    }
})

app.listen(port, () => {
    console.log(`app listening to port ${port}`);
})
