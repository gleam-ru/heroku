


// TODO: вынести в глобал
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

// TODO: вынести в "патч"
(function($) {
    $.fn.dataTable.moment = function ( format, locale ) {
        var types = $.fn.dataTable.ext.type;
        // Add type detection
        types.detect.unshift( function ( d ) {
            // Null and empty values are acceptable
            if ( d === '' || d === null ) {
                return 'moment-'+format;
            }

            return moment( d.replace ? d.replace(/<.*?>/g, '') : d, format, locale, true ).isValid() ?
                'moment-'+format :
                null;
        } );

        // Add sorting method - use an integer for the sorting
        types.order[ 'moment-'+format+'-pre' ] = function ( d ) {
            return d === '' || d === null ?
                -Infinity :
                parseInt( moment( d.replace ? d.replace(/<.*?>/g, '') : d, format, locale, true ).format( 'x' ), 10 );
        };
    };
}(jQuery));


$(document).ready(function() {

var locale = {
    days:        ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    daysShort:   ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    daysMin:     ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    months:      ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
}
$.pickmeup.format = "d-m-Y";
$.pickmeup.position = "right";
$.pickmeup.view = "years";
$.pickmeup.hide_on_select = true;
$.pickmeup.locale = locale;



    var columns = [
        {
            title: "Наименование",
            data: "name",
        },
        {
            title: "Номер",
            data: "num",
            visible: false,
        },
        {
            title: "Спрос",
            data: "bid",
            type: "number",
        },
        {
            title: "Предложение",
            data: "ask",
            type: "number",
        },
        {
            title: "Купон",
            data: "cpVal",
            type: "number",
            visible: false,
        },
        {
            title: "НКД",
            data: "nkd",
            type: "number",
            visible: false,
        },
        {
            title: "Дюрация купона",
            data: "cpDur",
            visible: false,
        },
        {
            title: "Дата выплаты купона",
            data: "cpDate",
            type: "date",
            visible: false,
        },
        {
            title: "Номинал (руб.)",
            data: "rate",
            visible: false,
        },
        {
            title: "Дата погашения",
            data: "endDate",
            type: "date",
        },
        {
            title: "Дюрация (дни)",
            data: "dur",
            visible: false,
        },
        {
            title: "Статус",
            data: "state",
            visible: false,
        },
        {
            title: "Дней до погашения",
            data: "expiresIn",
        },
        {
            title: "Купонная доходность",
            data: "cpYie",
            type: "number",
            visible: false,
        },
        {
            title: "Цена",
            data: "price",
            type: "number",
        },
        {
            title: "Доходность",
            data: "percent",
            type: "number",
            // visible: false,
        },
        {
            title: "Доходность -13%",
            data: "percentWTaxes",
            type: "number",
            visible: false,
        },
        {
            width: "10px",
            targets: -1,
            data: null,
            sortable: false,
            defaultContent: '<a href="" class="g-btn type_midnight size_small"><span>Жмяк</span></a>'
        },
    ];


    ///**
    var dateFormat = "DD.MM.YYYY";
    $.fn.dataTable.moment(dateFormat);
    _.each(columns, function(column) {
        if (column.type == "date") {
            column.mRender = function (data) {
                return moment(data).format(dateFormat);
            };
        }
        else if (column.type == 'float') {
            column.mRender = function (data) {
                return round(data, 2);
            };
        }
    });
    //*/


    var russian = {
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
    }




    /*
    $('#qwe tbody').on('click', '.g-btn', function(e) {
        var data = $(this).parents('tr').find('td');
        alert($(data[0]).html());
        return false;
    });
    //*/


    var DatePicker = Vue.extend({
        template: '<input v-el="datepicker" value={{target.value}} />',
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
    });


    var TextPicker = Vue.extend({
        template: '<input v-model="value" value={{target.value}} />',
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
    });



    new Vue({
        el: '#test',
        template: '#cmp',
        data: {
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
            savedFilters: [
                {
                    name: "First filter",
                    visibleColumns: [
                        'name',
                        'bid',
                        'ask',
                        'percentWTaxes',
                    ],
                    conditions: [
                        {
                            column: 'name',
                            type: 'contains',
                            value: 'ОФЗ',
                        }
                    ],
                },
                {
                    name: "One more",
                    conditions: [
                        {
                            column: 'name',
                            type: 'contains',
                            value: 'тул',
                        }
                    ],
                },
                {
                    name: "And more...",
                    conditions: [],
                },
            ],
            currentFilterIndex: 2,
            editingFilterIndex: -1,

            filterTypes: {
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
            },


            dt: {
                config: {
                    columns: columns,
                    language: russian,
                    ajax: 'bonds/get',
                    sDom: 'tip',
                },
            },
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
            // колонки, которые будут в выпадающем списке для фильтрации
            columns: function() {
                var res = [];
                _.each(this.dt.config.columns, function(column) {
                    if (column.title) {
                        res.push({
                            name: column.title,
                            value: column.data,
                            type: column.type || 'string',
                        });
                    }
                });
                return res;
            }
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

            /****************************************************************************
             ****************************************************************************
             ****************************************************************************
             *
             * TODO: Можно ли перенести эти методы в ComputedProperties?
             *
             */

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

            /**
             *
             ****************************************************************************
             ****************************************************************************
             ****************************************************************************/

            // TODO: точно это должно быть описано в "методах"? нет ли более подходящего места?
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
            // Если фильтр не указан - применяет редактируемый.
            apply: function(filter) {
                if (!filter) {
                    // без фильтра? берем редактируемый
                    filter = this.editingFilter;
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
                console.log()
            }
        },
        compiled: function() {
            var dt = this.$$.dt;
            this.dt.table = $(dt).dataTable(this.dt.config);
        },
        components: {
            'date-picker': DatePicker,
            'text-picker': TextPicker,
        }
    });





});
