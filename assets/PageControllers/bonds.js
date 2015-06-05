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
                    setTimeout(beginLearning, 1000);
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
                id            : row[0],
                name          : row[1],
                num           : row[2],
                rate          : row[3],
                cpVal         : row[4],
                cpDur         : row[5],
                endDate       : row[6],
                bid           : row[7],
                ask           : row[8],
                nkd           : row[9],
                cpDate        : row[10],
                state         : row[11],
                expiresIn     : row[12],
                cpYie         : row[13],
                price         : row[14],
                percent       : row[15],
                percentWTaxes : row[16],
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
            className: "buttonColumn",
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
            className: "buttonColumn",
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
            title: "Погашение (дата)",
            filterType: "date",
        }, {
            id: "expiresIn",
            data: "expiresIn",
            title: "Погашение (дни)",
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
            title: "Доходность (%)",
            filterType: "number",
        }, {
            id: "percentWTaxes",
            data: "percentWTaxes",
            title: "Доходность (-13%)",
            filterType: "number",
        },
    ];

});


function beginLearning() {
    Learning.init({
        starter: {
            el: '.begin-learning',
            tt: {
                content: $('<p>Нажмите, чтобы<br />показать / скрыть подсказки</p>'),
                trigger: 'hover',
                interactive: false,
                multiple: false,
                maxWidth: 250,
                position: 'right',
            }
        },
        steps: [
            {
                el: '.my-table .additional',
                tt: {
                    content: 'Для закрытия подсказки нажмите на нее',
                    position: 'top-right',
                    arrow: false,
                }
            },


            //
            // Preview
            //
            {
                el: '.my-table .filters-preview .fa-gear',
                tt: {
                    content: 'Нажмите для редактирования фильтра',
                    position: 'left',
                }
            },
            {
                el: '.my-table .filters-preview .fa-gear',
                tt: {
                    content: 'Нажмите еще раз для отмены',
                    position: 'left',
                }
            },
            {
                el: '.my-table .filters-preview .filters-preview-text',
                tt: {
                    content: 'Нажмите для выбора фильтра',
                    position: 'bottom',
                }
            },
            {
                el: '.my-table .filters-preview .filters-preview-text',
                tt: {
                    content: 'Нажмите еще раз для отмены',
                    position: 'bottom',
                }
            },
            {
                el: '.my-table .filters-preview .fa-times',
                tt: {
                    content: 'Удаление фильтра',
                    position: 'top',
                }
            },


            //
            // Table
            //
            {
                el: '.my-table .dataTables_scroll',
                tt: {
                    content: 'Нажмите для сортировки',
                    position: 'top',
                }
            },
        ]
    });
}

function initCalculator() {
    return new Vue({
        el: '#calculator',
        data: function() {
            return {
                bid: 0,
                percent: 0,
                percentWTaxes: 0,
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
                    vm.bid = '';
                    vm.percent = '';
                    vm.percentWTaxes = '';
                    return;
                }
                this.bond.bid = vm.bid;

                // настоящая цена
                bond.price = bond.rate * bond.bid / 100 + bond.nkd;
                // Процентная ставка по облигации
                bond.percent = ((bond.rate + bond.nkd + bond.rate * bond.cpYie * bond.expiresIn / 365) / bond.price - 1) * 365 / bond.expiresIn * 100;

                vm.bid           = 1 * vm.bid.toFixed(2);
                vm.percent       = 1 * bond.percent;
                vm.percentWTaxes = 1 * bond.percent * 0.87;
            },
            // TODO: дописать обратнуюс связь
            // percent: function() {
            // },
            // percentWTaxes: function() {
            // },
        },
        methods: {
            getView: function() {
                return $(this.$$.calculator)
            },
            setData: function(data) {
                var vm = this;
                vm.bond = data;
                vm.bid = data.bid;
            },
        },
        compiled: function() {
            var vm = this;
            vm.bid = vm.$$.bid;
        }
    });
}
