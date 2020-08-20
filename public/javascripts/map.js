Promise.all([
    d3.tsv('../datafiles/50m.tsv'),
    d3.csv('../datafiles/CountryMapping.csv'),
    d3.json('../datafiles/50m.json'),
    d3.csv('../datafiles/CountriesShown.csv')
]).then(async ([tsvData, countryMapping, topoJSONdata, countriesShown]) => {

    const mapSVG = d3.select("#map-svg")
        .attr("preserveAspectRatio", "xMinYMin meet");

    const projection = d3.geoNaturalEarth1();
    const pathGenerator = d3.geoPath().projection(projection);

    const mapG = mapSVG.append('g')
        .attr("id", "map");

    mapG.append('path')
        .attr('class', 'sphere')
        .attr('d', pathGenerator({type: 'Sphere'}));

    mapSVG.call(d3.zoom().on('zoom', () => {
        mapG.attr('transform', d3.event.transform);
    }));

    const {codeToCountry, dataByCountryCode, raw} = await loadAndProcessData();

    const dataByCountry = Object.keys(codeToCountry).reduce((accumulator, d) => {
        accumulator[codeToCountry[d]] = dataByCountryCode[d];
        return accumulator;
    }, {});

    const atlasToWho = countryMapping.reduce((accumulator, d) => {
        if (d.ATLAS) {
            if (!accumulator[d.ATLAS]) {
                accumulator[d.ATLAS] = [d.WHO];
            } else {
                accumulator[d.ATLAS].push(d.WHO);
            }
        }
        return accumulator
    }, {});

    const dataById = tsvData.reduce((accumulator, d) => {
        const whoNames = atlasToWho[d.name];
        if (whoNames) {
            if (whoNames.length > 1) {
                whoNames.forEach(whoName => {
                    if (dataByCountry[whoName]) {
                        if (
                            !accumulator[d.iso_n3]
                            || dataByCountry[whoName].cases[dataByCountry[whoName].cases.length - 1].cumulative
                            > accumulator[d.iso_n3].cases[accumulator[d.iso_n3].cases.length - 1].cumulative
                        ) {
                            accumulator[d.iso_n3] = dataByCountry[whoName];
                        }
                    }
                });
            } else {
                accumulator[d.iso_n3] = dataByCountry[whoNames[0]];
            }
        }
        return accumulator;
    }, {});

    const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);
    countries.features.forEach(d => {
        if (d.id !== "-99") d.properties = dataById[d.id];
        else d.properties = null;
        d.projection = projection(d3.geoCentroid(d));
    });

    const translateX = (+mapSVG.node().getBoundingClientRect().width / 2) - (+mapG.node().getBoundingClientRect().width / 2);
    mapG.attr("transform", `translate(${translateX}, 10)`);

    const caseNums = raw.map(d => Math.log(+d.Cumulative_cases));
    const colorScale = d3.scaleQuantile(d3.schemeReds[9])
        .domain(d3.extent(caseNums));

    const countryPaths = mapG.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator)
        .attr("fill", d => {
            const data = d.properties;
            if (data) {
                // console.log(data);
                return colorScale(Math.log(1));
            } else {
                return "rgb(128, 128, 128)";
            }
        });

    const countryHoverInfo = countryPaths.append('title')
        .text(d => {
            const data = d.properties;
            if (data) {
                return `${data.cases[0].name} - Cases: ${0}, Deaths: ${0}, Id: ${d.id}`;
            } else {
                return "No Data";
            }
        });

    const names = countriesShown.map(country => country.name);
    const countryLabels = mapG.append("g")
        .selectAll("text")
        .data(countries.features)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(d => {
            const data = d.properties;
            if (data && names.includes(data.cases[0].name)) {
                return 0;
            }
        })
        .attr("fill", "black")
        .attr("x", d => d.projection[0])
        .attr("y", d => d.projection[1])
        .attr("font-size", "0.5em");

    const present = new Date();

    const date = new Date("2020-01-02");
    let updateNum = 1;
    while (date < present) {
        setTimeout(renderMapByDate, updateNum * 500, new Date(date), names, colorScale, countryPaths, countryLabels, countryHoverInfo);
        date.setDate(date.getDate() + 1);
        updateNum++;
    }

    const timelineSVG = d3.select("#timeline-svg")
        .attr("preserveAspectRatio", "xMinYMin meet");

    const dates = [];
    for (const i = new Date("2020-01-02"); i < present; i.setDate(i.getDate() + 1)) {
        dates.push(new Date(i));
    }

    renderTimeline(dates, timelineSVG);
});