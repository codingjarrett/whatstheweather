//establish API key
var APIKey="cc7f5612738427e24446edc497e9bc63";
//variable declarations
var city="";
//button variables set
var cityFind = $("#finda-city");
var findBtn = $("#look-button");
var delBtn = $("#delete-search");
//variable for current city set
var thisCity = $("#this-city");
//variables for the current weather set
var nowTemp = $("#cTemp");
var nowHum= $("#cHum");
var cWSpd=$("#cWind");
//variable to establish the realm of search
var searchArea=[];
//lists the function calls for the index to operate.
$("#look-button").on("click",disWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",reDisplay);
$("#delete-search").on("click",clearHistory);
//does the city input into the search exist? looks for city in defined parameters. if applicable, a result is returned
function find(c){
    for (var i=0; i<searchArea.length; i++){
        if(c===searchArea[i]){
            return -1;
        }
    }
    return 1;
}
//sets the info to be presented to user upon search request
function disWeather(event){
    event.preventDefault();
    if(cityFind.val().trim()!==""){
        city=cityFind.val().trim();
        console.log(city)
        todayFeel(city);
    }
}
//AJAX for the current weather i.e. the feeling out today
function todayFeel(city){
//sets URL to grab from API
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
//establishes method of fetch style
        method:"GET",
    }).then(function(response){

//sets the parse to display the current weather for the city search and display for the icons
        console.log(response);
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        var today=new Date(response.dt*1000).toLocaleDateString();
        $(thisCity).html(response.name +" ("+today+")" + "<img src="+iconurl+">");
//response is set to display information on the date with the information set in Farenheit.
        var tempFar = (response.main.temp - 273.15) * 1.80 + 32;
        $(nowTemp).html((tempFar).toFixed(2)+"&#8457");
//response is set to display humidity for specified days
        $(nowHum).html(response.main.humidity+"%");
//sets response to display the wind speed for the specified timeframe and converts it to the established MPH
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(cWSpd).html(windsmph+"MPH");
//sets response for forecast
        forecast(response.id);
        if(response.cod==200){
//sets the index to store city names in local storage
            searchArea=JSON.parse(localStorage.getItem("cityHere"));
            console.log(searchArea);
            if (searchArea==null){
                searchArea=[];
                searchArea.push(city);
//adds city to list if city exists and weather is applicable
                localStorage.setItem("cityHere",JSON.stringify(searchArea));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    searchArea.push(city);
                    localStorage.setItem("cityHere",JSON.stringify(searchArea));
                    addToList(city);
                }
            }
        }

    });
}
//sets the function to display the five day forecast with applicable information, responses and icons
function forecast(cityid){
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
//variables set to add icons where applicable
            var daynext= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
//variables set for five day forecast outlook
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempFar=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
            var windsmph= response.list[((i+1)*8)-1].wind.speed;
//adds the responses when called, for the five day forecast. Gives the special identifiers (MPH,%,ETC.) where applicable.
            $("#futDate"+i).html(daynext);
            $("#futImg"+i).html("<img src="+iconurl+">");
            $("#futureTemp"+i).html(tempFar+"&#8457");
            $("#futureHum"+i).html(humidity+"%");
            $("#futureWind"+i).html(windsmph+"MPH");
        }
        
    });
}
//sets function to display the city search history in an unordered list, by most recent search at bottom of list.
function addToList(c){
    var listEl= $("<li>"+c+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c);
    $(".list-group").append(listEl);
}
//allows user to redisplay the city information when city is selected from the localStorage list.
function invokePastSearch(event){
    var liEl=event.target;
//takes the target city to display once clicked.
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        todayFeel(city);
    }

}
//reloads the last city search data for the user to see displayed on screen.
function reDisplay(){
    $("ul").empty();
    var searchArea = JSON.parse(localStorage.getItem("cityHere"));
    if(searchArea!==null){
        searchArea=JSON.parse(localStorage.getItem("cityHere"));
        for(i=0; i<searchArea.length;i++){
            addToList(searchArea[i]);
        }
        city=searchArea[i-1];
        todayFeel(city);
    }

}
//resets the index so that all locally stored information is cleared from display.
function clearHistory(event){
    event.preventDefault();
    searchArea=[];
//removes cities from the saved list
    localStorage.removeItem("cityHere");
    document.location.reload();

}