module.exports = function(resolve) {
    System.importAll({
        _raw: [
        ]
    })
    .then(function() {
        return {
            template: [
                '<div class="table">',
                    '<h3 v-el:header class="yes-select ib no-m">{{title}}</h3>',
                    '<table v-el:dt></table>',
                '</div>',
            ].join(''),
            props: ['title', 'rows', 'columns', 'info'],
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

                        // определено в compiled
                        rows: [],
                        columns: [],
                        fnDrawCallback: function() {},
                        //
                    },
                    table: null,
                };
            },
            compiled: function() {
                window.tp = this;
                var vm = this;
                var tableEl = vm.$els.dt;

                vm.config.data = vm.rows;
                vm.config.columns = vm.columns;

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
                    var column = vm.columns[clickedColumnIndex];
                    if (column && column.handler) {
                        var data = table.row($(this).parents('tr')).data();
                        column.handler(data);
                    }
                    return false;
                });

                vm.$nextTick(function() {
                    vm.table.draw();
                });
            }
        };
    })
    .then(resolve)
    ;
};
