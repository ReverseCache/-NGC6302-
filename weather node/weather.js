const request = require('request');
const dotenv = require('dotenv');
const iplocate = require("node-iplocate");
const RequestIp = require('@supercharge/request-ip')

dotenv.config();

const ip = RequestIp.getClientIp(request);
console.log(ip)

/*
technically ip should work if run on a server but 
for heroku since we would route the request thru the server if by anychance got error can consider using: 
request.headers['x-forwarded-for']
*/


function getcountry(callback) {
    //Alternative ips are Singtel primary , secondary and finally google's dns
    iplocate(ip || '165.21.83.88' || '165.21.100.88' || '8.8.8.8').then(function (results) {
        //console.log("IP Address: " + results.ip);
        //console.log("Country: " + results.country + " (" + results.country_code + ")");
        //console.log("Continent: " + results.continent);
        //console.log("Organisation: " + results.org + " (" + results.asn + ")");
        //console.log(JSON.stringify(results, null, 2));
        callback(results.city || results.country);
    });

};

function weather(country) {
    let weatherapiKey = process.env.WEATHER_API_KEY;
    let city = country || 'singapore';
    //units= metric / imperial  
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${weatherapiKey}`
    request(url, function (err, response, body) {
        if (err) {
            console.log('error:', error);
        } else {
            let api_call_body = JSON.parse(body)
            let temperature_main = `It's ${api_call_body.main.temp} degrees in ${api_call_body.name}!`;
            let temperature_feels = `It feels like ${api_call_body.main.feels_like} degrees in ${api_call_body.name}`;
            let temperature_max = `Maximum temperature ${api_call_body.main.temp_max} degrees in ${api_call_body.name}`;
            let temperature_min = `Minimum temperature ${api_call_body.main.temp_min} degrees in ${api_call_body.name}`;
            let air_pressure = `Air Pressure in ${api_call_body.name} is ${api_call_body.main.pressure} hPa`;
            let weather_description = `Weather Description is ${api_call_body.weather[0].description}`;
            let humdity = `${api_call_body.name}'s humidity is ${api_call_body.main.humidity}% `;
            let windgust = `${api_call_body.name}'s windspeed is ${api_call_body.wind.speed} m/s `;
            console.log(temperature_feels);
        }
    });
};



getcountry(weather);



