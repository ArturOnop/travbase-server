const citiesFilter = (array, filters) => {
    return array.filter(city => {
        return (
            (filters.popularity[0] ? filters.popularity.includes(city.popularity) : true) &&
            (city.pricePerDay < filters.priceLess) &&
            (city.pricePerDay > filters.priceMore) &&
            (filters.tourismType[0] ?
                filters.tourismType.some(c => city.tourismType.includes(c)) : true) &&
            (filters.seasons[0] ?
                filters.seasons.some(c => city.seasons.includes(c)) : true)
        )
    })
}

module.exports = citiesFilter;