module.exports = function(resolve) {
    System.importAll({
        _raw: [
        ]
    })
    .then(function() {
        return {
            template: [
                '<div class="table my-table">',
                    '<h3 v-el:header class="yes-select ib no-m">{{title}}</h3>',
                    '<table v-el:dt></table>',
                '</div>',
            ].join(''),
            props: ['title', 'rows', 'columns', 'info', 'filter'],
            data: function() {
                return {
                    config: {
                        pageLength: 10,
                        stateSave: true,
                        stateDuration: 999999999,
                        stateSaveParams: function (settings, data) {
                            data.search.search = "";
                            data.columns = [];
                            data.order = [];
                        },
                        sScrollX: '100%',
                        bScrollCollapse: true,
                        // http://legacy.datatables.net/usage/options
                        sDom: 'Rlpft',
                        aLengthMenu: [[10, 50, 100, -1], [10, 50, 100, "все"]],
                        paging: true,
                        language: datatables_localization,

                        deferRender: true,
                        orderClasses: false,

                        // http://stackoverflow.com/questions/16539578/datatables-warning-requested-unknown-parameter-0-from-the-data-source-for-row
                        columnDefs: [{
                            defaultContent: '',
                            targets: '_all',
                        }],

                        // определено в compiled
                        rows: [],
                        columns: [],
                        fnDrawCallback: function() {},
                        //
                    },
                    table: null,
                };
            },
            watch: {
                filter: function() {
                    console.log('idx changed');
                    this.applyFilter();
                },
            },
            methods: {
                applyFilter: function() {
                    // console.debug('apply');
                    var vm = this;
                    var filter = vm.filter;
                    var Table = vm.table;
                    var tableColumns = Table.columns().dataSrc();

                    if (!filter) {
                        filter = {
                            visibleColumns: _.cMap(vm.columns, function(c) {
                                return c.bVisible && {data: c.data};
                            }),
                        };
                    }
                    // console.debug('apply filter: ', filter);

                    // фильтрация
                    $.fn.dataTableExt.afnFiltering[0] = function(oSettings, aData) {
                        return _.every(filter.conditions, function(condition) {
                            if (!condition.column || !condition.type) {
                                // console.warn('вероятно, битый condition', filter, condition);
                                return true;
                            }
                            var column = condition.column;
                            var columnIdx = Table.columns().dataSrc().indexOf(column.data);
                            // aData == [value, value, ...] - row
                            var data = aData[columnIdx];
                            return condition.type.apply(data, condition.value);
                        });
                    };

                    // видимые колонки
                    var userColumns = filter.visibleColumns;

                    var toShow = [];
                    var toHide = [];
                    var order = [];

                    _.each(tableColumns, function(columnDataPropName, idx) {
                        var tableColumn = Table.column(idx); // текущая колонка в таблице
                        // 1 + - используется для прохождения ифов.
                        var userColumnIdx = 1 + _.findIndex(userColumns, {data: columnDataPropName}); // сохраненная пользователем

                        if (userColumnIdx && !tableColumn.visible()) {
                            toShow.push(tableColumn);
                        }
                        if (!userColumnIdx && tableColumn.visible()) {
                            toHide.push(tableColumn);
                        }

                        order.push({
                            userIdx: userColumnIdx || 9999,
                            currIdx: idx,
                        });
                    });

                    _.each(toShow.concat(toHide), function(c) {
                        c.visible(!c.visible());
                    });

                    var newOrder = _(order)
                        .sortBy('userIdx')
                        .map('currIdx')
                        .value()
                        ;

                    Table.colReorder.order(newOrder);

                    Table.draw();
                    initTT();
                },
            },
            compiled: function() {
                window.tp = this;
                var vm = this;
                var tableEl = vm.$els.dt;

                vm.config.data = vm.rows;
                vm.config.columns = vm.columns.slice();

                vm.config.fnDrawCallback = function() {
                    var table = vm.table;
                    if (!table) {
                        return;
                    }
                    var settings = table.settings()[0];
                    vm.info = [
                        {
                            key   : 'Всего',
                            value :  settings.fnRecordsTotal(),
                        },
                        {
                            key   : 'После фильтрации',
                            value : settings.fnRecordsDisplay(),
                        },
                    ];
                };

                vm.table = $(tableEl).DataTable(vm.config);
                // первая страница по-умолчанию
                // vm.table.page(2);
                // перемещаю селектор строк в заголовок
                $(vm.$el).find('.dataTables_length').appendTo($(vm.$els.header));
                // перемещаю поиск в заголовок
                $(vm.$el).find('.dataTables_filter').appendTo($(vm.$els.header));


                $(tableEl).on('click', '.buttonColumn', function() {
                    var table = vm.table;
                    var clickedColumnIndex = table.cell($(this)).index().column;
                    var dtColumn = table.column(clickedColumnIndex);
                    var column = _.find(vm.columns, {data: dtColumn.dataSrc()});
                    if (column && column.handler) {
                        var data = table.row($(this).parents('tr')).data();
                        column.handler(data);
                        return false;
                    }
                });

                vm.$nextTick(function() {
                    vm.table.draw();
                });
            },
            ready: function() {
                this.applyFilter();
            }
        };
    })
    .then(resolve)
    ;
};
