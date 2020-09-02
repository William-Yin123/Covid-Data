const express = require("express");

const { contactAPI } = require("../utils/contactAPI");
const { formatData } = require("../utils/formatData");


const router = express.Router();

let data,
    countries,
    dataByCountry,
    countryCodes;

const init = async () => {
    const response = await contactAPI();

    data = response.data;
    countries = response.countries;
    dataByCountry = response.dataByCountry;
    countryCodes = response.countryCodes;

    // formatData(countries, dataByCountry);
};
setInterval(init, 6 * 60 * 60 * 1000);

router.get('/', (req, res, next) => {
    res.redirect('/map');
});

router.get('/table', async (req, res, next) => {
    if (!data || !dataByCountry || !countries || !countryCodes) await init();

    res.render('table', { title: 'Covid Data', countries: countries, dataByCountry: dataByCountry, countryCodes: countryCodes });
});

router.get('/country/:countryCode', async (req, res, next) => {
    const response = await contactAPI([req.params.countryCode]);
    formatData(response.countries, response.dataByCountry);

    res.render(
        'countryData',
        {
            title: 'Covid Data',
            country: response.countries[0],
            code: response.countryCodes[0],
            dataByCountry: response.dataByCountry
        }
    );
});

router.get('/map', (req, res, next) => {
    res.render('map', { title: 'Covid Data' });
});

module.exports = router;
