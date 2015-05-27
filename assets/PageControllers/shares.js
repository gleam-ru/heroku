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
    // candles = candles.slice(0, 360);
    var accessor = techan.plot.candlestick().accessor();
    var parseDate = d3.time.format("%Y-%m-%d").parse;
    candles = candles.map(function(c) {
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

    // chart
    var margin = [20, 0, 20, 30];
    var width = $('#shares').width() - margin[1] - margin[3];
    var height = 500 - margin[0] - margin[2];

    // brusher
    var b_width = $('#shares').width();
    var b_height = 80;
        margin[2] += b_height;



//  ╔═╗╦  ╦╔═╗
//  ╚═╗╚╗╔╝║ ╦
//  ╚═╝ ╚╝ ╚═╝
//  @svg

    // поле для творчества
    var svg = d3.select("#shares").append("svg")
        .attr("width", width + margin[3] + margin[1])
        .attr("height", height + margin[0] + margin[2] + b_height)
        // .append("g")
        // .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");


    // график
    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")")
        .attr('opacity', 1)
        // видимая область
        // чтобы не рендерить лишнее - .attr("clip-path", "url(#clip)")
        focus
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);

        // объемы
        var gVolume = focus.append("g").attr("clip-path", "url(#clip)")
            .attr("class", "volume")
            .datum(candles)

        // свечки
        var gCandles = focus.append("g")
            .attr("class", "candlestick")
            .attr("clip-path", "url(#clip)")
            .datum(candles)

        var gAxisX = focus.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")");

        var gAxisY = focus.append("g")
            .attr("class", "y axis")


    // всяко разно
    // (нижнаяя панель с брашером)
    var ctx = svg.append("g")
        .attr("class", "ctx")
        .attr("transform", "translate(0," + (height + margin[2]) + ")");

        // брашер (график)
        var gBrusherPlot = ctx.append("g")
            .attr("class", "close")
            .datum(candles)

        // брашер (ось времени)
        var gBrusherX = ctx.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + b_height + ")");

        var gBrusherSelection = ctx.append("g")
            .attr("class", "brusher")
//*/



//  ╔═╗╔═╗╔╗╔╔╦╗╦  ╔═╗╔═╗
//  ║  ╠═╣║║║ ║║║  ║╣ ╚═╗
//  ╚═╝╩ ╩╝╚╝═╩╝╩═╝╚═╝╚═╝
//  @candles

    // время
    var x = techan.scale
        .financetime()
        .domain(candles.map(accessor.d)) // TODO WTF?! oO почему тут массив из дохера элементов?!
        .range([0, width]);

    // цена
    var y = d3.scale
        .linear()
        .domain(techan.scale.plot.ohlc(candles, accessor).domain())
        .range([height, 0]);

    // график
    var candlesticks_plot = techan.plot
        .candlestick()
        .xScale(x)
        .yScale(y)

//*/



//  ╦  ╦╔═╗╦  ╦ ╦╔╦╗╔═╗╔═╗
//  ╚╗╔╝║ ║║  ║ ║║║║║╣ ╚═╗
//   ╚╝ ╚═╝╩═╝╚═╝╩ ╩╚═╝╚═╝
//  @volumes

    // объемы
    var y_volume = d3
        .scale
        .linear()
        .range([y(0), y(0.2)])
        .domain(
            techan.scale.plot
                .volume(candles)
                .domain()
        )

    var volumes_plot = techan
        .plot
        .volume()
        .xScale(x)
        .yScale(y_volume)
//*/


//  ╔╗ ╦═╗╦ ╦╔═╗╦ ╦╔═╗╦═╗
//  ╠╩╗╠╦╝║ ║╚═╗╠═╣║╣ ╠╦╝
//  ╚═╝╩╚═╚═╝╚═╝╩ ╩╚═╝╩╚═
//  @brusher

    // время
    var b_x = techan
        .scale
        .financetime()
        .domain(x.domain())
        .range([0, b_width]);

    // цена
    var b_y = d3
        .scale
        .linear()
        .domain(y.domain())
        .range([b_height, 0]);


    // график
    gBrusherPlot
        .call(
            techan.plot
                .close()
                .xScale(b_x)
                .yScale(b_y)
        )

    // заполняю ось данными
    gBrusherX
        .call(
            d3.svg
                .axis()
                .scale(b_x)
                .orient("bottom")
        )

    // сам брашер.
    var brush = d3.svg
        .brush()
        .on("brushend", brushended);

    brush.x(
        d3.scale
            .linear()
            // если я правильно понял, то zoomable превращает
            // набор данных оси в "номера свечек"
            .domain(b_x.zoomable().domain())
            .range(b_x.range())
    )

    gBrusherSelection
        .call(brush)
        .selectAll("rect")
        .attr("height", b_height)
//*/



//  ╔═╗═╗ ╦╦╔═╗
//  ╠═╣╔╩╦╝║╚═╗
//  ╩ ╩╩ ╚═╩╚═╝
//  @axis

    var x_axis_data = d3
        .svg
        .axis()
        .scale(x)
        .orient("bottom")

    var y_axis_data = d3
        .svg
        .axis()
        .scale(y)
        .orient("left")
//*/



//  ╔═╗╔═╗╔═╗╔═╗
//  ╠╣ ║ ║║ ║╚═╗
//  ╚  ╚═╝╚═╝╚═╝
//  @foo


    // @brushended
    // валидация данных брашера
    function brushended() {
        // only transition after input
        if (!d3.event.sourceEvent) return;

        var extent = brush.extent(); //.map(Math.round);
        // был просто клик
        if (brush.empty()) { // Math.abs(extent[0] - extent[1]) < 180) {
            extent[1] = extent[0] + 180;
        }

        // анимация при выборе другого диапазона
        focus
            .transition()
            .duration(350)
            .attr('opacity', 0)
            .each('end', function() {
                draw()
                focus
                    .transition()
                    .duration(200)
                    .attr('opacity', 1)
            })

        // анимация "удлинения" выбранного диапазона
        // (например при клике)
        d3
            .select(this)
            .transition()
            .duration(300)
            .call(brush.extent(extent))
            .call(brush.event)
            // .each('end', draw) // без анимации выглядит как тормоза...

        // draw()
    }


    // @draw
    // отрисовывает видимые данные
    function draw() {
        // привязка данных брашера к данным графика
        // https://github.com/andredumas/techan.js/blob/54e14442e30d7bd779e8fd4d9cddd25dc69a3cb6/src/scale/zoomable.js
        var visibleCandlesRange = brush.empty() ? brush.x().domain() : brush.extent();
        x // ось
            .zoomable() // получить связанный набор свечек
            .domain(visibleCandlesRange) // установить видимые свечи


        // изменить Y ось, согласно видимым свечам
        var data = gCandles.datum();
        // типо строим виртуальный график, получаем его домен
        // и подставляем его в реальный график
        y.domain(
            techan.scale.plot.ohlc(
                data
                    .slice // делаем копию, как я понял (чтобы не побить исходник)
                    .apply(data, visibleCandlesRange),
                accessor // яхз что это
            )
            .domain()
        )


        // drawing
        gAxisX.call(x_axis_data)
        gAxisY.call(y_axis_data)
        gVolume.call(volumes_plot)
        gCandles
            // .transition() // techan пока что (27.05.2014) так не умеет
            .call(candlesticks_plot)
    }
    draw();
//*/
}
