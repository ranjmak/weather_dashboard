$(document).ready(function () {
  var APIKey = "&appID=f435651d3e7405fd1997e707e75f997c";
  var baseURL = "https://api.openweathermap.org/data/2.5/forecast?";

  var cityData = []; // main data structure for search city history

  // given a city name, the function fetch locally stored data and if any present, loop through to see if the 
  // city data is already there. returns -1 if not found or the index of the found city
  function getStoredData(city) {
    fetchStoredData();
    var index = -1;
    for (var i=0; i<cityData.length; i++) {

      if (cityData[i].name == city) {
        index = i;
      }
    }
    return index;
  }

  // function that does the fetching, checking and rendering of the search history
  function fetchStoredData() {
    var tempCityData = localStorage.getItem("cityData");
    if (tempCityData) {
      cityData = JSON.parse(tempCityData);
      $("#history").empty();
      for (var i=0; i<cityData.length; i++) {
        $("#history").append(
                    $("<button>").attr({class: "btn btn-outline btn-xl search-button"}).text(cityData[i].name));
      }
      // add the clear history button to make it easier for users to clear the search history, specially whilst testing
      $("#history").prepend($("<button>").attr({class: "btn btn-outline btn-xl clear"}).text("clear history"));
    }
  }

  // clear hostory listener - needs to delegate since the search history/clear button may not be rendered yet
  $(document).on("click", ".clear", function(event) {
    event.preventDefault();
    cityData = [];
    localStorage.removeItem("cityData")
    $("#history").empty();
    fetchStoredData();
  });

  fetchStoredData();

  // store city data to local storage
  function storeCitiesData() {
    localStorage.setItem("cityData", JSON.stringify(cityData));
  }

  // capitalise the city name - this was from stackoverflow and was the best solution for capitalising the city names
  // we need this to aide the logic later when comparisons are made between whats typed in and whats in the data retrieved from the api call
  function capitaliseCity(city) {
    return city
      .replace(/(\B)[^ ]*/g, match => (match.toLowerCase()))
      .replace(/^[^ ]/g, match => (match.toUpperCase()));
  }
  // listener for the search submit button - the trigger for the app to come alive!
  $(document).on("click", ".search-button", function (event) {
    event.preventDefault();

    var city = $("#search-input").val().trim(); // get the city value
    city = capitaliseCity(city);
    var savedCity = $(event.target).text(); // get the text of the button (will be a city name or 'Search')
    if (!city && savedCity != $("#search-button").text()) {
      city = $(event.target).text(); // set city name to search history city
    }
    else if (!city) {
      return; // city name has already been set to input value, so just return
    }
    else {
      $("#search-input").val(""); // clear the input area
    }
    var index = getStoredData(city); // get the stored city data if present
    if (index < 0) { // main index to control whether new city data is used or city history data is used
      var queryURL = "https://api.openweathermap.org/geo/1.0/direct?q=";

      // api call to get the latitude & longitude coordinates for the given city. push it to the cityData and store it locally
      // set the index to the last data item in the array and call the get and render function, else just call the get and 
      // render function with the given index
      $.ajax({ 
        url: queryURL + city + APIKey,
        method: "GET",
      }).then(function (response) {
        cityData.push({
          name: response[0].name,
          lat: response[0].lat,
          lon: response[0].lon,
        });
        storeCitiesData();
        fetchStoredData();
        index = cityData.length - 1;
        getAndRenderData(index);


      });
    }
    
    else {
      getAndRenderData(index);
    }
  });

  // function gets data from the API call given the right index to city's lat & lon 
  function getAndRenderData(index) {
    queryURL =
      baseURL +
      "lat=" +
      cityData[index].lat +
      "&lon=" +
      cityData[index].lon +
      APIKey;

    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      // the temperature (converted from Kelvin), using moment() to format for right day
      var forecast = response.list;
      var temperature = (forecast[0].main.temp - 273.15).toFixed(0);
      var today = moment(forecast[0].dt_txt).format("DD/MM/YYYY");

      // set up HTML for todays data and render
      var weatherImg =
        "<img width='50px' height='50px' src='https://openweathermap.org/img/wn/" +
        forecast[0].weather[0].icon +
        "@2x.png'>";
      $(".city").html(
        "<h2>" +
          cityData[index].name +
          " (" +
          today +
          ") " +
          weatherImg +
          "</h2>"
      );
      $(".temp").text("temprature: " + temperature + " °C");
      $(".wind").text("Wind: " + forecast[0].wind.speed + " KPH");
      $(".humidity").text("humidity: " + forecast[0].main.humidity + "%");

      // now set up html for the forecast area
      $("#forecast").empty();
      $("#forecastTitle").html("<h2>5 Day Forecast</h2>");
      
      //loop through the data returned from the api call and add the relevant data to forecast section
      for (var i in forecast) {
        var date = moment(forecast[i].dt_txt);

        // note that weather data is available every 3 hrs, though we will only use data from 12 noon for the forecasts
        if (moment(date).format("HH:mm:ss") == "12:00:00") {
          var col = $("<div>").addClass("col-md-2 col-12");
          var card = $("<div>").addClass("card");
          var body = $("<div>").addClass("card-body");
          var forecastDay = $("<h6>")
            .addClass("card-title")
            .text(moment(date).format("dddd"))
          var forecastDate = $("<h6>").addClass("card-title").text(moment(date).format("DD/MM/YYYY"));
          weatherImg = $("<img>").attr({
            width: "50px",
            height: "50px",
            src:
              "https://openweathermap.org/img/wn/" +
              forecast[i].weather[0].icon +
              "@2x.png",
          });
          temperature = $("<p>")
            .addClass("card-text")
            .html(
              "Temp: " +
                (forecast[i].main.temp - 273.15).toFixed(0) +
                " &#8451;"
            );
          var wind = $("<p>")
            .addClass("card-text")
            .html("Wind: " + forecast[i].wind.speed.toFixed(2) + " KPH");
          var humidity = $("<p>")
            .addClass("card-text")
            .html("Humidity: " + forecast[i].main.humidity.toFixed(2) + "%");
          //var weather = $("<p>").addClass("card-text").html("Weather: " + forecast[i].weather[0].description);
          body.append(forecastDay, forecastDate, weatherImg, temperature, wind, humidity);
          card.append(body);
          col.append(card);
          $("#forecast").append(col);
        }
      }
      return;
    });
    return;
  }
});
