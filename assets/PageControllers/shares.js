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
        bottom: 100,
        left: 50
    };
    var margin2 = {
        top: 420,
        right: 20,
        bottom: 20,
        left: 50
    };
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var height2 = 500 - margin2.top - margin2.bottom;

    var parseDate = d3.time.format("%Y-%m-%d").parse;

    var x = techan
        .scale
        .financetime()
        .range([0, width]);
    var x2 = techan
        .scale
        .financetime()
        .range([0, width]);

    var y = d3
        .scale
        .linear()
        .range([height, 0]);
    var yVolume = d3
        .scale
        .linear()
        .range([y(0), y(0.3)]);
    var y2 = d3
        .scale
        .linear()
        .range([height2, 0]);

    var brush = d3
        .svg
        .brush()
        .on("brush", draw);


    var candlestick = techan
        .plot
        .candlestick()
        .xScale(x)
        .yScale(y);

    var volume = techan
        .plot
        .volume()
        .xScale(x)
        .yScale(yVolume);

    var close = techan
        .plot
        .close()
        .xScale(x2)
        .yScale(y2);

    var xAxis = d3
        .svg
        .axis()
        .scale(x)
        .orient("bottom");

    var xAxis2 = d3
        .svg
        .axis()
        .scale(x2)
        .orient("bottom");

    var yAxis = d3
        .svg
        .axis()
        .scale(y)
        .orient("left");

    var yAxis2 = d3
        .svg
        .axis()
        .scale(y2)
        .ticks(0)
        .orient("left");

    var svg = d3.select("#shares").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    focus.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", y(1))
        .attr("width", width)
        .attr("height", y(0) - y(1));

    focus.append("g")
        .attr("class", "volume")
        .attr("clip-path", "url(#clip)");

    focus.append("g")
        .attr("class", "candlestick")
        .attr("clip-path", "url(#clip)");

    focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

    focus.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Price ($)");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    context.append("g")
        .attr("class", "close");

    context.append("g")
        .attr("class", "pane");

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")");

    context.append("g")
        .attr("class", "y axis")
        .call(yAxis2);

    var zoomable;
    var zoomable2;
    var accessor = candlestick.accessor();

    candles = candles.slice(0, 1000).map(function(d) {
    // candles = candles.map(function(d) {
        return {
            date: parseDate(d.date),
            open: +d.o,
            high: +d.h,
            low: +d.l,
            close: +d.c,
            volume: +d.vol
        };
    }).sort(function(a, b) {
        return d3.ascending(accessor.d(a), accessor.d(b));
    });

    x.domain(candles.map(accessor.d));
    x2.domain(x.domain());
    y.domain(techan.scale.plot.ohlc(candles, accessor).domain());
    y2.domain(y.domain());
    yVolume.domain(techan.scale.plot.volume(candles).domain());

    focus.select("g.candlestick").datum(candles);
    focus.select("g.volume").datum(candles);

    context.select("g.close").datum(candles).call(close);
    context.select("g.x.axis").call(xAxis2);

    // Associate the brush with the scale and render the brush only AFTER a domain has been applied
    zoomable = x.zoomable();
    zoomable2 = x2.zoomable();
    brush.x(zoomable2);
    context.select("g.pane").call(brush).selectAll("rect").attr("height", height2);

    draw();

    function draw() {
        var candlestickSelection = focus.select("g.candlestick"),
            data = candlestickSelection.datum();
        zoomable.domain(brush.empty() ? zoomable2.domain() : brush.extent());
        y.domain(techan.scale.plot.ohlc(data.slice.apply(data, zoomable.domain()), candlestick.accessor()).domain());
        candlestickSelection.call(candlestick);
        focus.select("g.volume").call(volume);
        // using refresh method is more efficient as it does not perform any data joins
        // Use this if underlying data is not changing
        // svg.select("g.candlestick").call(candlestick.refresh);
        focus.select("g.x.axis").call(xAxis);
        focus.select("g.y.axis").call(yAxis);
    }
}


