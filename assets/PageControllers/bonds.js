$(document).ready(function() {

    var additional;
    var filters;
    var columns;
    var rows;

    var view = $('.content');
    view.mask();

    var calculator = initCalculator();

    var loaded = _.after(3, function() {
        System.importAll({
            twf: '/Components/TWF/index.js',
        })
        .then(function(imported) {
            window.imp = imported;
            window.vm = new Vue({
                el: '#bonds-table',
                template: [
                    '<div>',
                        '<TWF',
                            ':saveas="\'bonds/filters\'"',
                            ':info="info"',
                            ':rows="rows"',
                            ':columns="columns"',
                            ':filters="filters"',
                            '>',
                        '</TWF>',
                    '</div>',
                ].join(' '),
                components: {
                    'twf': imported.twf,
                },
                data: {
                    info: [
                        // {key: 'Данные обновлены', value: shares.info.updatedAt},
                        {key: 'Ближайшее обновление', value: 'через 15 минут'},
                    ],
                    rows: rows,
                    columns: columns,
                    filters: filters,
                },
                compiled: function() {
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
                }
            });
        })
        .catch(function(err) {
            console.error(err);
            mp.alert('Что-то пошло не так!');
        })
        ;
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
        filters = loaded.data.us.filters;
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
            };
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
            data: "id",
            title: "ID",
            filter: "number",
            bVisible: false,
        }, {
            data: "name",
            title: "Наименование",
            notHideable: true,
            bVisible: true,
            filter: "string",
        }, {
            vueTitle: 'Rusbonds',
            data: '__rusbonds',
            notHideable: true,
            bVisible: true,
            className: "buttonColumn custom",
            render: function(a, b, row, pos) {
                return [
                    '<span>',
                        Jade.els.roundIcon('fa-share'),
                    '</span>',
                ].join(' ');
            },
            handler: function(data) { // row data
                window.open('https://www.google.ru/search?q=rusbonds+'+data.num);
            },
        }, {
            vueTitle: 'Калькулятор',
            data: '__calc',
            notHideable: true,
            bVisible: true,
            className: "buttonColumn custom",
            render: function(a, b, row, pos) {
                return [
                    '<span>',
                        Jade.els.roundIcon('fa-calculator'),
                    '</span>',
                ].join(' ');
            },
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
            vueTitle: 'Добавить в портфель',
            data: '__add',
            bVisible: true,
            className: "buttonColumn custom",
            render: function(a, b, row, pos) {
                return [
                    '<span>',
                        Jade.els.roundIcon('fa-plus'),
                    '</span>',
                ].join(' ');
            },
            handler: function() {
                mp.alert(messages.not_implemented);
            },
        }, {
            data: "bid",
            bVisible: true,
            title: "Предл.",
            filter: "number",
        }, {
            data: "ask",
            bVisible: true,
            title: "Спрос",
            filter: "number",
        }, {
            data: "endDate",
            bVisible: true,
            title: "Погаш.",
            filter: "date",
        }, {
            data: "expiresIn",
            bVisible: true,
            title: "Погаш. (дни)",
            filter: "number",
        }, {
            data: "cpVal",
            title: "Купон (%)",
            filter: "number",
            bVisible: false,
        }, {
            data: "cpDur",
            title: "Купон (дни)",
            filter: "number",
            bVisible: false,
        }, {
            data: "percent",
            bVisible: true,
            className: "percent",
            vueTitle: 'Доходность (%)',
            title: "Д-1 (%)"+
                '<span class="tt" title="Простая доходность">'+
                    Jade.els.roundIcon('fa-question')+
                '</span>',
            filter: "number",
        }, {
            data: "percent_woRT",
            bVisible: true,
            className: "percent_woRT",
            filter: "number",
            vueTitle: 'Доходность (%, без налога с разницы покупка/продажа)',
            title: "Д-2 (%)"+
                '<span class="tt" title="Доходность без налога с разницы покупка/продажа">'+
                    Jade.els.roundIcon('fa-question')+
                '</span>',
        }, {
            data: "percent_woRTCT",
            bVisible: true,
            className: "percent_woRTCT",
            filter: "number",
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
            };
        },
        watch: {
            bid: function() {
                var vm = this;
                var bond = vm.bond;

                vm.bid = parseFloat(vm.bid);
                if (!vm.bid) {
                    vm.bid = '';
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
                return $(this.$el);
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
            vm.bid = vm.$els.bid;
        },
    });
}
