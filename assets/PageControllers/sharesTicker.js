$(document).ready(function() {
    var view = $('#shares');
    view.mask();


    $.get('/services/shares/'+ticker.id+'/info')
    .done(function(data) {
        var msg = data.msg;
        if (msg) {
            return mp.alert(msg);
        }

        window.qwe = new VueTabs({
            el: '#shares',
            data: {
                tabs: [
                    {
                        name        : 'Цена',
                        alias       : 'price',
                        component   : 'tab_price',
                        active      : false,
                    }, {
                        name        : 'Дивиденды',
                        alias       : 'divs',
                        component   : 'tab_divs',
                        active      : false,
                        activatedCb : function() {
                            var ev = document.createEvent('UIEvents');
                            ev.initUIEvent('resize', true, false, window, 0);
                            window.dispatchEvent(ev);
                        },
                    }
                ]
            },
            components: {
                tab_price   : tab_price(data),
                tab_divs    : tab_divs(data),
            },
        });

    })
    .always(function() {
        view.mask(false);
    })
    .fail(function(msg) {
        console.error(msg);
        mp.alert('что-то пошло не так...');
    });
    //*/
});

var tab_price = function(data) {
    return {
        compiled: function() {
            createChart(this.$el, data, function() {});
        }
    }
}

var tab_divs = function(data) {
    return {
        template: '<div id="ticker_divs"></div>',
        ready: function() {
            gogogo(this.$el, data);
        }
    }
}



function gogogo(el, data) {
    nv.addGraph(function() {
        var chart = nv.models.discreteBarChart()
          .x(function(d) { return d[0] })   //We can modify the data accessor functions...
          .y(function(d) { return d[1] })   //...in case your data is formatted differently.
          .tooltips(true)        //Don't show tooltips
          .showValues(true)       //...instead, show the bar value right on top of each bar.
          .color(["#2C3E50"])
          // .stacked(true)
        ;

        // chart.tooltip.contentGenerator(function (obj) { return obj.data[2]})

        chart.xAxis
            .tickFormat(function(d) {
                return d3.time.format('%Y')(new Date(d))
            });


        d3
            .select(el)
            .append('svg')
            .attr('height', 400)
            .datum(exampleData(data))
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
}

//Each bar represents a single discrete quantity.
function exampleData(data) {
    window.data = data;

    var formattedDivs = _.map(data.divs, formatter);
    var minYear = _.min(formattedDivs, 'year').year;
    var currYear = moment().year();
    var tmp = {};
    for(var i = minYear; i <= currYear; i++) {
        tmp['_'+i] = {
            year: i,
            total: 0,
            divs: [],
        }
    }

    _.each(formattedDivs, function(d) {
        tmp['_'+d.year].total += parseFloat(d.value);
        tmp['_'+d.year].divs.push(d);
    })

    var newDivs = _.map(tmp, function(v) {
        return v;
    })


    newDivs = _.map(newDivs, function(d) {
        var nd = _.cloneDeep(d);
        nd.normal = [];
        nd.partitial = [];
        _.each(d.divs, function(div) {
            if (div.partitial) {
                nd.partitial.push(div);
            }
            else {
                nd.normal.push(div);
            }
        })
        return nd;
    })

    var total = {
        key: "Divs1",
        values: _.map(newDivs, function(d) {
            return [
                moment('01.01.'+d.year, ddf).toDate().getTime(),
                d.total,
                ""
            ]
        })
    };

    // var normal = {
    //     key: "Divs2",
    //     values: _.compact(_.map(newDivs, function(d) {
    //         if (d.normal && d.normal.length) {
    //             return [
    //                 moment('01.01.'+d.year, ddf).toDate().getTime(),
    //                 _.first(d.normal).value, // d.total,
    //                 _.first(d.normal).formattedComment,
    //             ]
    //         }
    //     }))
    // }

    // var partitial = {
    //     key: "Divs3",
    //     values: _.compact(_.map(newDivs, function(d) {
    //         if (d.partitial && d.partitial.length) {
    //             return [
    //                 moment('01.01.'+d.year, ddf).toDate().getTime(),
    //                 _.first(d.partitial).value, // d.total,
    //                 _.first(d.partitial).formattedComment,
    //             ]
    //         }
    //     }))
    // }

    return [total]//, normal, partitial]
}

var formatter = function(d) {
    var formattedComment = "";
    if (d.comment) {
        formattedComment += "Промежуточный дивиденд: <br />";
        formattedComment += d.comment+": "+d.value+" "+d.currency+"<br />";
        formattedComment += "Отсечка: "+d.closed;
    }
    else {
        formattedComment += "Дивиденд: "+d.value+" "+d.currency+"<br />";
        formattedComment += "Отсечка: "+d.closed;
    }
    return _.extend({}, d, {
        year: moment(d.closed, ddf).year(),
        formattedComment: formattedComment,
        partitial: d.comment ? true : false,
    })
}
