const request = require("async-request");

const contactAPI = async () => {
    const response = await request("http://localhost:3201/api");
    const responseJSON = JSON.parse(response.body);

    const data = responseJSON.filter(datum => datum.Date_reported !== "");
    data.forEach(datum => {
        if (datum.Country_code === " ") {
            datum.Country_code = "OT";
        }
    });

    const countriesDupe = data.map(datum => datum.Country);
    const countriesSet = new Set(countriesDupe);

    const countries = Array.from(countriesSet);

    const dataByCountry = {};
    for (const country of countries) {
        dataByCountry[country] = [];
    }

    let countryId = 0;
    for (const datum of data) {
        if (countries[countryId] !== datum.Country) {
            countryId++;
        }
        const country = countries[countryId];

        dataByCountry[country].unshift(datum);
    }

    const countryCodesDupe = data.map(datum => datum.Country_code);
    const countryCodesSet = new Set(countryCodesDupe);

    const countryCodes = Array.from(countryCodesSet);

    return { data, countries, dataByCountry, countryCodes};
};

module.exports = {
    contactAPI
};