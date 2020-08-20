const loadAndProcessData = async () => {
    const d = await d3.json(`http://${location.hostname}:3201/api`);

    const dataFiltered = d.filter(datum => datum.Date_reported && datum.Country && datum.Country_code);
    dataFiltered.forEach(datum => {
        if (datum.Country_code === " ") {
            datum.Country_code = "OT";
        }
    });

    const countryCodesDupe = dataFiltered.map(datum => datum.Country_code);
    const countryCodesSet = new Set(countryCodesDupe);
    const countryCodes = Array.from(countryCodesSet);

    const countriesDupe = dataFiltered.map(datum => datum.Country);
    const countriesSet = new Set(countriesDupe);
    const countries = Array.from(countriesSet);
    const codeToCountry = {};
    for (let i = 0; i < countries.length; i++) {
        const code = countryCodes[i];
        codeToCountry[code] = countries[i];
    }

    const casesByCountry = {};
    const deathsByCountry = {};
    for (const countryCode of countryCodes) {
        casesByCountry[countryCode] = [];
        deathsByCountry[countryCode] = [];
    }

    let countryId = 0;
    for (const datum of dataFiltered) {
        if (countryCodes[countryId] !== datum.Country_code) {
            countryId++;
        }
        const countryCode = countryCodes[countryId];

        casesByCountry[countryCode].push({name: datum.Country, code: datum.Country_code, dateReported: new Date(datum.Date_reported), cumulative: +datum.Cumulative_cases, "new": +datum.New_cases});
        deathsByCountry[countryCode].push({name: datum.Country, code: datum.Country_code, dateReported: new Date(datum.Date_reported), cumulative: +datum.Cumulative_deaths, "new": +datum.New_deaths});
    }

    const dataByCountryCode = {};
    for (const countryCode of countryCodes) {
        dataByCountryCode[countryCode] = {cases: casesByCountry[countryCode], deaths: deathsByCountry[countryCode]};
    }

    return {codeToCountry, dataByCountryCode, raw: dataFiltered};
};