const renderMapByDate = (date) => {

    const numberFormatter = d3.format(",");

    const findDataPointByDate = (date, data) => {
        if (data[0].dateReported > date) return -1;
        let idx = 0;
        while (data[idx].dateReported < date && idx < data.length - 1) {
            idx++;
        }
        return idx;
    };

    countryPaths.attr("fill", d => {
            const data = d.properties;
            if (data) {
                const idx = findDataPointByDate(date, data.cases);
                const cumulative = (idx === -1) ? 1 : data.cases[idx].cumulative;
                return colorScale(Math.log(cumulative));
            } else {
                return "rgb(128, 128, 128)";
            }
        });

    let globalCases = 0;
    let globalDeaths = 0;
    countryHoverInfo.text(d => {
            const data = d.properties;
            if (data) {
                const idx = findDataPointByDate(date, data.cases);
                const cases = (idx === -1) ? 0 : data.cases[idx].cumulative;
                const deaths = (idx === -1) ? 0 : data.deaths[idx].cumulative;
                globalCases += cases;
                globalDeaths += deaths;
                return `${data.cases[0].name} - Cases: ${numberFormatter(cases)}, Deaths: ${numberFormatter(deaths)}, Id: ${d.id}`;
            } else {
                return "No Data";
            }
        });

    countryLabels.text(d => {
            const data = d.properties;
            if (data && countriesShownNames.includes(data.cases[0].name)) {
                const idx = findDataPointByDate(date, data.cases);
                const cumulative = (idx === -1) ? 0 : data.cases[idx].cumulative;
                return numberFormatter(cumulative);
            }
        });

    if (casesLabel) {
        casesLabel.text(`Global Cases: ${numberFormatter(globalCases)}`);
    }

    if (deathsLabel) {
        deathsLabel.text(`Global Deaths: ${numberFormatter(globalDeaths)}`);
    }

    if (dateLabel) {
        const formatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateLabel.text(date.toLocaleDateString(undefined, formatOptions));
    }
};