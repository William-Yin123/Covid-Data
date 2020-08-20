const express = require("express");

const { contactAPI } = require("../utils/contactAPI");

const router = express.Router();

let data;
let countries;
let dataByCountry;
let countryCodes;

const init = async () => {
    const response = await contactAPI();

    data = response.data;
    countries = response.countries;
    dataByCountry = response.dataByCountry;
    countryCodes = response.countryCodes;
};

setInterval(init, 6 * 60 * 1000);

router.get('/', (req, res, next) => {
    res.redirect('/map');
});

router.get('/table', async (req, res, next) => {
    if (!data || !dataByCountry || !countries || !countryCodes) {
        await init();
    }

    res.render('table', { title: 'Covid Data', countries: countries, dataByCountry: dataByCountry, countryCodes: countryCodes });
});

router.get('/map', (req, res, next) => {
    res.render('map', { title: 'Covid Data' });
});

module.exports = router;
