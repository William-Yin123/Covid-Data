let mapG,
    mapSVG,
    projection,
    pathGenerator,
    datesExtent,
    countriesShownNames,
    colorScale,
    countryPaths,
    countryLabels,
    countryHoverInfo,
    casesLabel,
    deathsLabel,
    dateLabel;

const mapGTranslate = [];

const resetMap = () => {
    if (!activated) return;
    if (mapGTranslate.length === 2 && mapG) {
        mapG.attr("transform", `translate(${mapGTranslate[0]}, ${mapGTranslate[1]})`);
    }
};

Promise.all([
    d3.tsv('../datafiles/50m.tsv'),
    d3.csv('../datafiles/CountryMapping.csv'),
    d3.json('../datafiles/50m.json'),
    d3.csv('../datafiles/CountriesShown.csv')
]).then(async ([tsvData, countryMapping, topoJSONdata, countriesShown]) => {

    mapSVG = d3.select("#map-svg")
        .attr("preserveAspectRatio", "xMinYMin meet");

    projection = d3.geoNaturalEarth1();
    pathGenerator = d3.geoPath().projection(projection);

    mapG = mapSVG.append('g')
        .attr("id", "map");

    mapG.append('path')
        .attr('class', 'sphere')
        .attr('d', pathGenerator({type: 'Sphere'}));

    mapSVG.call(d3.zoom().on('zoom', () => {
        mapG.attr('transform', d3.event.transform);
    }));

    const { codeToCountry, dataByCountryCode, raw } = await loadAndProcessData();

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

    mapGTranslate[0] = (+mapSVG.node().getBoundingClientRect().width / 2) - (+mapG.node().getBoundingClientRect().width / 2);
    mapGTranslate[1] = 5;
    mapG.attr("transform", `translate(${mapGTranslate[0]}, ${mapGTranslate[1]})`);

    const caseNums = raw.map(d => Math.log(+d.Cumulative_cases)).filter(d => d >= 1);
    colorScale = d3.scaleQuantile(d3.schemeReds[9])
        .domain(d3.extent(caseNums));

    countryPaths = mapG.selectAll('path')
        .data(countries.features)
        .enter()
        .append("a")
        .attr("target", d => (d.properties) ? "_blank" : "_self")
        .attr("href", d => {
            const data = d.properties;
            if (data) {
                return `/country/${data.cases[0].code}`;
            } else {
                return "#";
            }
        })
        .append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator)
        .attr("fill", d => {
            const data = d.properties;
            if (data) {
                return colorScale(Math.log(1));
            } else {
                return "rgb(128, 128, 128)";
            }
        });

    countryHoverInfo = countryPaths.append('title')
        .text(d => {
            const data = d.properties;
            if (data) {
                return `${data.cases[0].name} - Cases: 0, Deaths: 0, Id: ${d.id}`;
            } else {
                return "No Data";
            }
        });

    const calculateLabelLocation = (d, startingLocation, direction) => {
        const data = d.properties;
        if (!data) return;
        let projection = startingLocation;
        const countryObject = countriesShown.filter(country => country.name === data.cases[0].name)[0];
        if (countryObject) projection += +countryObject[`${direction}Shift`];
        return projection;
    };
    countriesShownNames = countriesShown.map(country => country.name);
    countryLabels = mapG.append("g")
        .selectAll("text")
        .data(countries.features)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(d => {
            const data = d.properties;
            if (data && countriesShownNames.includes(data.cases[0].name)) {
                return 0;
            }
        })
        .attr("fill", "#000000")
        .attr("x", d => calculateLabelLocation(d, d.projection[0], "x"))
        .attr("y", d => calculateLabelLocation(d, d.projection[1], "y"))
        .attr("font-size", "0.5em");

    casesLabel = d3.select("#cases-counter");
    deathsLabel = d3.select("#deaths-counter");
    dateLabel = d3.select("#date-label");

    const timelineSVG = d3.select("#timeline-svg")
        .attr("preserveAspectRatio", "xMinYMin meet");

    datesExtent = d3.extent(raw.map(d => new Date(d.Date_reported)));

    renderTimeline(timelineSVG);

    activatePage();
});
