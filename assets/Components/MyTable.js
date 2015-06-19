// стандартные сообщения
window.messages = {
    issue: ''+
        '<p>Пожалуйста, опишите проблему <a href="/about/feedback">здесь</a>.</p>'+
        '',
    auth: ''+
        '<p>Для данного действия необходимо <br />'+
            '<a href="/auth?register">зарегистрироваться</a> или <br />'+
            '<a href="/auth">войти в систему</a>.'+
        '</p>'+
        '',
    not_implemented: ''+
        '<p>Извините, данная возможность пока не реализована</p>'+
        '',
}

window.MyTable = Vue.extend({
    // шаблон
    template: Jade.MyTableTemplate(),
    // ВСЕ используемые данные ДОЛЖНЫ быть объявлены.
    data: function() {
        var vm = this;
        return {
            editingFilterIndex: 0,
            editingFilter: {},
            currentFilterIndex: 0,
            tableInfo: [],
            dt: {
                pageLength: 10,
                stateSave: true,
                stateSaveParams: function (settings, data) {
                    data.search.search = "";
                },
                sScrollX: '100%',
                bScrollCollapse: true,
                // http://legacy.datatables.net/usage/options
                sDom: 'lpft',
                aLengthMenu: [[10, 50, 100, -1], [10, 50, 100, "все"]],
                paging: true,
                language: datatables_localization,
            },
            columns: [],
            savedFilters: [],
            filterTypes: {},
            newFilter: {
                text: "Безымянный",
                create: function() {
                    var maxIdx = _.max(vm.savedFilters, 'id').id;
                    var id = maxIdx > 0 ? ++maxIdx : 1;
                    var text = this.text;
                    if (id) {
                        text += ' ('+id+')';
                    }
                    return {
                        id: id,
                        text: text,
                        conditions: [],
                        visibleColumns: [],
                    }
                }
            },
            listeners: {
                isReady: function() {
                },
            },
        };
    },
    computed: {
        // фильтр, примененный к таблице
        currentFilter: function() {
            return this.savedFilters[this.currentFilterIndex];
        },
    },
    watch: {
        currentFilter: function() {
            // применить фильтр
            var filter = this.currentFilter;
            this.apply(filter);
        },
        // TODO: пока не работает - уточнить у дена
        // как починю - почистить использование .apply()
        // editingFilter: function() {
        //     this.filter(this.editingFilter);
        // },
        editingFilterIndex: function() {
            var vm = this;
            var idx = vm.editingFilterIndex ? vm.editingFilterIndex : -1;
            if ($.cookie) {
                $.cookie('_editingFilterIndex', idx, {expires: 365});
            }
        },
        currentFilterIndex: function() {
            var vm = this;
            var idx = vm.currentFilterIndex ? vm.currentFilterIndex : -1;
            if ($.cookie) {
                $.cookie('_currentFilterIndex', idx, {expires: 365});
            }
        },
    },
    methods: {

        // для плавного транзишна по высоте
        updateTransitionsBlock: function() {
            var vm = this;
            var editor = $(vm.$$.editor);
            var block = editor.closest('.block-for-transition');
            block.css('max-height', editor.outerHeight(true));
        },

        // Обновляет редактируемый фильтр
        // _.clone не канает.
        updateEditingFilter: function() {
            var vm = this;
            var filter = vm.savedFilters[vm.editingFilterIndex];
            vm.editingFilter = _.cloneDeep(filter);
        },

        //  ╔═╗╦═╗╔═╗╦  ╦╦╔═╗╦ ╦
        //  ╠═╝╠╦╝║╣ ╚╗╔╝║║╣ ║║║
        //  ╩  ╩╚═╚═╝ ╚╝ ╩╚═╝╚╩╝

        // устанавливает текущий редактируемый фильтр
        editFilter: function(idx) {
            var vm = this;
            if (vm.editingFilterIndex == idx) {
                // клик по самому себе (нужно отключить)
                vm.editingFilterIndex = undefined;
            }
            else {
                vm.editingFilterIndex = idx;
                if (idx !== undefined) {
                    vm.currentFilterIndex = idx;
                    Vue.nextTick(vm.updateTransitionsBlock);
                }
            }
            vm.updateEditingFilter();
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
        },

        // удаляет фильтр по индексу
        removeFilter: function(idx) {
            var vm = this;
            var filter = vm.savedFilters[idx];

            // Вы уверены?
            var msg = ''+
                '<p>Фильтр <b>"'+filter.text+'"</b> будет удален.</p>'+
                '<p>Продолжить?</p>'+
                '';

            // POST на сервер с удалением фильтра
            function processDeletion() {
                filter = {
                    id: filter.id,
                    remove: true,
                }
                $.post(vm.filters_api, filter)
                .done(function() {
                    // удаляю локально
                    vm.savedFilters.splice(idx, 1);
                    // если ничего не осталось - сбрасываю
                    if (vm.savedFilters.length === 0) {
                        vm.selectFilter(undefined);
                        return;
                    }
                    // если удалили выше текущего - смещаю текущий
                    // TODO: deprecated... я ввел айдишники, теперь нужно делать не так.
                    if (idx < vm.currentFilterIndex) {
                        vm.currentFilterIndex--;
                    }
                })
                .fail(function(err) {
                    if (err.status === 403) { // недостаточно прав
                        if (typeof mp !== 'undefined') {
                            mp.alert(messages.auth);
                        }
                        else {
                            alert('Вы не авторизированы!');
                        }
                    }
                    else {
                        console.error(err);

                        var msg = ''+
                            '<p>'+
                                'Не удалось удалить фильтр'+
                                '<b>"'+filter.text+'"</b>.'+
                            '</p>'+
                            messages.issue+
                            '';
                        if (typeof mp !== 'undefined') {
                            mp.alert(msg);
                        }
                        else {
                            alert('Не удалось удалить фильтр');
                        }
                    }
                });
            }

            // подтверждение
            if (typeof mp !== 'undefined') {
                mp.confirm(msg, processDeletion);
            }
            else if (confirm('Фильтр будет удален. Продолжить?')) {
                processDeletion();
            }
        },



        //  ╔═╗╔╦╗╦╔╦╗╔═╗╦═╗
        //  ║╣  ║║║ ║ ║ ║╠╦╝
        //  ╚═╝═╩╝╩ ╩ ╚═╝╩╚═

        // получает instance колонки
        getColumn: function(condition) {
            var value = condition.column;
            var column = _.find(this.columns, {value: value});
            return column;
        },

        // получает типы фильтрации при смене колонки
        getTypeOptions: function(condition) {
            // выбранная в предыдущем селекте колонка
            var column = this.getColumn(condition);
            // тип этой колонки
            var type = column.filterType;
            // типы фильтрации
            var types = this.filterTypes[type];
            return types;
        },

        // получает НАЗВАНИЕ динамического компонента для выбора значения
        getValuePicker: function(condition) {
            var column = this.getColumn(condition);
            var type = column.filterType;

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
            var vm = this;
            condition.value = value;
            if (!vm.valueChangedBouncer) {
                vm.valueChangedBouncer = setTimeout(function() {
                    vm.apply(vm.editingFilter);
                    vm.valueChangedBouncer = undefined;
                }, 200);
            }
        },


        // сохраняет текущий фильтр как новый
        saveFilterAsCopy: function() {
            var vm = this;
            $(vm.$$.editor).mask();
            var filter = vm.editingFilter;
            var id = _.max(vm.filters, function(f) {
                return parseInt(f.id);
            }).id;
            filter.id = parseInt(id) + 1;
            vm.save(filter, function() {
                vm.savedFilters.push(filter);
                vm.editFilter(id);
                $(vm.$$.editor).mask(false);
            });
        },

        // сохранить текущий редактируемый фильтр
        save: function(filter, cb) {
            if (typeof cb !== 'function') cb = function() {};
            var vm = this;

            // сохраняю фильтр
            // mask
            $.post(vm.filters_api, filter)
            .done(function() {
                cb();
                // обновляю модель после сохранения
                var idx = _.findIndex(vm.savedFilters, {id: filter.id});
                var existing = vm.savedFilters[idx];
                _.extend(existing, filter);
                vm.currentFilterIndex = idx;
            })
            .fail(function(err) {
                if (err.status === 403) { // недостаточно прав
                    if (typeof mp !== 'undefined') {
                        mp.alert(messages.auth);
                    }
                    else {
                        alert('Вы не авторизированы!');
                    }
                }
                else {
                    console.error(err);
                    if (typeof mp !== 'undefined') {
                        mp.alert('<p class="error">Ошибка!</p>'+messages.issue);
                    }
                    else {
                        alert('Ошибка!');
                    }
                }
            });
        },

        // Применяет фильтр к таблице.
        // Если фильтр не указан - применяет редактируемый/активный.
        apply: function(filter) {
            var vm = this;
            if (!filter) {
                // без фильтра? берем редактируемый
                filter = this.currentFilter ? this.currentFilter : this.editingFilter;
                if (!filter) {
                    // нет редактируемого? показываем всю таблицу.
                    filter = {};
                }
            }

            var idx = _.findIndex(this.savedFilters, function(savedFilter) {
                return savedFilter.id == filter.id;
            });
            this.currentFilterIndex = idx;

            $.fn.dataTableExt.afnFiltering[0] = function(oSettings, aData) {
                return _.every(filter.conditions, function(condition) {
                    var column = vm.getColumn(condition);

                    // aData == [value, value, ...] - row
                    var columnIdx = _.findIndex(vm.dt.columns, {data: column.value});
                    var data = aData[columnIdx];

                    var types = vm.filterTypes[column.filterType];
                    var type = _.find(types, {value: condition.type});
                    if (!type) {
                        return true;
                    }
                    return type.apply(data, condition.value);
                });
            }
            vm.dt.table.fnDraw();
        },



        //  ╔╗ ╦ ╦╔╦╗╔╦╗╔═╗╔╗╔╔═╗
        //  ╠╩╗║ ║ ║  ║ ║ ║║║║╚═╗
        //  ╚═╝╚═╝ ╩  ╩ ╚═╝╝╚╝╚═╝

        // добавляет новый фильтр
        addFilter: function() {
            var vm = this;
            // создаем фильтр
            var filter = vm.newFilter.create();

            // сохраняем на сервер
            vm.save(filter, function() {
                // делаем свежедобавленный фильтр активным
                var idx = vm.savedFilters.length;
                vm.savedFilters.push(filter);
                // применяем и редактируем
                vm.editFilter(idx);
            });
        },

        // добавить строку с условием
        addCondition: function() {
            var vm = this;
            // дефолтная колонка при создании нового условия
            var column = vm.columns[0];
            vm.editingFilter.conditions.push({
                column: column.value,
                // дефолтное значение селектора типа для дефолтной колонки
                type: vm.filterTypes[column.filterType][0].value,
                value: '',
            });
            Vue.nextTick(vm.updateTransitionsBlock);
        },

        // удалить строку с условием
        removeCondition: function(idx) {
            var vm = this;
            vm.editingFilter.conditions.splice(idx, 1);
            vm.apply(vm.editingFilter);
            Vue.nextTick(vm.updateTransitionsBlock);
        },

        // кнопочка сохранения в интерфейсе
        saveFilter: function() {
            var vm = this;
            vm.save(vm.editingFilter, function() {
                $(vm.$$.editor).done(true, function() {
                    vm.editFilter(undefined);
                });
            });
        },

        // кнопочка "отмена" в интерфейсе
        closeEditor: function() {
            var vm = this;
            vm.editFilter(undefined);
        },
    },





    // дефолтные настройки писать сюды
    beforeCompile: function() {
        var vm = this;

        //  ╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗ ╦  ╔═╗╔═╗
        //   ║║╠═╣ ║ ╠═╣ ║ ╠═╣╠╩╗║  ║╣ ╚═╗
        //  ═╩╝╩ ╩ ╩ ╩ ╩ ╩ ╩ ╩╚═╝╩═╝╚═╝╚═╝

        // откуда брать данные
        vm.dt.data = vm.rows;

        // speeding up
        // https://datatables.net/faqs/
        vm.dt.deferRender = true;
        vm.dt.orderClasses = false;

        // колонки для dt
        vm.dt.columns = vm.columns.slice();
        // рендереры колонок для dt
        vm.dt.fnDrawCallback = function() {
            var info = [];
            var table = vm.dt.table;
            if (table) {
                var settings = table.dataTable().fnSettings();
                info.push({
                    text: 'Всего',
                    value: settings.fnRecordsTotal(),
                });
                info.push({
                    text: 'После фильрации',
                    value: settings.fnRecordsDisplay(),
                });
            }
            vm.tableInfo = info;
        };

        // дефолтная сортировка
        var i = 0;
        vm.dt.order = [];
        _.each(vm.dt.columns, function(column) {
            if (column.order) {
                vm.dt.order.push([i, column.order]);
            }
            i++;
        })


        //  ╦  ╔═╗╔═╗╦╔═╗
        //  ║  ║ ║║ ╦║║
        //  ╩═╝╚═╝╚═╝╩╚═╝
        // текущий редактируемый фильтр
        vm.editingFilterIndex = $.cookie ? $.cookie('_editingFilterIndex') : -1;
        // текущий активный фильтр
        vm.currentFilterIndex = $.cookie ? $.cookie('_currentFilterIndex') : 0;
        // загружаем данные по фильтрам
        vm.savedFilters = vm.filters;
        vm.updateEditingFilter();

        // наши, "местные" колонки
        vm.columns = _(vm.columns)
            .map(function(column) {
                if (column.className && column.className.indexOf('custom') !== -1) {
                    return false;
                }
                return {
                    text: column.vueTitle || column.title,
                    value: column.id,
                    filterType: column.filterType || 'string',
                }
            })
            .compact()
            .value()

        // добавляю данные для фильтров
        // (типы фильтрации + обработчкики)
        vm.filterTypes = {
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
                        // var dateFormat = "DD.MM.YYYY";
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
                        // var dateFormat = "DD.MM.YYYY";
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
        };
    },
    // DOM-зависимые ивенты
    compiled: function() {
        var vm = this;
        var dt = vm.$$.dt;
        vm.dt.table = $(dt).dataTable(vm.dt);
        // первая страница по-умолчанию
        vm.dt.table.fnPageChange(0);
        // перемещаю селектор строк в заголовок
        $(vm.$el).find('.dataTables_length').appendTo($(vm.$$.header))
        // перемещаю поиск в заголовок
        $(vm.$el).find('.dataTables_filter').appendTo($(vm.$$.header))

        // Transitions
        var wrapper = vm.dt.table.closest('.height-transition');
        if (wrapper.length > 0) {
            var time = 300;
            wrapper.css('transition', 'all '+time/1000+'s linear');
            wrapper.css('max-height', $(vm.$el).outerHeight(true) + 100);
            setTimeout(function() {
                wrapper.css('transition', 'none');
                wrapper.css('max-height', 'none');
            }, time)
        }

        // после загрузки - применяем выбранный фильтр
        vm.apply();

        // инициализирую "кнопочные" колонки
        $(dt).on('click', '.buttonColumn', function() {
            var table = vm.dt.table.DataTable();
            var clickedColumnIndex = table.cell($(this)).index().column;
            var column = vm.dt.columns[clickedColumnIndex];
            if (column && column.handler) {
                var data = table.row($(this).parents('tr')).data();
                column.handler(data);
            }
            return false;
        });
        vm.isReady()
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
