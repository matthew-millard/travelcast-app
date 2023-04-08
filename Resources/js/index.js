var searchForm = document.querySelector('[data-js="search-form"]')
var searchInput = searchForm.querySelector('[data-js="city-search"]')
var historyListEl = searchForm.querySelector('[data-js="history-tab"]')
var toggleAccordion = searchForm.querySelector('[data-js="search-history-title"]')
var openWeatherKey = '1ed4313db2c7eabb04ea9a9f7ac7e55e'
var listOfCities = []

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

// Get coordinates from local storage
function getCoordinatesFromStorage() {}

// Get list of city names from local storage
function getCityNamesFromStorage() {}

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
