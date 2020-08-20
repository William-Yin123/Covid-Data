const renderTimeline = (dates, svg) => {
    const width = +svg.node().getBoundingClientRect().width;
    const height = +svg.node().getBoundingClientRect().height;

    const margin = { top: 60, right: 40, bottom: 100, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const timeScale = d3.scaleTime()
        .domain(d3.extent(dates))
        .range([0, innerWidth])
        .nice();

    const formatDate = d3.timeFormat("%B");

    const timeline = d3.axisBottom(timeScale)
        .ticks(8)
        .tickSize(-innerHeight)
        .tickPadding(15)
        .tickFormat(formatDate);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const timelineG = g.append('g')
        .call(timeline);
};