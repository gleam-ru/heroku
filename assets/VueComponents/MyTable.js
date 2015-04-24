window.MyTable = Vue.extend({
    // шаблон
    template: Jade.MyTableTemplate(),
    // ВСЕ используемые данные ДОЛЖНЫ быть объявлены.
    data: function() {
        return {
            editingFilterIndex: 1,
            currentFilterIndex: 1,
            tableInfo: [],
            dt: {
                sDom: 'pt',
                language: {
                    "processing": "Подождите...",
                    "search": "Поиск:",
                    "lengthMenu": "Показать _MENU_ записей",
                    "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
                    "infoEmpty": "Записи с 0 до 0 из 0 записей",
                    "infoFiltered": "(отфильтровано из _MAX_ записей)",
                    "infoPostFix": "",
                    "loadingRecords": "Загрузка записей...",
                    "zeroRecords": "Записи отсутствуют.",
                    "emptyTable:": "В таблице отсутствуют данные",
                    "paginate": {
                        "first": "Первая",
                        "previous": "Предыдущая",
                        "next": "Следующая",
                        "last": "Последняя"
                    },
                    "aria": {
                        "sortAscending": ": активировать для сортировки столбца по возрастанию",
                        "sortDescending": ": активировать для сортировки столбца по убыванию"
                    }
                },
            },
            columns: [],
            savedFilters: [],
            filterTypes: {},
            newFilter: {
                name: "Безымянный",
                count: 0,
                create: function() {
                    var name = this.name;
                    if (this.count > 0) {
                        name += ' (' + this.count + ')';
                    }
                    this.count++;
                    return {
                        name: name,
                        conditions: [],
                    }
                }
            },
        };
    },
    computed: {
        // фильтр, примененный к таблице
        currentFilter: function() {
            return this.savedFilters[this.currentFilterIndex];
        },
        // фильтр, отображаемый в эдиторе
        editingFilter: function() {
            return this.savedFilters[this.editingFilterIndex];
        },
    },
    methods: {

        //  ╔═╗╦═╗╔═╗╦  ╦╦╔═╗╦ ╦
        //  ╠═╝╠╦╝║╣ ╚╗╔╝║║╣ ║║║
        //  ╩  ╩╚═╚═╝ ╚╝ ╩╚═╝╚╩╝

        // устанавливает текущий редактируемый фильтр
        editFilter: function(idx) {
            if (this.editingFilterIndex === idx) {
                this.editingFilterIndex = undefined;
            }
            else {
                this.editingFilterIndex = idx;
                this.currentFilterIndex = idx;
            }
            var filter = this.currentFilter;
            this.apply(filter);
        },

        // устанавливает текущий активный фильтр
        selectFilter: function(idx) {
            if (this.currentFilterIndex == idx) {
                this.currentFilterIndex = undefined;
            }
            else {
                this.currentFilterIndex = idx;
            }
            var filter = this.currentFilter;
            this.apply(filter);
        },

        // удаляет фильтр по индексу
        removeFilter: function(idx) {
            if(idx < this.currentFilterIndex) {
                this.currentFilterIndex--;
            }
            this.savedFilters.splice(idx, 1);
        },

        // добавляет новый фильтр
        addFilter: function() {
            var filter = this.newFilter.create();
            this.savedFilters.push(filter);
        },



        //  ╔═╗╔╦╗╦╔╦╗╔═╗╦═╗
        //  ║╣  ║║║ ║ ║ ║╠╦╝
        //  ╚═╝═╩╝╩ ╩ ╚═╝╩╚═

        // получает instance колонки
        getColumn: function(condition) {
            var value;
            if (typeof condition === 'string') {
                // condition и является value колонки
                value = condition;
            }
            else {
                value = condition.column;
            }
            var column = _.find(this.columns, {value: value});
            return column;
        },

        // получает типы фильтрации при смене колонки
        getTypeOptions: function(condition) {
            var type;
            if (typeof condition === 'string') {
                // condition и является именем типа
                type = condition;
            }
            else {
                var column = this.getColumn(condition);
                type = column.type;
            }
            var types = this.filterTypes[type];
            // дефолтный тип при смене "фильтруемой" колонки
            condition.type = types[0].value
            return types;
        },

        // получает НАЗВАНИЕ динамического компонента для выбора значения
        getValuePicker: function(condition) {
            var type;
            if (typeof condition === 'string') {
                // condition и является именем типа
                type = condition;
            }
            else {
                var column = this.getColumn(condition);
                type = column.type;
            }

            if (type === 'date') {
                return 'date-picker';
            }
            else {
                return 'text-picker';
            }
        },

        // изменилось значение в строке фильтрации
        // !!! дети должны эмитить 'changed'
        valueChanged: function(value, condition) {
            condition.value = value;
            // TODO: прицепиться к ЛЮБОМУ изменению
            // this.apply();
        },




        // добавить строку с условием
        addCondition: function() {
            // дефолтная колонка при создании нового условия
            var column = this.columns[0];
            this.editingFilter.conditions.push({
                column: column.value,
                // дефолтное значение селектора типа для дефолтной колонки
                type: this.filterTypes[column.type][0].value,
                value: '',
            });
        },

        // удалить строку с условием
        removeCondition: function(idx) {
            this.editingFilter.conditions.splice(idx, 1);
        },

        // сохранить фильтр
        saveFilter: function() {
            var filter = this.editingFilter;
            filter = {
                name: filter.name,
                conditions: filter.conditions,
                visibleColumns: filter.visibleColumns,
            }
            console.log(filter);
            // делаю пост-запрос
        },

        // Применяет фильтр к таблице.
        // Если фильтр не указан - применяет редактируемый/активный.
        apply: function(filter) {
            if (!filter) {
                // без фильтра? берем редактируемый
                filter = this.currentFilter ? this.currentFilter : this.editingFilter;
                if (!filter) {
                    // нет редактируемого? показываем всю таблицу.
                    filter = {};
                }
            }
            var idx = _.findIndex(this.savedFilters, function(savedFilter) {
                return filter.name == savedFilter.name;
            });
            this.currentFilterIndex = idx;

            var vm = this;
            $.fn.dataTableExt.afnFiltering[0] = function(oSettings, aData) {
                return _.every(filter.conditions, function(condition) {
                    var column = vm.getColumn(condition);

                    // aData == [value, value, ...] - row
                    var columnIdx = _.findIndex(vm.columns, column);
                    var data = aData[columnIdx];

                    var types = vm.filterTypes[column.type];
                    var type = _.find(types, {value: condition.type});
                    var apply = type.apply;
                    return apply(data, condition.value);
                });
            }
            vm.dt.table.fnDraw();
        },


        test: function() {
            debugger;
            // console.log()
        }
    },
    // дефолтные настройки писать сюды
    beforeCompile: function() {
        var vm = this;

        //  ╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗ ╦  ╔═╗╔═╗
        //   ║║╠═╣ ║ ╠═╣ ║ ╠═╣╠╩╗║  ║╣ ╚═╗
        //  ═╩╝╩ ╩ ╩ ╩ ╩ ╩ ╩ ╩╚═╝╩═╝╚═╝╚═╝

        // откуда брать данные
        vm.dt.ajax = vm.ajax;

        // колонки для dt
        vm.dt.columns = vm.columns.slice();
        _.each(vm.dt.columns, function(column) {
            // форматирую дату
            // (dateFormat указан в main.js)
            if (column.type == "date") {
                column.mRender = function (data) {
                    return moment(data).format(dateFormat);
                };
            }
            // И округляю числа
            else if (column.type == 'float') {
                column.mRender = function (data) {
                    return 1 * data.toFixed(2)
                };
            }
        });

        // колонка с кнопкой
        vm.dt.columns.push({
            width: "10px",
            targets: -1,
            data: null,
            sortable: false,
            defaultContent: '<span class="buy"><i class="fa fa-plus-circle"></i></span>',
        });

        // рендереры колонок для dt
        vm.dt.fnDrawCallback = function() {
            var info = [];
            var table = vm.dt.table;
            if (table) {
                var settings = table.dataTable().fnSettings();
                info.push({
                        name: 'Всего',
                        value: settings.fnRecordsTotal(),
                });
                info.push({
                    name: 'После фильрации',
                    value: settings.fnRecordsDisplay(),
                });
            }
            vm.tableInfo = info;
        }



        //  ╦  ╔═╗╔═╗╦╔═╗
        //  ║  ║ ║║ ╦║║
        //  ╩═╝╚═╝╚═╝╩╚═╝

        // текущий редактируемый фильтр
        vm.editingFilterIndex = -1;
        // текущий активный фильтр
        vm.currentFilterIndex = 0;

        // наши, "местные" колонки
        vm.columns = _.map(vm.columns, function(column) {
            return {
                name: column.title,
                value: column.data,
                type: column.type || 'string',
            }
        });

        // добавляю данные для фильтров
        // (типы фильтрации + обработчкики)
        vm.filterTypes = {
            string: [
                {
                    name: "Содержит",
                    value: "contains",
                    apply: function(a, b) {
                        if (!a) a = "";
                        if (!b) b = "";
                        return a.toLowerCase().indexOf(b.toLowerCase()) > -1;
                    },
                },
                {
                    name: "Не содержит",
                    value: "not_contains",
                    apply: function(a, b) {
                        if (!a) a = "";
                        if (!b) b = "";
                        return a.toLowerCase().indexOf(b.toLowerCase()) == -1;
                    },
                },
                {
                    name: "Равно",
                    value: "equal",
                    apply: function(a, b) {
                        return a == b;
                    },
                },
                {
                    name: "Не равно",
                    value: "not_equal",
                    apply: function(a, b) {
                        return a != b;
                    },
                },
            ],
            date: [
                {
                    name: "Позже",
                    value: "after",
                    apply: function(a, b) {
                        // где-то выше было так:
                        // var dateFormat = "DD.MM.YYYY";
                        a = moment(a, dateFormat);
                        b = moment(b, dateFormat);
                        return a.isAfter(b);
                    },
                },
                {
                    name: "Раньше",
                    value: "before",
                    apply: function(a, b) {
                        // где-то выше было так:
                        // var dateFormat = "DD.MM.YYYY";
                        a = moment(a, dateFormat);
                        b = moment(b, dateFormat);
                        return !a.isAfter(b);
                    },
                },
            ],
            number: [
                {
                    name: "Больше",
                    value: "more",
                    apply: function(a, b) {
                        a = parseFloat(a);
                        b = parseFloat(b);
                        return a > b;
                    },
                },
                {
                    name: "Меньше",
                    value: "less",
                    apply: function(a, b) {
                        a = parseFloat(a);
                        b = parseFloat(b);
                        return a < b;
                    },
                },
            ],
        };
    },
    // DOM-зависимые ивенты
    compiled: function() {
        var vm = this;
        var dt = this.$$.dt;
        vm.dt.table = $(dt).dataTable(vm.dt);
        // TODO: навесить обработчик покупки на кнопку
        // примерный вид этого обработчика
        $(dt).on('click', '.buy', function() {
            var data = $(this).parents('tr').find('td');
            alert($(data[0]).html());
            return false;
        });
        this.apply();
    },
    components: {
        // pickmeup component
        'date-picker': Vue.extend({
            template: '<input v-el="datepicker" type="text" value={{target.value}} />',
            data: function() {
                return {
                    date: '00-00-0000',
                }
            },
            ready: function() {
                var vm = this;
                var dp = $(this.$$.datepicker);
                dp.pickmeup({
                    date: vm.date,
                    change: function(date) {
                        vm.date = date;
                        vm.$emit('changed', date, vm.target);
                    },
                });
            },
            beforeDestroy: function() {
                var dp = $(this.$$.datepicker);
                dp.pickmeup('destroy');
            }
        }),
        // simple input
        'text-picker': Vue.extend({
            template: '<input v-model="value" type="text" value={{target.value}} />',
            data: function() {
                return {
                    value: '',
                }
            },
            watch: {
                value: function(value) {
                    this.$emit('changed', value, this.target);
                }
            },
        }),
    }
});
