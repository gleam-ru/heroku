module.exports = function(resolve) {
    System.importAll({
        info    :  '/Components/TWF/InfoPanel.js',
        table   :  '/Components/TWF/TablePanel.js',
        filters :  '/Components/TWF/FiltersPanel.js',
        editor  :  '/Components/TWF/FilterEditor.js',
        _raw: [
            '/css/MyTable.css',
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
                            ':infos="info"',
                            '>',
                        '</info>',
                        '<filters',
                            'v-el:filters',
                            ':filters.sync="filters"',
                            ':active.sync="activeFilterIdx"',
                            ':editing.sync="editingFilterIdx"',
                            '>',
                        '</filters>',
                    '</div>',
                    '<tbl',
                        ':rows="rows"',
                        ':columns="columns"',
                        ':title="tableTitle"',
                        '>',
                    '</tbl>',
                '</div>',
            ].join(' '),
            props: [
                'info',
                'rows',
                'columns',
                'filters',
                'activeFilterIdx',
                'editingFilterIdx',
            ],
            data: function() {
                return {
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
                }
            },
            watch: {
                activeFilterIdx: function() {
                    console.log('idx changed');
                },
                editingFilterIdx: function(idx) {
                    if (idx === null) {
                        console.log('close editor');
                    }
                    else {
                        console.log('edit filter', idx);
                        this.editor.show(this.editingFilter, {
                            columns: this.columns,
                            idx: idx,
                        });
                    }
                }
            },
            methods: {
                // обновляет фильтр
                // отрабатывает во время "сохранить" в редакторе
                updateFilter: function(idx, data) {
                    this.filters.$set(idx, data);
                }
            },
            compiled: function() {
                var vm = this;
                vm.editor = imported.editor;
                vm.editor.parent = vm;
            },
        };
    })
    .then(resolve)
    ;
};
