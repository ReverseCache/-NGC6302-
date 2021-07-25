const request = require('request')
const dotenv = require('dotenv')
const iplocate = require("node-iplocate")
const RequestIp = require('@supercharge/request-ip')

dotenv.config()

const ip = RequestIp.getClientIp(request)
console.log(ip)

/*
    technically ip should work if run on a server but 
    for heroku since we would route the request thru the server if by anychance got error can consider using: 
    request.headers['x-forwarded-for']
*/


function getCountry() {
    //Alternative ips are Singtel primary , secondary and finally Google's dns
    return iplocate(ip || '165.21.83.88' || '165.21.100.88' || '8.8.8.8')
}

function getWeather() {
    return getCountry().then(results => {
        let weatherapiKey = process.env.WEATHER_API_KEY
        let city = results.country|| results.city || 'singapore';
        //Units = Metric/Imperial
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${weatherapiKey}`
        return new Promise(function(resolve, reject) {
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
                    let humidity = `${api_call_body.name}'s humidity is ${api_call_body.main.humidity}% `;
                    let windgust = `${api_call_body.name}'s windspeed is ${api_call_body.wind.speed} m/s `;
                    let weather = `It's ${renameWeather(api_call_body.weather[0].main)} in ${api_call_body.name}`;
                    let weatherObject = {}
                    weatherObject['temperature_main'] = temperature_main
                    weatherObject['temperature_feels'] = temperature_feels
                    weatherObject['temperature_max'] = temperature_max
                    weatherObject['temperature_min'] = temperature_min
                    weatherObject['air_pressure'] = air_pressure
                    weatherObject['weather_description'] = weather_description
                    weatherObject['humidity'] = humidity
                    weatherObject['windgust'] = windgust
                    weatherObject['weather'] = weather
                    console.log(humidity)
                    console.log(temperature_feels)
                    console.log(weather)
                    console.log(temperature_main)
                    resolve(weatherObject)
                }
            })
        })
    })
}

function renameWeather(weather) {
    if (weather = "Thunderstorm") {
        return "storming"
    } else if (weather = "Drizzle") {
        return "drizzling"
    } else if (weather = "Rain") {
        return "raining"
    } else if (weather = "Snow") {
        return "snowing"
    } else if (weather = "Clear") {
        return "clear"
    } else if (weather = "Clouds") {
        return "cloudy"
    }
}

module.exports.getWeather = getWeather