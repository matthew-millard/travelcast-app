var searchForm = document.querySelector('[data-js="search-form"]')
var searchInput = searchForm.querySelector('[data-js="city-search"]')
var currentWeatherEl = document.querySelector('[data-js="current-weather-container"]')
var toggleAccordion = searchForm.querySelector('[data-js="search-history-title"]')
var historyListEl = searchForm.querySelector('[data-js="history-tab"]')
var errorMessageEl = searchForm.querySelector('[data-js="error-message"]')
var openWeatherKey = '1ed4313db2c7eabb04ea9a9f7ac7e55e'
var prevSearchedCities = {}
var prefixLocalStorage = 'TravelCast-Search-History'

// Everytime the page loads, render all previously searched cities
renderAllHistoryTabs()

// API call for 5 day weather forecast
function getFiveDayForecast(lat, lon) {
	fiveDayForecastURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exlude={current,minutely,hourly,alerts}&units=metric&appid=${openWeatherKey}`
	fetch(fiveDayForecastURL)
		.then(response => {
			if (response.ok) {
				response.json().then(function (data) {
					renderFiveDayForcastData(data)
				})
			} else {
				console.log(response.statusText)
			}
		})
		.catch(error => {
			console.error(error)
		})
}

// Display five day forecast data
function renderFiveDayForcastData(data) {
	var forecastDayEl = Array.from(document.querySelectorAll('[data-js="forecast-day"]'))
	var i = 1
	forecastDayEl.forEach(day => {
		var date = getDate(data, i)
		var dateEl = day.querySelector('[data-js="forecast-date"]')
		dateEl.innerHTML = `<b>${date}</b>`

		var iconCode = data.daily[i].weather[0].icon
		var iconAlt = data.daily[i].weather[0].description
		var iconEl = day.querySelector('[data-js="forecast-icon"]')
		iconEl.setAttribute('src', `https://openweathermap.org/img/wn/${iconCode}.png`)
		iconEl.setAttribute('alt', `${iconAlt} icon.`)

		var temperatureEl = day.querySelector('[data-js="forecast-temp"]')
		temperatureEl.innerHTML = `Temp: <b>${Math.round(data.daily[i].temp.day)}&deg;C</b>`

		var windEl = day.querySelector('[data-js="forecast-wind"]')
		windEl.innerHTML = `Wind Speed: <b>${Math.round(data.daily[i].wind_speed)} m/s</b>`

		var humidityEl = day.querySelector('[data-js="forecast-humidity"]')
		humidityEl.innerHTML = `Humidity: <b>${data.daily[i].humidity}%</b>`

		var fiveDayForecastContainer = document.querySelector('[data-js="five-day-forecast-container"]')
		fiveDayForecastContainer.classList.remove('display-none')

		i++
	})
}

// Get the date using timestamp
function getDate(data, i) {
	var timeStamp = data.daily[i].dt
	var date = new Date(timeStamp * 1000)
	return date.toLocaleDateString()
}

// API call to get the current weather conditions
function getCurrentWeatherConditions(lat, lon, cityName) {
	var currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric`

	fetch(currentWeatherURL)
		.then(response => {
			if (response.ok) {
				response.json().then(data => {
					console.log(data)
					var name = cityName
					var temp = Math.round(data.main.temp)
					var wind = Math.round(data.wind.speed)
					var humidity = Math.round(data.main.humidity)
					var iconCode = data.weather[0].icon
					getCityTimeDate(lat, lon)
					renderCurrentWeatherData(name, temp, wind, humidity, iconCode)
					getFiveDayForecast(lat, lon)
				})
			} else {
				console.log(response.statusText)
			}
		})
		.catch(error => {
			console.error(error)
		})
}

// Display current weather data
function renderCurrentWeatherData(name, temp, wind, humid, iconCode) {
	var cityEl = currentWeatherEl.querySelector('[data-js="current-city-name"]')
	var temperatureEl = currentWeatherEl.querySelector('[data-js="current-temp"]')
	var windSpeedEl = currentWeatherEl.querySelector('[data-js="current-wind"]')
	var humidityEl = currentWeatherEl.querySelector('[data-js="current-humidity"]')
	var weatherIconEl = currentWeatherEl.querySelector('[data-js="current-weather-icon"]')

	weatherIconEl.setAttribute('src', `https://openweathermap.org/img/wn/${iconCode}.png`)
	cityEl.textContent = `${name},`
	temperatureEl.innerHTML = `Temp: <b>${temp} &deg;C</b>`
	windSpeedEl.innerHTML = `Wind Speed: <b>${wind} m/s</b>`
	humidityEl.innerHTML = `Humidity: <b>${humid}%</b>`
	currentWeatherEl.classList.remove('display-none')
}

// Get local time and date of location
function getCityTimeDate(lat, lon) {
	var apiKey = 'AIzaSyB9BGAUD5hAZHJILdxzLSWht4KXvHtA8NE'
	var targetDate = new Date()
	var timeStamp = targetDate.getTime() / 1000 + targetDate.getTimezoneOffset() * 60
	var googleTimeZoneAPI = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${timeStamp}&key=${apiKey}`

	fetch(googleTimeZoneAPI)
		.then(response => response.json())
		.then(data => {
			var offsets = data.dstOffset * 1000 + data.rawOffset * 1000
			var localDate = new Date(timeStamp * 1000 + offsets)
			var date = localDate.toDateString()
			var dateEl = currentWeatherEl.querySelector('[data-js="current-date"]')
			dateEl.innerHTML = `<b>${date}</b>`
			var time = localDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
			time = `Local Time: <b>${time}</b>`
			var timeEl = currentWeatherEl.querySelector('[data-js="current-time"]')
			timeEl.innerHTML = time
		})
		.catch(error => {
			console.error(error)
			return null
		})
}

// Get the user's search input
var searchCityHandler = function (event) {
	event.preventDefault()

	var cityName = searchInput.value.trim()
	searchInput.value = ''

	if (!cityName) {
		showErrorMessage()
		return
	} else {
		clearErrorMessage()
		getCityCoordinates(cityName)
	}
}

// Call geocoding API and retrieve city coordinates
var getCityCoordinates = function (cityName) {
	var geoCodingURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${openWeatherKey}`

	fetch(geoCodingURL)
		.then(response => {
			if (response.ok) {
				response.json().then(data => {
					console.log(data)
					var cityCoordinates = {
						lon: data[0].lon,
						lat: data[0].lat,
					}
					getCurrentWeatherConditions(cityCoordinates.lat, cityCoordinates.lon, cityName)

					var newCity = {
						lat: cityCoordinates.lat,
						lon: cityCoordinates.lon,
					}

					prevSearchedCities = loadFromStorage()
					prevSearchedCities[cityName] = newCity
					saveToStorage(prevSearchedCities)
					clearHistory()
					renderAllHistoryTabs()
				})
			} else {
				console.log(response.statusText)
			}
		})
		.catch(error => {
			console.error(error)
		})
}

// Save city coordinates to local storage
var saveToStorage = function (prevSearchedCities) {
	localStorage.setItem(prefixLocalStorage, JSON.stringify(prevSearchedCities))
}

// load city coordinates from local storage
function loadFromStorage() {
	var cities = localStorage.getItem(prefixLocalStorage)
	if (cities) {
		return JSON.parse(cities)
	} else {
		return {}
	}
}

function clearHistory() {
	historyListEl.innerHTML = ''
}

// render all history tabs
function renderAllHistoryTabs() {
	var history = loadFromStorage()
	var historyArr = Object.entries(history)
	historyArr.forEach(city => {
		var tab = document.createElement('a')
		tab.innerText = city[0]
		tab.classList.add('search-history')
		tab.setAttribute('city', city[0])
		historyListEl.appendChild(tab)
	})
}

function showErrorMessage() {
	errorMessageEl.classList.add('error-message')
	errorMessageEl.innerText = '* Please enter a city name.'
}

function clearErrorMessage() {
	errorMessageEl.innerText = ''
}

// Search for a city - event handler
searchForm.addEventListener('submit', searchCityHandler)

// Toggle search history accordion
toggleAccordion.addEventListener('click', () => {
	var historyTab = searchForm.querySelector('[data-js="history-tab"]')
	var plusIndicator = searchForm.querySelector('.fa-plus')
	var minusIndicator = searchForm.querySelector('.fa-minus')
	historyTab.classList.toggle('display-none')
	plusIndicator.classList.toggle('display-none')
	minusIndicator.classList.toggle('display-none')
})

// History list event handler
historyListEl.addEventListener('click', event => {
	if (event.target.matches('a')) {
		var cityName = event.target.getAttribute('city')
		getCityCoordinates(cityName)
	} else {
		return
	}
})
