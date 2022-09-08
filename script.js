function initPage() {
  var cityEl = document.getElementById("enter-city");
  var searchEl = document.getElementById("search-button");
  var clearEl = document.getElementById("clear-history");
  var nameEl = document.getElementById("city-name");
  var currentPicEl = document.getElementById("current-pic");
  var currentTempEl = document.getElementById("temperature");
  var currentHumidityEl = document.getElementById("humidity");
  var currentWindEl = document.getElementById("wind-speed");
  var currentUVEl = document.getElementById("UV-index");
  var historyEl = document.getElementById("history");
  var fivedayEl = document.getElementById("fiveday-header");
  var todayweatherEl = document.getElementById("today-weather");
  var searchHistory = JSON.parse(localStorage.getItem("search")) || [];

  // Assigning a unique API to a variable
  var APIKey = "84b79da5e5d7c92085660485702f4ce8";

  function getWeather(cityName) {
      // Execute a current weather get request from open weather api
      var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
      axios.get(queryURL)
          .then(function (response) {

              todayweatherEl.classList.remove("d-none");

              // Parse response to display current weather
              var currentDate = new Date(response.data.dt * 1000);
              var day = currentDate.getDate();
              var month = currentDate.getMonth() + 1;
              var year = currentDate.getFullYear();
              nameEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
              var weatherPic = response.data.weather[0].icon;
              currentPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
              currentPicEl.setAttribute("alt", response.data.weather[0].description);
              currentTempEl.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
              currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
              currentWindEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
              
              // Get UV Index
              var lat = response.data.coord.lat;
              var lon = response.data.coord.lon;
              var UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
              axios.get(UVQueryURL)
                  .then(function (response) {
                      var UVIndex = document.createElement("span");
                      
                      // When UV Index is good, shows green, when ok shows yellow, when bad shows red
                      if (response.data[0].value < 4 ) {
                          UVIndex.setAttribute("class", "badge badge-success");
                      }
                      else if (response.data[0].value < 8) {
                          UVIndex.setAttribute("class", "badge badge-warning");
                      }
                      else {
                          UVIndex.setAttribute("class", "badge badge-danger");
                      }
                      console.log(response.data[0].value)
                      UVIndex.innerHTML = response.data[0].value;
                      currentUVEl.innerHTML = "UV Index: ";
                      currentUVEl.append(UVIndex);
                  });
              
              // Get 5 day forecast for this city
              var cityID = response.data.id;
              var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
              axios.get(forecastQueryURL)
                  .then(function (response) {
                      fivedayEl.classList.remove("d-none");
                      
                      //  Parse response to display forecast for next 5 days
                      var forecastEls = document.querySelectorAll(".forecast");
                      for (i = 0; i < forecastEls.length; i++) {
                          forecastEls[i].innerHTML = "";
                          var forecastIndex = i * 8 + 4;
                          var forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                          var forecastDay = forecastDate.getDate();
                          var forecastMonth = forecastDate.getMonth() + 1;
                          var forecastYear = forecastDate.getFullYear();
                          var forecastDateEl = document.createElement("p");
                          forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                          forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                          forecastEls[i].append(forecastDateEl);

                          // Icon for current weather
                          var forecastWeatherEl = document.createElement("img");
                          forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                          forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                          forecastEls[i].append(forecastWeatherEl);
                          var forecastTempEl = document.createElement("p");
                          forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";
                          forecastEls[i].append(forecastTempEl);
                          var forecastHumidityEl = document.createElement("p");
                          forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                          forecastEls[i].append(forecastHumidityEl);
                      }
                  })
          });
  }

  // Get history from local storage if any
  searchEl.addEventListener("click", function () {
      var searchTerm = cityEl.value;
      getWeather(searchTerm);
      searchHistory.push(searchTerm);
      localStorage.setItem("search", JSON.stringify(searchHistory));
      renderSearchHistory();
  })

  // Clear History button
  clearEl.addEventListener("click", function () {
      localStorage.clear();
      searchHistory = [];
      renderSearchHistory();
  })

  function k2f(K) {
      return Math.floor((K - 273.15) * 1.8 + 32);
  }

  function renderSearchHistory() {
      historyEl.innerHTML = "";
      for (var i = 0; i < searchHistory.length; i++) {
          var historyItem = document.createElement("input");
          historyItem.setAttribute("type", "text");
          historyItem.setAttribute("readonly", true);
          historyItem.setAttribute("class", "form-control d-block bg-white");
          historyItem.setAttribute("value", searchHistory[i]);
          historyItem.addEventListener("click", function () {
              getWeather(historyItem.value);
          })
          historyEl.append(historyItem);
      }
  }

  renderSearchHistory();
  if (searchHistory.length > 0) {
      getWeather(searchHistory[searchHistory.length - 1]);
  }
  
}

initPage();