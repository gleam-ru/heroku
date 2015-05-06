window.MyTable = Vue.extend({
    // шаблон
    template: Jade.MyTableTemplate(),
    // ВСЕ используемые данные ДОЛЖНЫ быть объявлены.
    data: function() {
        var vm = this;
        return {
            editingFilterIndex: 1,
            editingFilter: {},
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
                create: function() {
                    var maxIdx = _.max(vm.savedFilters, 'id').id;
                    var id = maxIdx >= 0 ? ++maxIdx : 0;
                    var name = this.name;
                    if (id) {
                        name += ' ('+id+')';
                    }
                    return {
                        id: id,
                        name: name,
                        conditions: [],
                        visibleColumns: [],
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
    },
    methods: {

        createClone: function() {
            var filter = this.savedFilters[this.editingFilterIndex];
            window._a = filter;
            window._b = _.cloneDeep(filter);
            this.editingFilter = _b;
        },

        //  ╔═╗╦═╗╔═╗╦  ╦╦╔═╗╦ ╦
        //  ╠═╝╠╦╝║╣ ╚╗╔╝║║╣ ║║║
        //  ╩  ╩╚═╚═╝ ╚╝ ╩╚═╝╚╩╝

        // устанавливает текущий редактируемый фильтр
        editFilter: function(idx) {
            if (this.editingFilterIndex === idx) {
                // клик по самому себе (нужно отключить)
                this.editingFilterIndex = undefined;
            }
            else {
                this.editingFilterIndex = idx;
                if (idx !== undefined) {
                    this.currentFilterIndex = idx;
                }
            }
            this.createClone();
            // применить фильтр
            var filter = this.currentFilter;
            this.apply(filter);
        },

        // устанавливает текущий активный фильтр
        selectFilter: function(idx) {
            if (this.currentFilterIndex == idx && this.editingFilterIndex != idx) {
                // клик по самому себе, нередактируемому
                this.currentFilterIndex = undefined;
            }
            else {
                this.currentFilterIndex = idx;
            }
            // выбрали фильтр, значит уже не редактируем.
            this.editFilter(undefined)
            // применяем фильтр на таблицу
            var filter = this.currentFilter;
            this.apply(filter);
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
                type = column.filterType;
            }
            var types = this.filterTypes[type];
            // дефолтный тип при смене "фильтруемой" колонки
            // condition.type = types[0].value
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
                type = column.filterType;
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


        // сохранить текущий редактируемый фильтр
        save: function(cb) {
            if (typeof cb !== 'function') cb = function() {};
            var vm = this;
            var filter = vm.editingFilter;

            // сохраняю фильтр
            // mask
            $.post(vm.filters_api, filter)
            .done(function() {
                cb();
            })
            .fail(function(err) {
                alert('smth went wrong...');
                console.error(err);
            });
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

                    var types = vm.filterTypes[column.filterType];
                    var type = _.find(types, {value: condition.type});
                    var apply = type.apply;
                    return apply(data, condition.value);
                });
            }
            vm.dt.table.fnDraw();
        },



        //  ╔╗ ╦ ╦╔╦╗╔╦╗╔═╗╔╗╔╔═╗
        //  ╠╩╗║ ║ ║  ║ ║ ║║║║╚═╗
        //  ╚═╝╚═╝ ╩  ╩ ╚═╝╝╚╝╚═╝

        // добавляет новый фильтр
        addFilter: function() {
            // делаем свежедобавленный фильтр активным
            var idx = this.savedFilters.length;
            // создаем фильтр
            var filter = this.newFilter.create();
            this.savedFilters.push(filter);
            // применяем и редактируем
            this.editFilter(idx);
            // сохраняем на сервер
            this.save();
        },

        // удаляет фильтр по индексу
        removeFilter: function(idx) {
            var vm = this;
            // удаляю фильтр
            // mask
            var filter = vm.savedFilters[idx];
            filter = {
                remove: true,
                name: filter.name,
            }
            $.post(vm.filters_api, filter)
            .done(function() {
                if(idx < vm.currentFilterIndex) {
                    vm.currentFilterIndex--;
                }
                vm.savedFilters.splice(idx, 1);
            })
            .fail(function(err) {
                alert('smth went wrong...');
                console.error(err);
            });
        },

        // добавить строку с условием
        addCondition: function() {
            // дефолтная колонка при создании нового условия
            var column = this.columns[0];
            this.editingFilter.conditions.push({
                column: column.value,
                // дефолтное значение селектора типа для дефолтной колонки
                // type: this.filterTypes[column.filterType][0].value,
                value: '',
            });
        },

        // удалить строку с условием
        removeCondition: function(idx) {
            this.editingFilter.conditions.splice(idx, 1);
        },

        // кнопочка сохранения в интерфейса
        saveFilter: function() {
            var vm = this;
            vm.save(function() {
                vm.savedFilters[vm.editingFilterIndex] = _.clone(vm.editingFilter);
                vm.editFilter(undefined)
            })
        },

        // кнопочка "отмена" в интерфейсе
        closeEditor: function() {
            var vm = this;
            vm.editFilter(undefined);
        },
    },
    // дефолтные настройки писать сюды
    beforeCompile: function() {
        var view = $(this.$el);
        view.mask();
        var vm = this;

        //  ╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗ ╦  ╔═╗╔═╗
        //   ║║╠═╣ ║ ╠═╣ ║ ╠═╣╠╩╗║  ║╣ ╚═╗
        //  ═╩╝╩ ╩ ╩ ╩ ╩ ╩ ╩ ╩╚═╝╩═╝╚═╝╚═╝

        // откуда брать данные
        vm.dt.ajax = vm.ajax;

        // speeding up
        // https://datatables.net/faqs/
        vm.dt.deferRender = true;
        vm.dt.orderClasses = false;

        // колонки для dt
        vm.dt.columns = vm.columns.slice();

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
        };

        // рендереры колонок для dt
        vm.dt.fnInitComplete = function() {
            vm.dt.table.mask(false);
            // view.mask(false);
        };



        //  ╦  ╔═╗╔═╗╦╔═╗
        //  ║  ║ ║║ ╦║║
        //  ╩═╝╚═╝╚═╝╩╚═╝
        // текущий редактируемый фильтр
        vm.editingFilterIndex = vm.editingFilterIndex !== undefined ? vm.editingFilterIndex : -1;
        // текущий активный фильтр
        vm.currentFilterIndex = vm.currentFilterIndex !== undefined ? vm.currentFilterIndex : 0;
        // загружаем данные по фильтрам
        $.get(vm.filters)
        .done(function(loaded) {
            vm.savedFilters = loaded.data;
            vm.createClone();
            // после загрузки - применяем выбранный фильтр
            vm.apply();
        })
        .fail(function(err) {
            alert('smth went wrong...');
            console.error(err);
        })
        .always(function() {
            // снимаем маску
            view.mask(false);
        });

        // загружаем дополнительную информацию для отображения
        $.get(vm.additional)
        .done(function(loaded) {
            vm.additional = loaded.data;
        });

        // наши, "местные" колонки
        vm.columns = _.map(vm.columns, function(column) {
            return {
                name: column.title,
                value: column.data,
                filterType: column.filterType || 'string',
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
