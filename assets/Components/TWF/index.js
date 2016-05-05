module.exports = function(resolve) {
    System.importAll({
        info     :  '/Components/TWF/InfoPanel.js',
        table    :  '/Components/TWF/TablePanel.js',
        filters  :  '/Components/TWF/FiltersPanel.js',
        editor   :  '/Components/TWF/FilterEditor.js',
        _raw: [
            '/css/MyTable.css',
            '/bower_components/Sortable/Sortable.js',
        ]
    })
    .then(function(imported) {
        return {
            components: {
                'info'     : imported.info,
                'tbl'      : imported.table,
                'filters'  : imported.filters,
            },
            template: [
                '<div class="my-table">',
                    '<div class="top">',
                        '<info',
                            ':infos="info.concat(tableInfo)"',
                            '>',
                        '</info>',
                        '<filters',
                            ':filters.sync="filters"',
                            ':active.sync="activeFilterIdx"',
                            ':editing.sync="editingFilterIdx"',
                            '@addfilter="addFilter()"',
                            '@savetoserver="saveToServer()"',
                            '>',
                        '</filters>',
                    '</div>',
                    '<tbl',
                        'v-ref:tbl',
                        ':rows="rows"',
                        ':columns="columns"',
                        ':title="tableTitle"',
                        ':info.sync="tableInfo"',
                        ':filter="activeFilter"',
                        '>',
                    '</tbl>',
                '</div>',
            ].join(' '),
            props: [
                'saveas',
                'info',
                'rows',
                'columns',
                'filters',
                'activeFilterIdx',
                'editingFilterIdx',
            ],
            data: function() {
                var vm = this;
                return {
                    tableInfo: [],
                    filterTypes: {
                        string: [
                            {
                                text: "Содержит",
                                value: "contains",
                                apply: function(a, b) {
                                    if (!a) a = "";
                                    if (!b) b = "";
                                    return a.toLowerCase().indexOf(b.toLowerCase()) > -1;
                                },
                            },
                            {
                                text: "Не содержит",
                                value: "not_contains",
                                apply: function(a, b) {
                                    if (!a) a = "";
                                    if (!b) b = "";
                                    return a.toLowerCase().indexOf(b.toLowerCase()) == -1;
                                },
                            },
                            {
                                text: "Равно",
                                value: "equal",
                                apply: function(a, b) {
                                    return a == b;
                                },
                            },
                            {
                                text: "Не равно",
                                value: "not_equal",
                                apply: function(a, b) {
                                    return a != b;
                                },
                            },
                            {
                                text: "Регулярное выражение",
                                value: "regexp",
                                apply: function(a, b) {
                                    if (!a) a = "";
                                    if (!b) b = "";
                                    b = b.replace(/[\\]/g, "\\$&");
                                    var re = new RegExp(b, "i");
                                    return re.test(a);
                                },
                            },
                        ],
                        date: [
                            {
                                text: "Позже",
                                value: "after",
                                apply: function(a, b) {
                                    // где-то выше было так:
                                    // var dateFormat = ddf;
                                    a = moment(a, dateFormat);
                                    b = moment(b, dateFormat);
                                    return a.isAfter(b);
                                },
                            },
                            {
                                text: "Раньше",
                                value: "before",
                                apply: function(a, b) {
                                    // где-то выше было так:
                                    // var dateFormat = ddf;
                                    a = moment(a, dateFormat);
                                    b = moment(b, dateFormat);
                                    return !a.isAfter(b);
                                },
                            },
                        ],
                        number: [
                            {
                                text: "Больше",
                                value: "more",
                                apply: function(a, b) {
                                    a = parseFloat(a);
                                    b = parseFloat(b);
                                    return a > b;
                                },
                            },
                            {
                                text: "Меньше",
                                value: "less",
                                apply: function(a, b) {
                                    a = parseFloat(a);
                                    b = parseFloat(b);
                                    return a < b;
                                },
                            },
                        ],
                    },
                    newFilter: {
                        text: 'Новый фильтр',
                        conditions: [],
                        visibleColumns: [
                        ],
                    },
                };
            },
            computed: {
                activeFilter: function() {
                    return this.filters[this.activeFilterIdx];
                },
                editingFilter: function() {
                    return this.filters[this.editingFilterIdx];
                },
                tableTitle: function() {
                    return this.activeFilter && this.activeFilter.text || 'Фильтр не выбран';
                },
                tbl: function() {
                    return this.$refs.tbl;
                },
            },
            watch: {
                editingFilterIdx: function(idx) {
                    if (idx === null) {
                        console.log('close editor');
                    }
                    else {
                        console.log('edit filter', idx);
                        this.editor.show(this.editingFilter, {
                            idx: idx,
                            columns: this.columns,
                            filterTypes: this.filterTypes,
                        });
                    }
                }
            },
            methods: {
                // обновляет фильтр
                // отрабатывает во время "сохранить" в редакторе
                updateFilter: function(idx, data) {
                    if (!idx && idx !== 0) {
                        this.filters.push(data);
                        idx = this.filters.length - 1;
                    }
                    else {
                        // существующий
                        this.filters.$set(idx, data);
                    }

                    // изменили активный фильтр
                    if (idx === this.activeFilterIdx) {
                        this.tbl.applyFilter();
                    }
                    else {
                        this.activeFilterIdx = idx;
                    }

                    // сохраняю изменения на сервер
                    this.saveToServer();
                },

                addFilter: function() {
                    var vm = this;
                    this.editor.show(_.cloneDeep(vm.newFilter), {
                        idx: null,
                        columns: this.columns,
                        filterTypes: this.filterTypes,
                    });
                },

                toJSON: function() {
                    var vm = this;
                    return {
                        filters: _.map(vm.filters, function(f) {
                            return {
                                text: f.text,
                                conditions: _.map(f.conditions, function(c) {
                                    return {
                                        column: {
                                            data: c && c.column && c.column.data,
                                        },
                                        type: {
                                            value: c && c.type && c.type.value,
                                        },
                                        value: c && c.value,
                                    };
                                }),
                                visibleColumns: _.map(f.visibleColumns, function(c) {
                                    return {
                                        data: c && c.data,
                                    };
                                }),
                            };
                        }),
                    };
                },

                // сохраняет текущее состояние на сервер
                saveToServer: function() {
                    var vm = this;
                    var msg = {
                        page: vm.saveas,
                        data: vm.toJSON(),
                    };
                    console.debug('save:', msg);
                    $.post('/API/usersettings', {msg: msg})
                        .done(function() {
                            console.debug('filters saved to server');
                        })
                        .error(function(err) {
                            console.error(err);
                            mp.alert('ошибка при сохранении фильтров');
                        })
                        ;
                },
            },
            beforeCompile: function() {
                window.twf = this;
                var vm = this;

                // by hash
                var matches = window.location.hash.match(/f=(\d+)/i);
                var selectedFilterIdx = parseInt(matches && matches[1]);
                vm.activeFilterIdx = selectedFilterIdx > -1 ? selectedFilterIdx : null;

                vm.editor = imported.editor;
                vm.editor.parent = vm;

                _.each(vm.filters, function(filter) {
                    if (!filter.conditions) {
                        filter.conditions = [];
                    }
                    _.each(filter.conditions, function(condition) {
                        condition.column = _.find(vm.columns, condition.column);
                        if (!condition.column) {
                            console.warn('Странная колонка в фильтрах');
                            return;
                        }
                        condition.column.text = condition.column.vueTitle || condition.column.title;
                        condition.type = _.find(vm.filterTypes[condition.column.filter], condition.type);
                    });
                    _.each(filter.visibleColumns, function(c) {
                        _.extend(c, _.find(vm.columns, {data: c.data}));
                    });
                });
            },
            ready: function() {
            }
        };
    })
    .then(resolve)
    ;
};
