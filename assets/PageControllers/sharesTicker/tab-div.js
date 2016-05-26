module.exports = function(resolve) {
    var accum = {};
    System.importAll({
        _raw: [
        ]
    })
    .then(function(imported) {
        return {
            template: [
                '<div>',
                '</div>',
            ].join(' '),
            //
            //
            //
            props: [],
            data: function() {
                return {
                    ticker: window.ticker || {},
                    completeTicker: {},
                };
            },
            //
            //
            //
            watch: {
                completeTicker: function() {
                    var vm = this;

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
                            .select(vm.$el)
                            .append('svg')
                            .attr('height', 400)
                            .datum(exampleData(vm.completeTicker))
                            .call(chart);

                        nv.utils.windowResize(chart.update);

                        return chart;
                    });

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

                        return [total];
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

                },
            },
            //
            //
            //
            ready: function() {
                var vm = this;

                if (window.completeTicker) {
                    // данные уже загружены
                    vm.completeTicker = window.completeTicker;
                    return;
                }

                var view = $('#shares');
                view.mask();

                $.get('/services/shares/'+vm.ticker.id+'/info')
                .done(function(data) {
                    vm.completeTicker = window.completeTicker = data;
                })
                .fail(function(msg) {
                    console.error(msg);
                    mp.alert('что-то пошло не так...');
                })
                .always(function() {
                    view.mask(false);
                })
                ;
            },
        };
    })
    .then(resolve)
    ;
};


/**
 * Не уверен в актуальности с 26.05.2016
 *
 */
