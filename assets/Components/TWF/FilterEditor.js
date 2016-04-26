var me = {};

// тот, кто открыл окно (TWF)
me.parent = null;

me.template = [
    '<div class="white-popup v-filter-editor">',
        '<h3>Редактирование фильтра: "{{* text }}"</h3>',
        // '',
        '<h4>Название</h4>',
        '<input class="name isolated"',
            'v-model="text"',
            '/>',
        // '',
        '<h4>Условия</h4>',
        '<div class="row isolated" v-for="condition in conditions">',
            '<select class="column-selector"',
                '@change="condition.value=null; condition.type=null;"',
                'v-model="condition.column"',
                '>',
                '<option v-for="i in getColumns()" :value="i">',
                    '{{ i.text }}',
                '</option>',
            '</select>',
            '<select class="type-selector"',
                'v-model="condition.type"',
                '>',
                '<option v-for="i in getTypes(condition.column)" :value="i">',
                    '{{ i.text }}',
                '</option>',
            '</select>',
            '<div class="value-selector"',
                ':is=getValuePicker(condition)',
                ':value.sync="condition.value"',
                '>',
            '</div>',
            '<span @click="remove(condition)" class="row-remover">',
                '<i class="fa fa-times"></i>',
            '</span>',
        '</div>',
        // '',
        '<div class="isolated">',
            '<span @click="add">'+Jade.els.button('Добавить условие')+'</span>',
        '</div>',
        // '',
        '<div class="isolated">',
            '<div class="control-buttons">',
                '<span @click="save(static.idx)">'+Jade.els.button('Сохранить')+'</span>',
                '<span @click="cancel">'+Jade.els.button('Отмена')+'</span>',
            '</div>',
        '</div>',
        // '<pre>{{$data | json}}</pre>',
    '</div>',
].join(' ');

me.data = {
    types: {
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
};

// открывает окно с редактированием фильтра
me.show = function(filter, additional) {
    return $.magnificPopup.open({
        items: {
            src: me.template,
            type: 'inline'
        },
        modal: false,
        callbacks: {
            open: function() {
                var wrapper = this.wrap[0];
                window.mpvm = new Vue({
                    el: wrapper,
                    data: function() {
                        return _.extend(_.cloneDeep(filter), {
                            static: _.extend({}, me.data, additional),
                        });
                    },
                    methods: {
                        add: function() {
                            this.conditions.push({
                                column: null,
                                type: null,
                                value: null,
                            });
                        },
                        remove: function(condition) {
                            this.conditions.$remove(condition);
                        },

                        // список колонок для селектора с колонками
                        getColumns: function() {
                            return _(this.static.columns)
                                .map(function(c) {
                                    if (!c.data) {
                                        return;
                                    }
                                    c.text = c.title || c.vueTitle;
                                    return c;
                                })
                                .compact()
                                .sortBy('text')
                                .value()
                                ;
                        },

                        // список типов для селектора типов
                        // работает при выборе колонки
                        getTypes: function(column) {
                            var opts = [];
                            if (!column) {
                                return [];
                            }
                            if (!column.filter) {
                                console.warn('не указан тип колонки');
                                return [];
                            }
                            opts = this.static.types[column.filter];
                            if (!opts) {
                                console.warn('отсутствуют условия фильтрации для типа', column.filter);
                                return [];
                            }
                            return opts;
                        },

                        // получает тип value-picker-а для конкретного условия
                        getValuePicker: function(condition) {
                            var type = condition && condition.column && condition.column.filter;

                            if (type === 'date') {
                                return 'date-picker';
                            }
                            else {
                                return 'text-picker';
                            }
                        },

                        // сохранить состояние
                        save: function(idx) {
                            var data = JSON.parse(JSON.stringify(this.$data));
                            delete data.static;
                            me.parent.updateFilter(idx, data);
                            me.hide();
                        },
                        // закрыть окошко
                        cancel: function() {
                            me.hide();
                        },
                    },
                    components: {
                        // pickmeup component
                        'date-picker': Vue.extend({
                            template: '<input type="text" v-model="value" />',
                            props: ['value'],
                            data: function() {
                                return {
                                    date: '00-00-0000',
                                };
                            },
                            ready: function() {
                                var vm = this;
                                $(vm.$el).pickmeup({
                                    date: vm.date,
                                    change: function(date) {
                                        vm.value = date;
                                    },
                                });
                            },
                            beforeDestroy: function() {
                                $(this.$el).pickmeup('destroy');
                            }
                        }),
                        // simple input
                        'text-picker': Vue.extend({
                            template: '<input type="text" v-model="value" />',
                            props: ['value'],
                        }),
                    }
                }); // end of vue cmp
            },
            close: function() {
                // destroy vue
                me.parent.editingFilterIdx = null;

                // return vm.$destroy();
            },
        }
    });
};

// закрывает окно с редактированием фильтра
// просто для симметрии :)
me.hide = function() {
    return $.magnificPopup.close();
};

module.exports = me;
