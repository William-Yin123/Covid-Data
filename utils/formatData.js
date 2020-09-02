const formatData = (countries, dataByCountry) => {
    const dateFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    countries.forEach((country) => {
        dataByCountry[country].forEach((d) => {
            d.Date_reported = new Date(d.Date_reported).toLocaleDateString(undefined, dateFormatOptions);
            d.New_cases = Number(d.New_cases).toLocaleString();
            d.Cumulative_cases = Number(d.Cumulative_cases).toLocaleString();
            d.New_deaths = Number(d.New_deaths).toLocaleString();
            d.Cumulative_deaths = Number(d.Cumulative_deaths).toLocaleString();
        });
    });
};

module.exports = {
    formatData
};