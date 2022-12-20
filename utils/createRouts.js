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

    const getDistance = async routeCities => {
        let result;
        let url = `https://fr.distance24.org/route.json?stops=${routeCities.join('|')}`;
        await axios.get(encodeURI(url), {
            headers: {"Content-Type": "application/json"}
        }).then(res => result = res.data.distance).catch(error => console.log(error));
        return result;
    }

    const getCountryObject = async countryName => {
        let result;
        await axios.get(`https://travbase-server.herokuapp.com/countries/${countryName}`, {
            headers: {"Content-Type": "application/json"}
        }).then(res => result = res.data).catch(error => console.log(error));
        return result;
    }

    const createObjects = async (result) => {
        let routs = [];

        for (const route of result) {
            let object = {};
            let routeCities = route.map(city => city.name);
            let routeCountries = [];
            for (const country of [...new Set(route.map(city => city.country))]) {
                await getCountryObject(country).then(res => routeCountries.push(res));
            }
            object.cities = route;
            object.countries = routeCountries;
            await getDistance(routeCities).then(res => object.distance = res);
            routs.push(object);
        }

        routs.sort((a, b) => {
            if (b.countries.length > a.countries.length) return 1;
            if (b.countries.length < a.countries.length) return -1;

            if (b.distance < a.distance) return 1;
            if (b.distance > a.distance) return -1;
        });
        return routs;
    }

    await createObjects(result).then(res => result = res);

    return result;
}

module.exports = createRouts;