// event listeners

//please leave this first above other event listeneres for correct server communication
document.getElementById("save-settings-form").addEventListener("submit", function(event) {
    var zipInput = document.getElementById("location-input").value;
    document.getElementById("hidden-zipCode").value = zipInput;
  console.log('Hidden zipCode set to:', document.getElementById("hidden-zipCode").value);
});

document.addEventListener('DOMContentLoaded', function() {
document.getElementById("location-form").addEventListener("submit", function(event) {
  event.preventDefault();
  let zipCode = document.getElementById("location-input").value;
  let countryCode = "US"; // default to US
  
  const messageElement = document.querySelector(".text-danger");
  if (messageElement) {
    messageElement.textContent = ""; // Clear the message
  }
  getCoordinates(zipCode, countryCode);
})
});

document.getElementById("getWeather-favorite").addEventListener("click", function(event) {
  event.preventDefault();
  const selectElement = document.getElementById("location-select");
  const selectedZip = selectElement.value;
  getCoordinates(selectedZip, "US");
});


// functions
async function getCoordinates(zipCode, countryCode) {
  const apiKey = "a8c4a43e814c9a8328e7e3d2ca0bcf68";
  const url = `https://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},${countryCode}&appid=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.lat && data.lon) {
        getWeather(data.lat, data.lon);
        document.getElementById("error-message").textContent = "";
      } else {
        document.getElementById("error-message").textContent = "Invalid zip code";
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      document.getElementById("error-message").textContent = "Failed to fetch weather data.";
    }
  }

async function getWeather(lat, lon) {
  const apiKey = "a8c4a43e814c9a8328e7e3d2ca0bcf68";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data.");
  }
}

function displayWeather(data) {
  const locationName = `${data.name}, ${data.sys.country}`;
  const temperature = Math.round(data.main.temp);
  let weatherCondition = data.weather[0].main.toLowerCase();

  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const windDirection = data.wind.deg;
  const pressure = data.main.pressure;
  const visibility = (data.visibility / 1000).toFixed(2);
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  const feelsLike = Math.round(data.main.feels_like);
  const description = data.weather[0].description;
  const cloudiness = data.clouds.all;

  const features = Array.from(document.querySelectorAll('input[name="features"]:checked')).map(input => input.value);
  const unit = features.includes('C') ? 'C' : 'F';

  document.getElementById('location-display').innerText = locationName;

  let tempDisplay = `${temperature} °F, Feels like ${feelsLike} °F`;
  if (unit === 'C') {
    tempDisplay = `${toCelsius(temperature)} °C, Feels like ${toCelsius(feelsLike)} °C`;
  }
  document.getElementById('temp-display').innerText = tempDisplay;

  let additionalInfoHTML = '';

  if (features.includes('Humidity')) {
    additionalInfoHTML += `<p>Humidity: ${humidity}%</p>`;
  }
  if (features.includes('Wind')) {
    additionalInfoHTML += `<p>Wind: ${windSpeed} m/s, Direction: ${windDirection} degrees</p>`;
  }
  if (features.includes('Pressure')) {
    additionalInfoHTML += `<p>Pressure: ${pressure} hPa</p>`;
  }
  if (features.includes('Visibility')) {
    additionalInfoHTML += `<p>Visibility: ${visibility} km</p>`;
  }
  if (features.includes('Sunrise')) {
    additionalInfoHTML += `<p>Sunrise: ${sunrise}</p>`;
  }
  if (features.includes('Sunset')) {
    additionalInfoHTML += `<p>Sunset: ${sunset}</p>`;
  }
  if (features.includes('Description')) {
    additionalInfoHTML += `<p>Description: ${description}</p>`;
  }
  if (features.includes('Cloudiness')) {
    additionalInfoHTML += `<p>Cloudiness: ${cloudiness}%</p>`;
  }

  document.getElementById('additional-info').innerHTML = additionalInfoHTML;

  setBackground(weatherCondition);
}

function toCelsius(fahrenheit) {
  return Math.round((fahrenheit - 32) * (5 / 9));
}

function setBackground(condition) {
  const container = document.getElementById("weather-result");
  switch (condition) {
    case 'clear':
      container.style.backgroundImage = "url('img/clear_sky.jpeg')";
      break;
    case 'clouds':
      container.style.backgroundImage = "url('img/cloudy.jpeg')";
      break;
    case 'rain':
      container.style.backgroundImage = "url('img/rain.jpeg')";
      break;
    case 'snow':
      container.style.backgroundImage = "url('img/snow.jpeg')";
      break;
    default:
      container.style.backgroundImage = "url('img/default_weather.png')";
  }
}


