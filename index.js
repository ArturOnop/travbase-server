const createRouts = require("./utils/createRouts");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const citiesFilter = require("./utils/citiesFilter");
const shuffleArray = require("./utils/shuffleArray");

require("dotenv").config();

const server = express();
server.use(express.static(__dirname));
server.listen(process.env.PORT || 7777, () => {
    console.log("Express server started");
});

server.use(bodyParser.urlencoded({limit: '20mb', extended: true}));
server.use(bodyParser.json({limit: '20mb'}));

const url = "mongodb+srv://admin:mK5J6TDPRYl4ntWx@travbase.w1cwkhx.mongodb.net/travbase?retryWrites=true&w=majority";
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;
const CitySchema = new Schema({
    name: String,
    country: String,
    popularity: Number,
    pricePerDay: Number,
    tourismType: [String],
    seasons: [String],
    info: String,
    image: String
});

const CountrySchema = new Schema({
    name: String,
    continent: String,
    info: String,
    image: String
});

const CityModel = mongoose.model("City", CitySchema);
const CountryModel = mongoose.model("Country", CountrySchema);

server.use(cors({origin: "*"}));

server.post("/add-country", (req, res) => {
    let newCountry = new CountryModel(req.body);
    newCountry.save((err) => {
        if (err) console.log(err);
    })
});

server.post("/add-city", async (req, res) => {
    let countryExists = false;
    await CountryModel.find({name: req.body.country}).then((data) => data[0] ? countryExists = true : null);
    if (countryExists) {
        let newCity = new CityModel(req.body);
        newCity.save((err) => {
            if (err) console.log(err);
        })
    } else res.json({errorMessage: `${req.body.country} does not exist. Add it first`});
});

server.get("/countries", (req, res) => {
    CountryModel.find({}).then((data) => res.json(data));
});

server.get("/countries/:name", (req, res) => {
    CountryModel.find({name: req.params.name}).then((data) => res.json(data[0]));
});

server.get("/cities", (req, res) => {
    CityModel.find({}).then((data) => res.json(data));
});

server.post("/filter", (req, response) => {
    let countries = req.body.countries;
    CityModel.find(countries[0] ? {country: {$in: countries}} : {}).then((data) => {
        let filtered = citiesFilter(data, req.body);
        if (filtered.length >= req.body.stops) {
            let shuffledAndCut = shuffleArray(filtered).slice(0, 7);
            createRouts(shuffledAndCut, req.body.stops).then(res => response.json(res));
        } else response.json({message: `No route found. Try other filters`})
    });
});
