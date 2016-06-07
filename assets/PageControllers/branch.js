$(document).ready(function() {
    System.importAll({
        select: '/Components/Select.js',
    })
    .then(function(imported) {

        Vue.component('my-select', imported.select);

        window.vm = new Vue({
            el: '#vue',
            template: [
                '<div>',
                    '<my-select',
                        ':values="opts"',
                        ':selected.sync="currentOpt1"',
                        '>',
                    '</my-select>',
                    '<my-select',
                        ':values="opts"',
                        ':selected.sync="currentOpt2"',
                        '>',
                    '</my-select>',
                    '<svg v-el:svg style="height:400px;"></svg>',
                '</div>',
            ].join(' '),
            components: {
            },
            data: {
                tickers: tickers || [],
                opts: _.map(googleParams, function(i) {
                    return {
                        name: i.title_ru,
                        value: i.serverName,
                    };
                }),
                currentOpt1: 'PE',
                currentOpt2: 'LTDebtToAssetsYear',
            },
            watch: {
                currentOpt1: function() {
                    console.log('currentOpt1');
                    this.draw();
                },
                currentOpt2: function() {
                    console.log('currentOpt2');
                    this.draw();
                },
            },
            methods: {
                draw: function() {
                    var vm = this;

                    nv.addGraph(function() {

                        var chart = nv.models.scatterChart()
                            // .showDistX(true)
                            // .showDistY(true)
                            .duration(300)
                            .pointRange([100, 10000])
                            .useVoronoi(true)
                            .color(d3.scale.category10().range())
                            ;

                        // chart.xAxis.tickFormat(d3.format('.02f'));
                        // chart.yAxis.tickFormat(d3.format('.02f'));

                        chart.tooltip.contentGenerator(function (obj) {
                            return tickers[obj.pointIndex].name;
                        });

                        d3.select(vm.$els.svg)
                            .datum(nv.log(vm.createData))
                            .call(chart)
                            ;

                        nv.utils.windowResize(chart.update);

                        return chart;
                    });

                },
                createData: function() {
                    var data = [];

                    var group = {
                        key: 'test',
                        values: [],
                        slope: Math.random() - .01,
                        intercept: Math.random() - .5,
                    };

                    group.values = _.cMap(tickers, function(t) {
                        if (!t.google) {
                            return;
                        }
                        // var size = Math.log10(t.google.MarketCap);
                        var val = {
                            x: t.google[vm.currentOpt1] || 0,
                            y: t.google[vm.currentOpt2] || 0,
                            size: t.google.MarketCap,
                            ticker: t.name,
                            shape: 'circle',
                        };
                        if (!val.x || !val.y) {
                            // console.warn('not shown: ', t.name);
                            // return;
                        }
                        console.log('tick', t.name, val.size, t.google.MarketCap);
                        return val;
                    });

                    data.push(group);
                    return data;

                }
            },
            ready: function() {
                this.draw();
            },
        });
    })
    .catch(function(err) {
        console.error(err);
        mp.alert('Что-то пошло не так!');
    })
    ;
});
