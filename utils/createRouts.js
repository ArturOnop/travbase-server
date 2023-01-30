const axios = require("axios");

const createRouts = async (arrayOfCities, stops) => {
    let result = [];

    const combinationsUtil = (arr, n, r, index, data, i) => {
        if (index === r) {
            let temp = []
            for (let j = 0; j < r; j++) {
                temp.push(data[j]);
            }
            result.push(temp);
            return;
        }
        if (i >= n) return;

        data[index] = arr[i];
        combinationsUtil(arr, n, r, index + 1, data, i + 1);

        while (arr[i] === arr[i + 1]) i++;

        combinationsUtil(arr, n, r, index, data, i + 1);
    }

    const createCombinations = (arr, n, r) => {
        let data = new Array(r);
        combinationsUtil(arr, n, r, 0, data, 0);
    }

    createCombinations(arrayOfCities, arrayOfCities.length, stops);

    const getCountryObject = async countryName => {
        let result;
        await axios.get(`https://travbase-server.vercel.app/countries/${countryName}`, {
            headers: {"Content-Type": "application/json"}
        }).then(res => result = res.data).catch(error => console.log(error));
        return result;
    }

    const getContinents = async countryName => {
        let result;
        await axios.get(`https://travbase-server.vercel.app/countries/${countryName}`, {
            headers: {"Content-Type": "application/json"}
        }).then(res => result = res.data.continent).catch(error => console.log(error));
        return result;
    }

    const createObjects = async (result) => {
        let routs = [];

        for (const route of result) {
            let object = {};
            let routeCountries = [];
            let routeContinents = [];
            for (const country of [...new Set(route.map(city => city.country))]) {
                await getCountryObject(country).then(res => routeCountries.push(res));
            }
            for (const country of route.map(city => city.country)) {
                await getContinents(country).then(res => routeContinents.push(res));
            }
            let continentsObj = {};
            routeContinents.forEach(el => continentsObj[el] = (continentsObj[el] || 0) + 1);
            let sortedContinents = Object.values(continentsObj).sort((a, b) => b - a);

            object.cities = route;
            object.countries = routeCountries;
            object.continentsCount = sortedContinents;
            routs.push(object);
        }

        routs.sort((a, b) => {
            if (b.countries.length > a.countries.length) return 1;
            if (b.countries.length < a.countries.length) return -1;

            if (b.continentsCount[0] > a.continentsCount[0]) return 1;
            if (b.continentsCount[0] < a.continentsCount[0]) return -1;
        });
        return routs;
    }

    await createObjects(result).then(res => result = res);

    return result;
}

module.exports = createRouts;