var searchForm = document.querySelector('[data-js="search-form"]')
var searchInput = searchForm.querySelector('[data-js="city-search"]')
var currentWeatherEl = document.querySelector('[data-js="current-weather-container"]')
var historyListEl = searchForm.querySelector('[data-js="history-tab"]')
var toggleAccordion = searchForm.querySelector('[data-js="search-history-title"]')
var openWeatherKey = '1ed4313db2c7eabb04ea9a9f7ac7e55e'

function getCurrentWeatherConditions(lat, lon) {
	var currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric`

	fetch(currentWeatherURL).then(response => {
		response.json().then(data => {
			console.log(data)
			var name = data.name
			var temp = Math.round(data.main.temp)
			var wind = Math.round(data.wind.speed)
			var humidity = Math.round(data.main.humidity)
			getCityTimeDate(lat, lon)
			renderCurrentWeatherData(name, temp, wind, humidity)
		})
	})
}

function renderCurrentWeatherData(name, temp, wind, humid) {
	var cityEl = currentWeatherEl.querySelector('[data-js="current-city-name"]')
	var temperatureEl = currentWeatherEl.querySelector('[data-js="current-temp"]')
	var windSpeedEl = currentWeatherEl.querySelector('[data-js="current-wind"]')
	var humidityEl = currentWeatherEl.querySelector('[data-js="current-humidity"]')
	cityEl.textContent = `${name},`
	temperatureEl.innerHTML = `Temp: <b>${temp} &deg;C</b>`
	windSpeedEl.innerHTML = `Wind Speed: <b>${wind} m/s</b>`
	humidityEl.innerHTML = `Humidity: <b>${humid}%</b>`
}

// Get local time and date of location
function getCityTimeDate(lat, lon) {
	var apiKey = 'AIzaSyB9BGAUD5hAZHJILdxzLSWht4KXvHtA8NE'
	// var timeStamp = Date.now() / 1000 // seconds since epoch
	var targetDate = new Date()
	var timeStamp = targetDate.getTime() / 1000 + targetDate.getTimezoneOffset() * 60
	console.log(timeStamp)
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

// Get coordinates from local storage
function getCoordinatesFromStorage() {}

// Get list of city names from local storage
function getCityNamesFromStorage() {}

// Get the user's search input
var searchCityHandler = function (event) {
	event.preventDefault()

	var cityName = searchInput.value.trim()
	searchInput.value = ''

	if (!cityName) {
		return
	} else {
		getCityCoordinates(cityName)
	}
}

// Call geocoding API and retrieve city coordinates
var getCityCoordinates = function (cityName) {
	var geoCodingURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=50&appid=${openWeatherKey}`

	fetch(geoCodingURL).then(response => {
		if (response.ok) {
			response.json().then(data => {
				console.log(data)

				var cityCoordinates = {
					lon: data[0].lon,
					lat: data[0].lat,
				}
				getCurrentWeatherConditions(cityCoordinates.lat, cityCoordinates.lon)
				saveCityToStorage(cityName, cityCoordinates)
				createHistoryTab(cityName)
				getCityNamesFromStorage()
			})
		} else {
			console.log(response.statusText)
		}
	})
}

// Save city coordinates to local storage
var saveCityToStorage = function (cityName, cityCoordinates) {
	localStorage.setItem(cityName, JSON.stringify(cityCoordinates))
}

var createHistoryTab = function (cityName) {
	var searchHistory = document.createElement('a')
	searchHistory.innerText = cityName
	searchHistory.classList.add('search-history')
	historyListEl.appendChild(searchHistory)
}

// Search for a city event handler
searchForm.addEventListener('submit', searchCityHandler)

// Search history accordion
toggleAccordion.addEventListener('click', () => {
	var historyTab = searchForm.querySelector('[data-js="history-tab"]')
	var plusIndicator = searchForm.querySelector('.fa-plus')
	var minusIndicator = searchForm.querySelector('.fa-minus')
	historyTab.classList.toggle('display-none')
	plusIndicator.classList.toggle('display-none')
	minusIndicator.classList.toggle('display-none')
})
