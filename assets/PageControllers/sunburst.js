$(document).ready(function() {
    System.importAll({
        select: '/Components/Select.js',
    })
    .then(function(imported) {

        Vue.component('my-select', imported.select);

        window.vm = new Vue({
            el: '#vue',
            template: [
                '<div class="sunburst">',
                    '<div>',
                        '<span class="ib mr-10">Группировка по:</span>',
                        '<my-select',
                            ':values="opts"',
                            ':selected.sync="currentOpt"',
                            '>',
                        '</my-select>',
                    '</div>',
                    '<svg v-el:svg></svg>',
                '</div>',
            ].join(' '),
            components: {
            },
            data: {
                transition: 750,
                branches: branches || [],
                tickers : tickers  || [],
                opts: [
                    {name: 'количеству компаний', value: 'byCount'},
                    {name: 'рыночной капитализации', value: 'MarketCap'},
                    {name: 'выручке за последний год', value: 'EARNINGS'},
                    {name: 'стоимости ликвидных активов (наличные, облигации)', value: 'CASH'},
                    {name: 'cтоимости активов за вычетом долгов', value: 'BALANCE'},
                    {name: 'обязательствам (краткосрочные + долгосрочные)', value: 'DEBT'},
                    {name: 'дивиденды за 365 дней', value: 'DIVS'},
                    // {name: 'EV', value: 'EV'},
                    // {name: 'DEBT', value: 'DEBT'},
                    // {name: 'EBITDA', value: 'EBITDA'},
                ],
                currentOpt: 'MarketCap',
                hovered: null,
            },
            watch: {
                currentOpt: function() {
                    this.redraw();
                },
            },
            methods: {
                redraw: function() {
                    console.warn('ты не должен меня видеть');
                    var vm = this;
                },
                tickerFormatter: function(ticker) {
                    return _.extend({}, ticker, ticker.google, {
                        name: '<i class="fa fa-share"></i> '+ticker.name,
                    });
                },
                createData: function() {
                    var vm = this;
                    var data = {
                        name: 'Все отрасли',
                        children: _.map(vm.branches, function(branch) {
                            var tickers = _.filter(vm.tickers, {branch: branch.id});
                            return {
                                name: branch.name,
                                children: _.map(tickers, vm.tickerFormatter),
                            };
                        }),
                    };
                    data.children.push({
                        name: 'Отрасль не указана',
                        children: _(vm.tickers)
                            .filter(function(ticker) {
                                return !ticker.branch;
                            })
                            .map(vm.tickerFormatter)
                            .value(),
                    });
                    return data;
                },
                getSize: function(t) { // t - ticker
                    var opt = this.currentOpt;
                    if (opt === 'byCount') {
                        return 1;
                    }
                    var sharesCount = t.MarketCap / t.QuoteLast;

                    var earnings = t.MarketCap / t.PriceSales;
                    if (opt === 'EARNINGS') {
                        // выручка за последний год
                        return earnings;
                    }

                    var divs = sharesCount * t.DividendPerShare;
                    if (opt === 'DIVS') {
                        // дивы за 365 дней
                        return divs;
                    }

                    var balance = sharesCount * t.BookValuePerShareYear;
                    // EV
                    if (opt === 'BALANCE') {
                        // cтоимость активов за вычетом долгов
                        return balance;
                    }

                    var cash = sharesCount * t.CashPerShareYear;
                    if (opt === 'CASH') {
                        // Стоимость ликвидных активов(наличные, облигации)
                        return cash;
                    }

                    var debt = t.TotalDebtToAssetsYear * balance / (100 - t.TotalDebtToAssetsYear);
                    // DEBT
                    if (opt === 'DEBT') {
                        // краткосрочные + долгосрочные
                        return debt;
                    }

                    // // Получено от Сергея:
                    // if (opt === 'DEBT') {
                    //     return t.Float * (t.QuoteLast * t.TotalDebtToEquityYear);
                    // }
                    // if (opt === 'EBITDA') {
                    //     return t.Float * (t.EBITDMargin * t.QuoteLast / t.PriceSales);
                    // }
                    // if (opt === 'EV') {
                    //     return t.Float * (t.Float * t.QuoteLast + t.CashPerShareYear - t.QuoteLast * t.LTDebtToEquityYear);
                    // }
                    //

                    if (opt) {
                        return t[opt] || 0;
                    }
                    else {
                        console.warn('что-то в поломалось в логике');
                        return 1;
                    }
                },
                createChart: function() {
                    var vm = this;

                    var width = cnt.width();
                    var height = $('.l-main').height() - 180;
                    var radius = (Math.min(width, height) / 2) - 10;

                    var x = d3.scale.linear().range([0, 2 * Math.PI]);
                    var y = d3.scale.linear().range([0, radius]);

                    var color = d3.scale.category20c();

                    var partition = d3.layout.partition()
                        .sort(null)
                        .value(function(d) {
                            var size = vm.getSize(d);
                            console.log(d.name, size);
                            return (size < 0 || size === Infinity) ? 1 : size;
                        })
                        ;

                    var tooltip = d3.select("#body")
                        .append("div")
                        .attr("class", "sunburst_tooltip nvtooltip")
                        .style("opacity", 0)
                        .style("display", 'none')
                        ;

                    function format_number(x) {
                        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                    }


                    function format_name(d) {
                        var name = d.name;
                        return '<b>' + name + '</b><br> (' + format_number(d.value.toFixed(0)) + ')';
                    }


                    var arc = d3.svg.arc()
                        .startAngle(function(d) {
                            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                        })
                        .endAngle(function(d) {
                            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
                        })
                        .innerRadius(function(d) {
                            return Math.max(0, y(d.y));
                        })
                        .outerRadius(function(d) {
                            return Math.max(0, y(d.y + d.dy));
                        });

                    var svg = d3.select(vm.$els.svg)
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


                    var path = svg.selectAll("path")
                        .data(partition.nodes(vm.createData()))
                        .enter().append("path")
                            .attr("d", arc)
                            .style("fill", function(d) {
                                return color((d.children ? d : d.parent).name);
                            })
                            .attr("class", function(d) {
                                return d.children ? '' : 'leaf';
                            })
                            .on("click", click)
                            .on("mouseover", function(d) {
                                vm.hovered = d;
                                tooltip.html(function() {
                                    var name = format_name(d);
                                    return name;
                                });
                                return tooltip.transition()
                                    .duration(50)
                                    .style("opacity", 0.9)
                                    .style('display', 'block')
                                    ;
                            })
                            .on("mousemove", function(d) {
                                return tooltip
                                    .style("top", (d3.event.pageY - 10) + "px")
                                    .style("left", (d3.event.pageX + 10) + "px");
                            })
                            .on("mouseout", function() {
                                vm.hovered = null;
                                return tooltip.style("opacity", 0).style('display', 'none');
                            })
                            .each(function(d) {
                                this.x0 = d.x;
                                this.dx0 = d.dx;
                            })
                            ;

                    function click(d) {
                        console.debug(_.extend({}, d));
                        if (!d.name) {
                            return;
                        }
                        if (!d.children) {
                            window.open('/services/shares/'+d.href);
                            return;
                        }
                        svg.transition()
                            .duration(vm.transition)
                            .tween("scale", function() {
                                var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                                    yd = d3.interpolate(y.domain(), [d.y, 1]),
                                    yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
                                return function(t) {
                                    x.domain(xd(t));
                                    y.domain(yd(t)).range(yr(t));
                                };
                            })
                            .selectAll("path")
                            .attrTween("d", function(d) {
                                return function() {
                                    return arc(d);
                                };
                            });
                    }

                    d3.select(self.frameElement).style("height", height + "px");

                    vm.redraw = function() {
                        // иду на "первый уровень"
                        click({x:0, y:0, dx: 1, dy: 1/3});

                        path.data(partition.nodes(vm.createData()))
                            .transition()
                            .duration(vm.transition)
                            .attrTween("d", function(a) {
                                var current = this;
                                var i = d3.interpolate({x: this.x0, dx: this.dx0}, a);
                                return function(t) {
                                    var b = i(t);
                                    current.x0 = b.x;
                                    current.dx0 = b.dx;
                                    return arc(b);
                                };
                            })
                            ;
                    };
                },
            },
            ready: function() {
                this.createChart();
            },
        });
    })
    .catch(function(err) {
        console.error(err);
        mp.alert('Что-то пошло не так!');
    })
    ;
});
