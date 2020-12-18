let codeToCountry;
let dataByCountryCode;
(async () => {
    const d = await loadAndProcessData();
    codeToCountry = d.codeToCountry;
    dataByCountryCode = d.dataByCountryCode;

    const dataGrouped = Object.values(dataByCountryCode);

    d3.selectAll(".country-info")
        .data(dataGrouped);

    activatePage();
})();

const renderGraph = (countryCode, data, type) => {
    const svg = d3.select(`#${countryCode}-${type}-graph`)
        .classed("hidden", false);

    const title = `COVID-19 ${type.charAt(0).toUpperCase() + type.slice(1)} in ${codeToCountry[countryCode]}`;
    const radius = 5;

    const xValue = d => d.dateReported;
    const xLabel = "Date";
    const xExtent = d3.extent(data, xValue);

    const yValue = d => d.cumulative;
    const yLabel = `Total ${type}`;
    const yExtent = d3.extent(data, yValue);

    if (yExtent[1] < 100) {
        svg.classed("hidden", true);
        return;
    }

    const width = +svg.node().getBoundingClientRect().width;
    const height = +svg.node().getBoundingClientRect().height;

    const margin = { top: 60, right: 40, bottom: 100, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
        .domain(xExtent)
        .range([0, innerWidth])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(yExtent)
        .range([innerHeight, 0])
        .nice();

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const formatDate = d3.timeFormat("%B");

    const xTicks = 8;
    const xAxis = d3.axisBottom(xScale)
        .ticks(xTicks)
        .tickSize(-innerHeight)
        .tickPadding(15)
        .tickFormat(formatDate);

    const yTicks = 12;
    const yAxis = d3.axisLeft(yScale)
        .ticks(yTicks)
        .tickSize(-innerWidth)
        .tickPadding(10);

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll('.domain').remove();

    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', -70)
        .attr('x', -innerHeight / 2)
        .attr('fill', 'white')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text(yLabel);

    const xAxisG = g.append('g')
        .call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);
    xAxisG.selectAll('.domain').remove();

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 45)
        .attr('x', innerWidth / 2)
        .attr('fill', 'white')
        .text(xLabel);

    g.selectAll('circle').data(data)
        .enter()
        .append('circle')
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)))
        .attr('r', radius);

    g.append('text')
        .attr('class', 'title')
        .attr('y', -10)
        .text(title);
};

const showCountryData = (countryCode, className) => {
    document.getElementById(countryCode).classList.toggle(className);

    const arrowElement = document.getElementById(`${countryCode}-arrow`);
    const open = arrowElement.classList.contains("down");
    arrowElement.classList.toggle("down");
    arrowElement.classList.toggle("up");

    if (open && dataByCountryCode) {
        renderGraph(countryCode, dataByCountryCode[countryCode].cases, "cases");
        renderGraph(countryCode, dataByCountryCode[countryCode].deaths, "deaths");
    }
};

const sortCountryData = (option) => {
    const countryInfoDivs = d3.selectAll(".country-info");
    if (!countryInfoDivs.data()) return;

    countryInfoDivs.sort((d1, d2) => {
            if (option === "name") {
                return (d2.cases[0].name.toLowerCase() < d1.cases[0].name.toLowerCase()) ? 1 : -1;
            }

            return d2[option][d2[option].length - 1].cumulative - d1[option][d1[option].length - 1].cumulative
    });
};
