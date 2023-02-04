$(document).ready(function() {


  var APIKey = "&APPID=f435651d3e7405fd1997e707e75f997c";

  var baseURL = "https://api.openweathermap.org/data/2.5/forecast";

  $("#search-button").on("click", function(event) {

      event.preventDefault();

      var searchInput = "?q="+$("#search-input").val().trim();
      var queryURL = baseURL + searchInput + APIKey;
      console.log(queryURL);
      $.ajax({
          url: queryURL,
          method: "GET"
      }).then(function(response){
      console.log(response);

          // the temperature (converted from Kelvin)
          var forecast = response.list;
          var temperature = (forecast[0].main.temp - 273.15).toFixed(2);
          var today = moment(forecast[0].dt_txt).format("DD/MM/YYYY");
          // transfer content to HTML

          var weatherImg = "<img width='30' height='30' src='https://openweathermap.org/img/wn/"+forecast[0].weather[0].icon+"@2x.png'>";
          $(".city").html("<p>"+response.city.name+" ("+today+") " + weatherImg + "</p>");
          $(".temp").text("temprature: "+temperature + " °C");
          $(".wind").text("Wind: "+forecast[0].wind.speed + " KPH");
          $(".humidity").text("humidity: "+forecast[0].main.humidity + "%");

          $("#forecast").empty();

          for (var i in forecast) {
            var date = moment(forecast[i].dt_txt);

            if (moment(date).format("HH:mm:ss") == "12:00:00") {
              var col = $("<div>").addClass("col-sm-2");
              var card = $("<div>").addClass("card");
              var body = $("<div>").addClass("card-body");
              var title = $("<h6>").addClass("card-title").text(moment(date).format("dddd")+"\n"+moment(date).format("DD/MM/YYYY"));
              weatherImg = $("<img>").attr({width: "30", height: "30", src: "https://openweathermap.org/img/wn/"+forecast[i].weather[0].icon+"@2x.png"});
              temperature = $("<p>").addClass("card-text").html("Temp: " + (forecast[i].main.temp - 273.15).toFixed(2) + " &#8451;");
              var wind = $("<p>").addClass("card-text").html("Wind: " + forecast[i].wind.speed + " KPH");
              var humidity = $("<p>").addClass("card-text").html("Humidity: " + forecast[i].main.humidity + "%");
              //var weather = $("<p>").addClass("card-text").html("Weather: " + forecast[i].weather[0].description);
              body.append(title, weatherImg, temperature, wind, humidity);
              card.append(body);
              col.append(card);
              $("#forecast").append(col);
            }
          }

      });

  });

});
