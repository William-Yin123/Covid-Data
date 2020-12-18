const activatePage = () => {
    d3.select('div.loading-spinner')
        .remove();
    d3.select('div.background')
        .classed("background", false);
};
