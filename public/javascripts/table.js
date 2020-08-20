let codeToCountry;
let dataByCountryCode;
(async () => {
    const d = await loadAndProcessData();
    codeToCountry = d.codeToCountry;
    dataByCountryCode = d.dataByCountryCode;
})();

const renderGraph = (countryCode, data, type) => {
    const svg = d3.select(`#${countryCode}-${type}-graph`);

    const title = `COVID-19 ${type.charAt(0).toUpperCase() + type.slice(1)} in ${codeToCountry[countryCode]}`;
    const radius = 5;

    const xValue = d => d.dateReported;
    const xLabel = "Date";

    const yValue = d => d.cumulative;
    const yLabel = `Total ${type}`;

    const width = +svg.node().getBoundingClientRect().width;
    const height = +svg.node().getBoundingClientRect().height;

    const margin = { top: 60, right: 40, bottom: 100, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yValue))
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

    const yTicks = (d3.extent(data, yValue)[1] < 12) ? d3.extent(data, yValue)[1] : 12;
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

    const xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

    xAxisG.select('.domain').remove();

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 45)
        .attr('x', innerWidth / 2)
        .attr('fill', 'white')
        .text(xLabel);

    g.selectAll('circle').data(data)
        .enter().append('circle')
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

    if (open) {
        renderGraph(countryCode, dataByCountryCode[countryCode].cases, "cases");
        renderGraph(countryCode, dataByCountryCode[countryCode].deaths, "deaths");
    }
};