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

                    '<p>',
                        'Данные предоставлены сайтом ',
                        '<a href="http://www.dohod.ru/" target=_blank>dohod.ru</a>',
                        '<span @click="openDonor">'+Jade.els.roundIcon('fa-share')+'</span>',
                    '</p>',
                    '<p>',
                        '{{completeTicker.divs_comment}}',
                    '</p>',

                    '<svg v-el:svg style="height:400px;"></svg>',

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
            methods: {
                openDonor: function() {
                    window.open('http://www.dohod.ru/ik/analytics/dividend/'+this.completeTicker.code);
                },
            },
            watch: {
                completeTicker: function() {
                    var vm = this;

                    nv.addGraph(function() {
                        var chart = window.chart = nv.models.multiChart()
                            .options({
                                forceY: 0,
                                interpolate: 'monotone',
                                // showLegend: false,
                                // margin: {left: 50, right: 25, top: 25, bottom: 30}
                            });


                        var data = _.map(vm.completeTicker.divs, function(d) {
                            var date = moment(d.reestrdate, ddf);
                            return _.extend({}, d, {
                                profitpercent: parseFloat(d.profitpercent) || 0,
                                value: parseFloat(d.value) || 0,
                                year: moment(d.reestrdate, ddf).year(),
                            });
                        });

                        var min = _.min(_.map(data, 'year'));
                        var max = _.max(_.map(data, 'year'));
                        var current = min;

                        while (current < max) {
                            var found = _.find(data, {year: current});
                            if (!found) {
                                data.push({
                                    profitpercent: 0,
                                    value: 0,
                                    year: current,
                                });
                            }
                            current++;
                        }
                        data = _.sortBy(data, 'year');
                        // сворачиваю года в один "дивиденд"
                        data = _.reduce(data, function(result, current) {
                            var found = _.find(result, {year: current.year});
                            if (found) {
                                _.extend(found, {
                                    value: found.value + current.value,
                                    profitpercent: found.profitpercent + current.profitpercent,
                                });
                            }
                            else {
                                result.push(current);
                            }
                            return result;
                        }, []);

                        function calcAvg(arr, fr, to) {
                            var avg = _(arr)
                                .slice(_.max([fr, 0]), to + 1)
                                .map('value')
                                .mean()
                                ;
                            if (!avg) {
                                avg = 0.0;
                            }
                            return avg;
                        }

                        data = _.map(data, function(d, i, arr) {
                            var to = i;
                            var from3  = to - 2;
                            var from5  = to - 4;
                            var from10 = to - 9;

                            return _.extend(d, {
                                avg3:  calcAvg(arr, from3, to),
                                avg5:  calcAvg(arr, from5, to),
                                avg10: calcAvg(arr, from10, to),
                            });
                        });

                        chart.tooltip.contentGenerator(function (obj) {
                            var d = data[obj.index];

                            function fix(val) {
                                var symbols = -Math.log10(val) + 3;
                                symbols = symbols < 0 ? 0 : symbols > 10 ? 10 : symbols;
                                return val.toFixed(symbols);
                            }

                            return [
                                '<div class="nv-tt">',
                                    '<h3><b>'+d.year+'</b></h3>',
                                    '<table class="nv-tt-table">',
                                        // '<tr>',
                                        //     '<td>Закрытие реестра</td>',
                                        //     '<td>'+d.reestrdate+'</td>',
                                        // '</tr>',
                                        // '<tr>',
                                        //     '<td>Дата выплаты</td>',
                                        //     '<td>'+d.paydate+'</td>',
                                        // '</tr>',
                                        '<tr>',
                                            '<td>Дивиденд (руб.)</td>',
                                            '<td>'+fix(d.value)+'</td>',
                                        '</tr>',
                                        '<tr>',
                                            '<td>Процент прибыли</td>',
                                            '<td>'+d.profitpercent+'%</td>',
                                        '</tr>',
                                        '<tr>',
                                            '<td>Ср. див. за 3 года</td>',
                                            '<td>'+fix(d.avg3)+'</td>',
                                        '</tr>',
                                        '<tr>',
                                            '<td>Ср. див. за 5 лет</td>',
                                            '<td>'+fix(d.avg5)+'</td>',
                                        '</tr>',
                                        '<tr>',
                                            '<td>Ср. див. за 10 лет</td>',
                                            '<td>'+fix(d.avg10)+'</td>',
                                        '</tr>',
                                    '</table>',
                                '</div>',
                            ].join(' ');
                            // return JSON.stringify(obj);
                        });


                        var charts = [];

                        charts.push({
                            key: 'Дивиденд',
                            type: 'bar',
                            yAxis: 2,
                            color: '#2C3E50',
                            values: _.map(data, function(d, i) {
                                return {
                                    x: d.year,
                                    y: d.value,
                                };
                            }),
                        });

                        // charts.push({
                        //     key: 'Ср. за 3 года',
                        //     type: 'line',
                        //     color: '#bcbd22',
                        //     yAxis: 2,
                        //     values: _.map(data, function(d) {
                        //         return {
                        //             x: d.year,
                        //             y: d.avg3,
                        //         };
                        //     }),
                        // });
                        charts.push({
                            key: 'Ср. за 5 лет',
                            type: 'line',
                            color: '#fd8d3c',
                            yAxis: 2,
                            values: _.map(data, function(d) {
                                return {
                                    x: d.year,
                                    y: d.avg5,
                                };
                            }),
                        });
                        // charts.push({
                        //     key: 'Ср. за 10 лет',
                        //     type: 'line',
                        //     color: '#e6550d',
                        //     yAxis: 2,
                        //     values: _.map(data, function(d) {
                        //         return {
                        //             x: d.year,
                        //             y: d.avg10,
                        //         };
                        //     }),
                        // });

                        charts.push({
                            key: 'Процент прибыли',
                            type: 'line',
                            color: '#f00',
                            yAxis: 1,
                            values: _.map(data, function(d) {
                                return {
                                    x: d.year,
                                    y: d.profitpercent,
                                };
                            }),
                        });

                        charts.push({
                            key: '100%',
                            type: 'line',
                            color: '#E08D8D',
                            yAxis: 1,
                            showLegend: false,
                            // disabled: true,
                            values: _.map(data, function(d) {
                                return {
                                    x: d.year,
                                    y: 100,
                                };
                            }),
                        });


                        var dataY1 = _.flatMapDeep(charts, function(c) {
                            return c.yAxis === 1 ? _.map(c.values, 'y') : [];
                        });
                        var dataY2 = _.flatMapDeep(charts, function(c) {
                            return c.yAxis === 2 ? _.map(c.values, 'y') : [];
                        });

                        chart.yDomain1([0, _.max(dataY1)]);
                        chart.yDomain2([0, _.max(dataY2)]);


                        chart.lines1.interactive(false);
                        chart.lines1.forceY([0,100]);
                        // chart.lines1.yDomain([100, 0]);
                        chart.lines2.interactive(false);
                        // chart.lines1.isArea(true);
                        // chart.lines1.clipEdge(true);

                        chart.yAxis1
                            .tickFormat(function(d,i){
                                return d3.format(',.1f')(d)+'%';
                            })
                            ;

                        d3.select(vm.$els.svg)
                            .datum(charts)
                            .transition().duration(500)
                            .call(chart);

                        d3.select('.bars2Wrap').node().parentNode.insertBefore(
                            d3.select('.bars2Wrap').node(),
                            d3.select('.lines1Wrap').node()
                        );

                        nv.utils.windowResize(chart.update);

                        return chart;
                    });
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

