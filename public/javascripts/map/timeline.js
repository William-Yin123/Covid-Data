let timeScale;
let intervalId;

const renderMapFromSliderLocation = (x) => {
    const date = timeScale.invert(x);
    renderMapByDate(date);
};

const renderTimeline = (timelineSVG) => {
    const width = +timelineSVG.node().getBoundingClientRect().width;
    const height = +timelineSVG.node().getBoundingClientRect().height;

    const margin = { top: 20, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    timeScale = d3.scaleTime()
        .domain(d3.extent(datesExtent))
        .range([0, innerWidth])
        .nice();

    const dragStart = () => d3.select("#timeline-slider").raise().attr("stroke", "white").attr("fill", "white");
    const dragMove = () => {
        d3.select("#timeline-slider").attr("x", () => {
            const leftBound = Math.min(timeScale.range()[0], timeScale(datesExtent[0]));
            const rightBound = Math.min(timeScale.range()[1], timeScale(datesExtent[1]));

            let x = d3.event.x;
            if (x < leftBound) {
                x = leftBound;
            } else if (x > rightBound) {
                x = rightBound;
            }

            renderMapFromSliderLocation(x);

            return x;
        });
    };
    const dragEnd = () => {
        d3.select("#timeline-slider").attr("stroke", null).attr("fill", "#e60000");
    };

    const drag = d3.drag()
        .on("start", dragStart)
        .on("drag", dragMove)
        .on("end", dragEnd);

    const formatDate = d3.timeFormat("%B");

    const timeline = d3.axisBottom(timeScale)
        .ticks(12)
        .tickPadding(15)
        .tickFormat(formatDate);

    const timelineG = timelineSVG.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .attr("style", "pointer-events: bounding-box; cursor: pointer;")
        .on("click", () => playTimeline())
        .attr("id", "timeline")
        .call(timeline);

    const slider = timelineG.append("rect")
        .attr("x", timeScale.range()[0])
        .attr("y", -6)
        .attr("width", 8)
        .attr("height", 12)
        .attr("fill", "#e60000")
        .attr("id", "timeline-slider")
        .attr("style", "cursor: pointer;")
        .call(drag);

    const timelineGHeight = +timelineG.node().getBoundingClientRect().height;
    timelineSVG.attr("height", timelineGHeight * 2);
};

const startTimeline = () => {
    intervalId = setInterval(() => {
        if (!timeScale) return;
        const slider = d3.select("#timeline-slider");
        const date = Date.parse(timeScale.invert(+slider.attr("x")));
        const leftBound = Math.min(timeScale.domain()[0], datesExtent[0]);
        const rightBound = Math.min(timeScale.domain()[1], datesExtent[1]);

        renderMapByDate(new Date(date));
        if (date >= rightBound) {
            clearInterval(intervalId);
        } else {
            const tomorrow = date + 24 * 60 * 60 * 1000;
            slider.attr("x", timeScale(tomorrow));
        }
    }, 250);
};
startTimeline();

const playTimeline = () => {
    if (!activated) return;

    const playButtonIcon = d3.select("#play-button-icon");

    if (playButtonIcon.attr("class").includes("fa-play")) {
        playButtonIcon.classed("fa-play", false);
        playButtonIcon.classed("fa-pause", true);

        startTimeline();
    } else {
        playButtonIcon.classed("fa-play", true);
        playButtonIcon.classed("fa-pause", false);

        clearInterval(intervalId);
    }
};
