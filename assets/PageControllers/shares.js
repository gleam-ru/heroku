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
            tester();
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
    // chart
    var margin = [20, 20, 20, 50];
    var width = $('#shares').width() - margin[1] - margin[3];
    var height = 500 - margin[0] - margin[2];
    // brusher
    var b_width = $('#shares').width() - margin[3];
    var b_height = 50;
        margin[2] += b_height;


    var x = techan
        .scale
        .financetime()
        .range([0, width]);

    var y = d3
        .scale
        .linear()
        .range([height, 0]);

    var y_volume = d3
        .scale
        .linear()
        .range([y(0), y(0.3)]);



    // Оси брашера
    var b_x = techan
        .scale
        .financetime()
        .range([0, b_width]);

    var b_y = d3
        .scale
        .linear()
        .range([b_height, 0]);

    // поле для творчества
    var svg = d3.select("#shares").append("svg")
        .attr("width", width + margin[3] + margin[1])
        .attr("height", height + margin[0] + margin[2] + b_height)
        // .append("g")
        // .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");



    // график
    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

    // видимая область
    // чтобы не рендерить лишнее - .attr("clip-path", "url(#clip)")
    focus
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", y(1))
        .attr("width", width)
        .attr("height", y(0) - y(1));



    // всяко разно
    var ctx = svg.append("g")
        .attr("class", "ctx")
        .attr("transform", "translate(" + margin[3] + "," + (height + margin[2]) + ")");

    // ctx.append("g")
    //     .attr("class", "close");

    // ctx.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0," + height2 + ")");

    // ctx.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxis);



    //  ╔═╗╔═╗╔╗╔╔╦╗╦  ╔═╗╔═╗
    //  ║  ╠═╣║║║ ║║║  ║╣ ╚═╗
    //  ╚═╝╩ ╩╝╚╝═╩╝╩═╝╚═╝╚═╝
    //  @candles

    var candlesticks_plot = techan
        .plot
        .candlestick()
        .xScale(x)
        .yScale(y);

    var accessor = candlesticks_plot.accessor();
    var parseDate = d3.time.format("%Y-%m-%d").parse;

    candles = candles.map(function(c) {
    // candles = candles.slice(0, 180).map(function(c) {
        return {
            date   : parseDate(c.date),
            open   : +c.o,
            high   : +c.h,
            low    : +c.l,
            close  : +c.c,
            volume : +c.vol
        };
    }).sort(function(a, b) {
        return d3.ascending(accessor.d(a), accessor.d(b));
    });

    x.domain(candles.map(accessor.d));
    y.domain(techan.scale.plot.ohlc(candles, accessor).domain());

    focus
        .append("g")
        .attr("class", "candlestick")
        .attr("clip-path", "url(#clip)")
        .datum(candles)



    //  ╦  ╦╔═╗╦  ╦ ╦╔╦╗╔═╗╔═╗
    //  ╚╗╔╝║ ║║  ║ ║║║║║╣ ╚═╗
    //   ╚╝ ╚═╝╩═╝╚═╝╩ ╩╚═╝╚═╝
    //   @volumes

    var volumes_plot = techan
        .plot
        .volume()
        .xScale(x)
        .yScale(y_volume)

    y_volume.domain(techan.scale.plot.volume(candles).domain())

    focus
        .append("g")
        .attr("class", "volume")
        .attr("clip-path", "url(#clip)")
        .datum(candles)



    //  ╔═╗═╗ ╦╦╔═╗
    //  ╠═╣╔╩╦╝║╚═╗
    //  ╩ ╩╩ ╚═╩╚═╝
    //  @axis

    var y_axis = d3
        .svg
        .axis()
        .scale(y)
        .orient("left")

    focus
        .append("g")
        .attr("class", "y axis")
        // .append("text")
        // .attr("transform", "rotate(-90)")
        // .attr("y", 6)
        // .attr("dy", ".71em")
        // .style("text-anchor", "end")
        // .text("Price ($)");

    var x_axis = d3
        .svg
        .axis()
        .scale(x)
        .orient("bottom")

    focus
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");



/*

    //  ╔╗ ╦═╗╦ ╦╔═╗╦ ╦╔═╗╦═╗
    //  ╠╩╗╠╦╝║ ║╚═╗╠═╣║╣ ╠╦╝
    //  ╚═╝╩╚═╚═╝╚═╝╩ ╩╚═╝╩╚═
    //  @brusher

    b_x.domain(x.domain())
    b_y.domain(y.domain())


    var close = techan
        .plot
        .close()
        .xScale(b_x)
        .yScale(b_y);
    ctx
        .append("g")
        .attr("class", "close")
    ctx
        .select("g.close")
        .datum(candles)
        .call(close)


    var b_x_axis = d3
        .svg
        .axis()
        .scale(x)
        .orient("bottom")
    ctx
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + b_height + ")");
    ctx
        .select("g.x.axis")
        .call(b_x_axis)


    var brush = d3
        .svg
        .brush()
        // .on("brush", draw);

    var plot_data    = x.zoomable();
    var brusher_data = b_x.zoomable();

    brush.x(brusher_data)
    ctx
        .append("g")
        .attr("class", "brusher")
    ctx
        .select("g.brusher")
        .call(brush)
        .selectAll("rect")
        .attr("height", b_height)
//*/














    var dates = x.domain();
    var _x = techan
        .scale
        .financetime()
        .domain(x.domain())
    // var _x = d3
    //     .time
    //     .scale()
    //     .domain([dates[0], dates[dates.length - 1]])
    //     .domain([new Date(2006, 1, 1), new Date()])
        .range([0, b_width]);

    var brush = d3.svg.brush();
    var brusher_data = _x.zoomable();
    brush.x(brusher_data)

    brush.on("brushend", brushended);


    // bg
    ctx.append("rect")
        .attr("class", "grid-background")
        .attr("width", b_width)
        .attr("height", b_height);

    // "cols"
    ctx.append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + b_height + ")")
        .call(d3.svg.axis()
            .scale(_x)
            .orient("bottom")
            .ticks(d3.time.month, 6)
            .tickSize(-b_height)
            .tickFormat(""))
      .selectAll(".tick")
        .classed("minor", function(d) {
            return d.getMonth() === 6;
        });

    // заполняем данными
    ctx
        .append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.event)
        .selectAll("rect")
        .attr("height", b_height);

    function brushended() {
        // transition only after input
        if (!d3.event.sourceEvent) return;

        var extent = brush.extent().map(function(d) {
            d.setDate(1);
            if (d.getMonth() >= 6) {
                // вторая половина года
                d.setMonth(6);
            }
            else {
                d.setMonth(0);
            }
            return d3.time.year(d);
        });

        // вероятно, это просто клик
        if (extent[0] >= extent[1]) {
            extent[1].addMonths(6);
        }
        if (extent[1].getUTCFullYear() === (new Date()).getUTCFullYear()) {
            extent[1].addMonths(6);
        }

        d3
            .select(this) // brush?
            .transition()
            .call(brush.extent(extent))
            .call(brush.event);

        draw();
    }












    var plot_data    = x.zoomable();


    function draw() {

        // привязка данных брашера к данным графика
        // var plot_data = x.zoomable();
        // plot_data.domain([0, 200]);
        plot_data.domain(brush.empty() ? _x.domain() : brush.extent())

        focus
            .select("g.volume")
            // .call(volumes_plot)
        focus
            .select("g.candlestick")
            .call(candlesticks_plot)
        focus
            .select("g.y.axis")
            .call(y_axis)
        focus
            .select("g.x.axis")
            .call(x_axis)
    }

    draw();
}


function tester() {
}

