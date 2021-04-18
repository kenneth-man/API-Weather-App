'use strict';

//DOM selection variables
const videoDisp = document.querySelector('#video-back');
const countryDisp = document.querySelector('#country');
const temperatureDisp = document.querySelector('#temp');
const iconDisp = document.querySelector('.icon');
const iconColourDisp = document.querySelector('#icon-colour');

const countriesCont = document.querySelector('#countries');
const countriesBtn = document.querySelector('#countries-confirm');

//user's current latitude and longitude variables
let currLatitude;
let currLongitude;

//data retrieved from OpenWeatherMap API
let retrievedWeather;
let retrievedTemperature;
let retrievedCountry;

//OpenWeatherMap API free key
const weatherApiKey = 'c4ef6fa327614f918c4fa7722f93afa9';

//OpenWeatherMap API weather name keys and svg file endings (unable to change svg icon urls to match keys)
const weatherIcons = {
    Thunderstorm: 'flash',
    Rain: 'water',
    Snow: 'snowflake-o',
    Fog: 'air',
    Clear: 'light-up',
    Clouds: 'icloud',
};

//getting user's current latitude and longitude 
//Geolocaton API - https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
const getCurrLocation = () => {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currLongitude = position.coords.longitude;
                currLatitude = position.coords.latitude;
            },
            () => alert('Could not get your current location')
        );
    }
}

//getting a country's latitude and longitude
//REST Countries API - https://restcountries.eu/
const getCountryCoords = async (country) => {
    try {
        const response = await fetch(`https://restcountries.eu/rest/v2/name/${country}`);
        const data = await response.json();
        currLatitude = data[0].latlng[0];
        currLongitude = data[0].latlng[1];

        getLocationWeather();

        //get all country names (for reference values in select element)...
        // const all = await fetch(`https://restcountries.eu/rest/v2/all`);
        // const data = await all.json();
        // console.log(data);
        
    } catch (err) {
        alert(`${err}\nPlease reload the page`);
    }
}

//getting user's current weather data based on latitude and longitude
//OpenWeatherMap API - https://openweathermap.org/api
const getLocationWeather = () => {
    try {
        //small delay needed, for 'getCurrLocation()' to initialize 'currLatitude' and 'currLongitude' (doesn't get coords instantly)
        setTimeout(async () => {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${currLatitude}&lon=${currLongitude}&appid=${weatherApiKey}`);
            const data = await response.json();

            retrievedWeather = data.weather[0].main;
            //api gives temperature in Kelvin; converting to degrees Celsius
            retrievedTemperature = Math.round(data.main.temp - 273.15);
            retrievedCountry = data.sys.country;
            //console.log(retrievedWeather, retrievedTemperature, retrievedCountry);
            
            updateUI();

            return;
        }, 1000);
    } catch (err) {
        alert(`${err}\nPlease reload the page`);
    }
}

//update the country name, temperature, icon, icon colour and video background
const updateUI = () => {
    videoDisp.setAttribute('src', `./res/${retrievedWeather}.mp4`);
    countryDisp.textContent = `${retrievedCountry}`;
    temperatureDisp.textContent = `${retrievedTemperature}`;
    swapPrevIconColour();

    //when accessing an object property as a string, do like e.g. objectName[...string...];
    iconDisp.setAttribute('href', `./res/symbol-defs.svg#icon-${weatherIcons[retrievedWeather]}`);
}

//if icon classList already contains a 'color-...' class, remove it and add the current country's weather colour
const swapPrevIconColour = () => {
    const prevIconColourClass = iconColourDisp.classList[3];
    if(prevIconColourClass.startsWith('colour-')){
        iconColourDisp.classList.remove(prevIconColourClass);
    };

    iconColourDisp.classList.add(`colour-${retrievedWeather}`);
}

//initialization function
const init = () => {
    getCurrLocation();
    getLocationWeather();
}

init();

//confirm change button to get weather for selected country
countriesBtn.addEventListener('click', (e) => {
    //prevents <input> element from refreshing page
    e.preventDefault();

    if(countriesCont.options[countriesCont.selectedIndex].value != 'current'){
        const selectedCountry = countriesCont.options[countriesCont.selectedIndex].value;
        getCountryCoords(selectedCountry);
    } 
})