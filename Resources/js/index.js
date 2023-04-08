var searchForm = document.querySelector('[data-js="search-form"]')
var searchInput = searchForm.querySelector('[data-js="city-search"]')
var historyListEl = searchForm.querySelector('[data-js="history-tab"]')
var openWeatherKey = '1ed4313db2c7eabb04ea9a9f7ac7e55e'

// Get the user's search input
var searchCityHandler = function (event) {
	event.preventDefault()

	var cityName = searchInput.value.trim()

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

				saveCityToStorage(cityName, cityCoordinates)
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

// Create a history tab

searchForm.addEventListener('submit', searchCityHandler)
