const renderMapByDate = (date, names, colorScale, countryPaths, countryLabels, countryHoverInfo) => {

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

    countryHoverInfo.text(d => {
            const data = d.properties;
            if (data) {
                const idx = findDataPointByDate(date, data.cases);
                const cumulative = (idx === -1) ? 0 : data.cases[idx].cumulative;
                const deaths = (idx === -1) ? 0 : data.deaths[idx].cumulative;
                return `${data.cases[0].name} - Cases: ${cumulative}, Deaths: ${deaths}, Id: ${d.id}`;
            } else {
                return "No Data";
            }
        });

    countryLabels.text(d => {
            const data = d.properties;
            if (data && names.includes(data.cases[0].name)) {
                const idx = findDataPointByDate(date, data.cases);
                const cumulative = (idx === -1) ? 0 : data.cases[idx].cumulative;
                return cumulative;
            }
        });
};