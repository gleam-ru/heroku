$(document).ready(function() {
    $.get('/services/shares/candles/GAZP')
    .done(function(data) {
        var msg = data.msg;
        if (msg) {
            if (mp) mp.alert(msg);
            else alert(msg);
        }
        else {
            createChart(data);
        }
    })
    .fail(function(msg) {
        console.error(msg);
        if (mp) {
            mp.alert('что-то пошло не так...');
        }
        else {
            alert('что-то пошло не так...')
        }
    });
});


function createChart(data) {
    var candles = data.candles;

    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        };
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y-%m-%d").parse;

    var x = techan.scale.financetime()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var candlestick = techan.plot.candlestick()
        .xScale(x)
        .yScale(y);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#shares").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var accessor = candlestick.accessor();

    candles = candles.slice(0, 200).map(function(d) {
        return {
            date    : parseDate(d.date),
            open    : +d.o,
            high    : +d.h,
            low     : +d.l,
            close   : +d.c,
            volume  : +d.vol
        };
    }).sort(function(a, b) {
        return d3.ascending(accessor.d(a), accessor.d(b));
    });

    x.domain(candles.map(accessor.d));
    y.domain(techan.scale.plot.ohlc(candles, accessor).domain());

    svg.append("g")
        .datum(candles)
        .attr("class", "candlestick")
        .call(candlestick);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Price ($)");
}
