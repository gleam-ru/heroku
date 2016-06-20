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

                    '<h3>Учитывать прогноз: ',
                        '<i',
                            'class="fa cp"',
                            ':class="{\'fa-check-square-o\': withForecast, \'fa-square-o\': !withForecast}"',
                            '@click="withForecast = !withForecast"',
                            '>',
                        '</i>',
                    '</h3>',
                    '<p>',
                        'Данные предоставлены сайтом ',
                        '<a href="http://www.dohod.ru/" target=_blank>dohod.ru</a>',
                        '<span @click="openDonor">'+Jade.els.roundIcon('fa-share')+'</span>',
                    '</p>',
                    '<h3>Дивиденды в: ',
                        '<span',
                            'v-if="divsRub"',
                            'class="clickable"',
                            // ':class="{clicked: divsRub}"',
                            '@click="divsRub = !divsRub"',
                            '>',
                            'рублях',
                        '</span>',
                        '<span',
                            'v-else',
                            'class="clickable"',
                            // ':class="{clicked: !divsRub}"',
                            '@click="divsRub = !divsRub"',
                            '>',
                            'процентах',
                        '</span>',
                    '</h3>',

                    '<svg v-el:svg style="height:400px;"></svg>',

                    '<p>',
                        '{{completeTicker.divs_comment}}',
                    '</p>',

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
                    withForecast: $.cookie('with_forecast') || false,
                    divsRub: $.cookie('divs_rub') || false,
                    formattedData: null,
                };
            },
            //
            //
            //
            methods: {
                openDonor: function() {
                    window.open('http://www.dohod.ru/ik/analytics/dividend/'+this.completeTicker.code);
                },
                formatData: function() {
                    var vm = this;

                    var data = _.cMap(vm.completeTicker.divs, function(d) {
                        if (!vm.withForecast && d.is_forecast && !d.value_recommended) {
                            return;
                        }
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

                    // среднее что-то за период
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



                    /**
                     * Рассчитываю "дивидендную доходность" в процентах
                     * Логика - дивиденд / средняя за 3 месяца до закрытия реестра
                     *
                     */
                    function getAvgPrice(date, period) {
                        var to = moment(date, ddf);
                        var fr = moment(date, ddf).add(-(period || 3), 'month');
                        var avgPrice = _(vm.completeTicker.candlesHistory.data)
                            .filter(function(candle) {
                                var date = moment(candle.d, ddf);
                                return date > fr && date < to;
                            })
                            .map('c') // close
                            .mean() // average
                            ;
                        return avgPrice;
                    }

                    data = _.map(data, function(d, i, arr) {
                        if (!d.reestrdate || !d.value) {
                            return d;
                        }
                        return _.extend(d, {
                            divPercent: d.value / getAvgPrice(d.reestrdate, 3) * 100,
                        });
                    });


                    return data;
                },
                formatCharts: function() {
                    var vm = this;
                    var data = vm.formattedData = vm.formattedData || vm.formatData();
                    var charts = [];

                    if (vm.divsRub) {
                        charts.push({
                            key: 'Дивиденд (₽)',
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
                    }
                    else {
                        charts.push({
                            key: 'Дивиденд (%)',
                            type: 'bar',
                            yAxis: 2,
                            color: '#1abc9c',
                            values: _.map(data, function(d, i) {
                                return {
                                    x: d.year,
                                    y: d.divPercent,
                                };
                            }),
                        });
                    }


                    // charts.push({
                    //     key: 'Ср. за 5 лет',
                    //     type: 'line',
                    //     color: '#2C3E50',
                    //     yAxis: 2,
                    //     values: _.map(data, function(d) {
                    //         return {
                    //             x: d.year,
                    //             y: d.avg5,
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

                    // charts.push({
                    //     key: '100%',
                    //     type: 'line',
                    //     color: '#E08D8D',
                    //     yAxis: 1,
                    //     showLegend: false,
                    //     // disabled: true,
                    //     values: _.map(data, function(d) {
                    //         return {
                    //             x: d.year,
                    //             y: 100,
                    //         };
                    //     }),
                    // });

                    return charts;
                },
                formatTooltip: function(obj) {
                    var vm = this;
                    var d = this.formattedData[obj.index];

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
                                '<tr>',
                                    '<td>Див. доходность</td>',
                                    '<td>'+fix(d.divPercent)+'%</td>',
                                '</tr>',
                            '</table>',
                        '</div>',
                    ].join(' ');
                    // return JSON.stringify(obj);
                },

                drawChart: function() {
                    var vm = this;
                    var chart;
                    nv.addGraph(function() {
                        chart = window.chart = nv.models.multiChart()
                            .options({
                                forceY: 0,
                                interpolate: 'monotone',
                                // showLegend: false,
                                margin: {left: 50, right: 50, top: 30, bottom: 30}
                            });

                        chart.tooltip.contentGenerator(vm.formatTooltip);

                        var charts = vm.formatCharts();

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

                        if (!vm.divsRub) {
                            chart.yAxis2
                                .tickFormat(function(d,i){
                                    return d3.format(',.1f')(d)+'%';
                                })
                                ;
                        }
                        else {
                            chart.yAxis2
                                .tickFormat(function(d,i){
                                    return d3.format(',.1f')(d)+'руб.';
                                })
                                ;
                        }


                        d3.select(vm.$els.svg)
                            .datum(charts)
                            .transition().duration(500)
                            .call(chart)
                            ;

                        nv.utils.windowResize(chart.update);

                        vm.afterRender();

                        return chart;
                    });
                },
                // мои доработки отрисованного чарта
                afterRender: function() {
                    // console.debug('afterRender');
                    // // ширина одного бара
                    // var width = 0;
                    // d3.selectAll('.bars1Wrap .nv-bar')
                    //     .attr('width', function() {
                    //         var bar = this;
                    //         if (!width) {
                    //             width = parseFloat(bar.getAttribute('width')) / 2;
                    //         }
                    //         return width;
                    //     })
                    //     ;
                    // d3.selectAll('.bars2Wrap .nv-bar')
                    //     .attr('width', width)
                    //     .attr('x', function() {
                    //         var bar = this;
                    //         var x = parseFloat(bar.getAttribute('x'));
                    //         return x + width;
                    //     })
                    //     ;


                    var barsNode = d3.select('.bars2Wrap').node();
                    if (barsNode) {
                        barsNode.parentNode.insertBefore(
                            d3.select('.bars2Wrap').node(),
                            d3.select('.lines1Wrap').node()
                        );
                    }
                }
            },
            watch: {
                withForecast: function(val) {
                    $.cookie('with_forecast', val ? 'yep' : '');
                    this.drawChart();
                },
                divsRub: function(val) {
                    $.cookie('divs_rub', val ? 'yep' : '');
                    this.drawChart();
                },
                completeTicker: function() {
                    this.drawChart();
                },
            },
            //
            //
            //
            ready: function() {
                var vm = this;
                window.vm = this;

                if (window.completeTicker) {
                    // данные уже загружены
                    vm.completeTicker = window.completeTicker;
                    return;
                }

                var view = $('#shares');
                view.mask();

                $.get('/services/shares/'+vm.ticker.id+'/info')
                .done(function(data) {
                    vm.completeTicker = window.completeTicker = _.extend({
                        candlesHistory: []
                    }, data);
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

