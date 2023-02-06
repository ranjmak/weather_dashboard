$(document).ready(function () {
  var APIKey = "&appID=f435651d3e7405fd1997e707e75f997c";
  var baseURL = "https://api.openweathermap.org/data/2.5/forecast?";

  var cityData = [];

  function getStoredData(city) {
    fetchStoredData();
    var index = -1;
    for (var i=0; i<cityData.length; i++) {
      console.log("name: ", i, cityData[i].name);
      if (cityData[i].name == city) {
        index = i;
      }
    }
    return index;
  }

  function fetchStoredData() {
    var tempCityData = localStorage.getItem("cityData");
    if (tempCityData) {
      cityData = JSON.parse(tempCityData);
    }
    $(".list-group").empty();
    for (var i=0; i<cityData.length; i++) {

      $(".list-group").append(
                  $("<button>").attr({class: "btn btn-outline btn-xl search-button"}).text(cityData[i].name));
    }
  }

  fetchStoredData();

  function storeCitiesData() {
    localStorage.setItem("cityData", JSON.stringify(cityData));
  }

  // listener for the search submit button
  $(document).on("click", ".search-button", function (event) {
    event.preventDefault();

    var city = $("#search-input").val().trim();

    var savedCity = $(event.target).text();

    if (!city && savedCity != $("#search-button").text()) {
      city = $(event.target).text();
    }
    else if (!city) {
      console.log("early return");
      return;
    }
    else {
      $("#search-input").val("");
    }

    var index = getStoredData(city);

    if (index < 0) {
      var queryURL = "https://api.openweathermap.org/geo/1.0/direct?q=";
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

      // the temperature (converted from Kelvin)
      var forecast = response.list;
      var temperature = (forecast[0].main.temp - 273.15).toFixed(0);
      var today = moment(forecast[0].dt_txt).format("DD/MM/YYYY");
      // transfer content to HTML

      var weatherImg =
        "<img width='50px' height='50px' src='https://openweathermap.org/img/wn/" +
        forecast[0].weather[0].icon +
        "@2x.png'>";
      $(".city").html(
        "<h4>" +
          cityData[index].name +
          " (" +
          today +
          ") " +
          weatherImg +
          "</h4>"
      );
      $(".temp").text("temprature: " + temperature + " °C");
      $(".wind").text("Wind: " + forecast[0].wind.speed + " KPH");
      $(".humidity").text("humidity: " + forecast[0].main.humidity + "%");

      $("#forecast").empty();

      for (var i in forecast) {
        var date = moment(forecast[i].dt_txt);

        // note that weather data is available every 3 hrs, though we will only use data from 12 noon for the forecasts
        if (moment(date).format("HH:mm:ss") == "12:00:00") {
          var col = $("<div>").addClass("col-md-2 col-12");
          var card = $("<div>").addClass("card");
          var body = $("<div>").addClass("card-body");
          var title = $("<h6>")
            .addClass("card-title")
            .text(
              moment(date).format("dddd") +
                "\n" +
                moment(date).format("DD/MM/YYYY")
            );
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
            .html("Wind: " + forecast[i].wind.speed + " KPH");
          var humidity = $("<p>")
            .addClass("card-text")
            .html("Humidity: " + forecast[i].main.humidity + "%");
          //var weather = $("<p>").addClass("card-text").html("Weather: " + forecast[i].weather[0].description);
          body.append(title, weatherImg, temperature, wind, humidity);
          card.append(body);
          col.append(card);
          $("#forecast").append(col);
        }
      }
      console.log("finished with render");
      return;
    });
    console.log("returning from render")
    return;
  }
});
