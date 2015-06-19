$(document).ready(function() {

    var additional;
    var filters;
    var columns;
    var rows;

    var view = $('.content');
    view.mask();

    var calculator = initCalculator();

    var loaded = _.after(3, function() {
        window.qwe = new MyTable({
            el: '#bonds-table',
            data: {
                additional  : additional,
                filters     : filters,
                filters_api : href+'/updateFilter',
                rows        : rows,
                columns     : columns,
                isReady     : function() {
                    view.mask(false);
                    // TODO: переделать нормально
                    var helper = $('.showHelp').first();
                    helper.click(function() {
                        // mp.alert('hello');
                        if (!window.mp_help) {
                            var el = $('<a class="invisible" href="'+href+'/help'+'"></a>');
                            window.mp_help = el.magnificPopup({
                                type: 'ajax',
                                closeOnContentClick: false,
                                closeOnBgClick: true,
                                closeBtnInside: true,
                            });
                        }
                        window.mp_help.click();
                    });

                    $('.tt').each(function() {
                        $(this).tooltipster({
                            position: 'top',
                            maxWidth: 200,
                        });
                    });

                },
            }
        });
    });


    // получаю дополнительную информацию (верхний левый угол)
    $.get(href+'/additional')
    .done(function(loaded) {
        additional = loaded.data;
    })
    .always(function() {
        loaded();
    });


    // получаю сохраненные фильтры
    $.get(href+'/filters')
    .done(function(loaded) {
        filters = loaded.data;
    })
    .fail(function(err) {
        alert('smth went wrong...');
        console.error(err);
    })
    .always(function() {
        loaded();
    });


    // получаю данные для таблицы
    $.get(href+'/all')
    .done(function(loaded) {
        // я это делаю не на сервере, потому что
        // передавать ключи от 1к+ объектов - слишком много трафика
        rows = _.map(loaded.data, function(row) {
            return {
                id             : row[0],
                name           : row[1],
                num            : row[2],
                rate           : row[3],
                cpVal          : row[4],
                cpDur          : row[5],
                endDate        : row[6],
                bid            : row[7],
                ask            : row[8],
                nkd            : row[9],
                cpDate         : row[10],
                state          : row[11],
                expiresIn      : row[12],
                cpYie          : row[13],
                price          : row[14],
                percent        : row[15],
                percent_woRT   : row[16],
                percent_woRTCT : row[17],
            }
        });
    })
    .fail(function(err) {
        alert('smth went wrong...');
        console.error(err);
    })
    .always(function() {
        loaded();
    });


    // описание колонок для datatables
    columns = [
        {
            id: "id",
            data: "id",
            title: "ID",
            filterType: "number",
            visible: false,
        }, {
            id: "name",
            data: "name",
            title: "Наименование",
            filterType: "string",
        }, {
            className: "buttonColumn custom",
            data: null,
            defaultContent: Jade.els.roundIcon('fa-calculator'),
            handler: function(data) { // row data
                calculator.setData(data);
                $.magnificPopup.open({
                    items: {
                        src: calculator.getView(),
                        type: 'inline',
                    },
                });
            },
        }, {
            className: "buttonColumn custom",
            data: null,
            defaultContent: Jade.els.roundIcon('fa-plus'),
            handler: function() {
                mp.alert(messages.not_implemented);
            },
        }, {
            id: "bid",
            data: "bid",
            title: "Предл.",
            filterType: "number",
        }, {
            id: "ask",
            data: "ask",
            title: "Спрос",
            filterType: "number",
        }, {
            id: "endDate",
            data: "endDate",
            title: "Погаш.",
            filterType: "date",
        }, {
            id: "expiresIn",
            data: "expiresIn",
            title: "Погаш. (дни)",
            filterType: "number",
        }, {
            id: "cpVal",
            data: "cpVal",
            title: "Купон (%)",
            filterType: "number",
            visible: false,
        }, {
            id: "cpDur",
            data: "cpDur",
            title: "Купон (дни)",
            filterType: "number",
            visible: false,
        }, {
            id: "percent",
            data: "percent",
            className: "percent",
            vueTitle: 'Доходность (%)',
            title: "Д-1 (%)"+
                '<span class="tt" title="Простая доходность">'+
                    Jade.els.roundIcon('fa-question')+
                '</span>',
            filterType: "number",
        }, {
            id: "percent_woRT",
            data: "percent_woRT",
            className: "percent_woRT",
            filterType: "number",
            vueTitle: 'Доходность (%, без налога с разницы покупка/продажа)',
            title: "Д-2 (%)"+
                '<span class="tt" title="Доходность без налога с разницы покупка/продажа">'+
                    Jade.els.roundIcon('fa-question')+
                '</span>',
        }, {
            id: "percent_woRTCT",
            data: "percent_woRTCT",
            className: "percent_woRTCT",
            filterType: "number",
            vueTitle: 'Доходность (%, без всех налогов)',
            title: "Д-3 (%)"+
                '<span class="tt" title="Доходность без налога с разницы покупка/продажа и налога с купона">'+
                    Jade.els.roundIcon('fa-question')+
                '</span>',
        },
    ];

});

function initCalculator() {
    return new Vue({
        el: '#calculator',
        data: function() {
            return {
                bid: 0,
                percent: 0,
                percent_woRT: 0,
                percent_woRTCT: 0,
                bond: {
                    name: ''
                },
            }
        },
        watch: {
            bid: function() {
                var vm = this;
                var bond = vm.bond;

                vm.bid = parseFloat(vm.bid);
                if (!vm.bid) {
                    vm.bid = ''
                    vm.percent = '';
                    vm.percent_woRT = '';
                    vm.percent_woRTCT = '';
                    return;
                }

                vm.bond.bid = vm.bid;
                // настоящая цена
                bond.price = bond.rate * bond.bid / 100 + bond.nkd;

                var buy_price  = bond.rate * (bond.bid / 100) + bond.nkd;

                // полученные в будущем купоны (штук)
                var futureCps = Math.ceil(bond.expiresIn / bond.cpDur);
                // (по аналогии с nkd) - купонный доход, который будет выплачен при погашении
                var kd = futureCps * bond.cpVal;
                var sell_price = bond.rate + kd;

                var taxes = 0.13; // 13% ндс
                var partOfYear = bond.expiresIn / 365;

                // налоги по разнице между покупкой и продажей
                var taxes_rate = (bond.bid < 100) ? (1 - 0.01 * bond.bid) * bond.rate * taxes : 0;
                // налоги по купону
                var taxes_cp = kd * taxes;

                vm.percent = (sell_price / buy_price - 1) / partOfYear * 100;
                // withoutRateTaxes
                vm.percent_woRT = ((sell_price - taxes_rate) / buy_price - 1) / partOfYear * 100;
                // withoutRateTaxes and CouponTaxes
                vm.percent_woRTCT = ((sell_price - taxes_rate - taxes_cp) / buy_price - 1) / partOfYear * 100;
            },
            // TODO: дописать обратную связь
        },
        methods: {
            getView: function() {
                return $(this.$$.calculator)
            },
            setData: function(data) {
                var vm = this;
                vm.bond = data;
                vm.bid = data.bid;
                var bond = vm.bond;
                bond.price = parseFloat(bond.price).toFixed(0);
                bond.cpYie = parseFloat(bond.cpYie).toFixed(2);
            },
            toFixed: function(num, len) {
                if (!num) num = 0;
                if (!len) len = 0;
                return parseFloat(num).toFixed(len);
            }
        },
        compiled: function() {
            var vm = this;
            vm.bid = vm.$$.bid;
        },
    });
}
