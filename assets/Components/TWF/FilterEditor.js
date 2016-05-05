var me = {};

Vue.filter('colorize', function (value, pattern) {
    var re = new RegExp('('+pattern+')', 'ig');
    return value ? value.replace(re, '<span style="background: yellow">$1</span>') : '';
    // return value ? value.replace(pattern, '<span style="background: yellow">'+pattern+'</span>') : '';
});

// тот, кто открыл окно (TWF)
me.parent = null;

me.template = [
    '<div class="white-popup v-filter-editor" style="max-width:90%;">',
        '<h3>Редактирование фильтра: "{{* text }}"</h3>',
        // '',
        '<h4>Название</h4>',
        '<input type="text" class="name isolated"',
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
        '<h4>Колонки</h4>',
        '<div class="isolated">',
            '<visible-columns',
                ':left="static.columns"',
                ':right.sync="visibleColumns"',
                '>',
            '</visible-columns>',
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
                new Vue({
                    el: wrapper,
                    data: function() {
                        return _.extend(_.cloneDeep(filter), {
                            static: _.extend({}, me.data, additional),
                            // visibleColumns: [],
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
                                    c.text = c.vueTitle || c.title;
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
                            opts = this.static.filterTypes[column.filter];
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
                            var data = _.cloneDeep(this.$data);
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

                        'visible-columns': Vue.extend({
                            template: [
                                '<table class="no-select visible-columns">',
                                    '<tr>',
                                        '<td class="left">',
                                            '<h4>Все <input v-model="allfilter"></h4>',
                                            '<ul>',
                                                '<li v-if="!left.length"><i>no items left...</i></li>',
                                                '<li',
                                                    ':class="{item: true}"',
                                                    'v-for="i in left"',
                                                    '@click="add(i)"',
                                                    '>',
                                                    '<i v-if="isAdded(i)" class="fa fa-check-square-o"></i>',
                                                    '<i v-else="isAdded(i)" class="fa fa-square-o"></i>',
                                                    '{{{ i.name | colorize allfilter }}}',
                                                    '<i class="fa fa-chevron-right moveRight"></i>',
                                                '</li>',
                                            '</ul>',
                                        '</td>',
                                        '<td class="right">',
                                            '<h4>',
                                                'Выбранные',
                                                '<span class="tt" title="Выбранные колонки можно таскать">',
                                                    Jade.els.roundIcon('fa-question'),
                                                '</span>',
                                            '</h4>',
                                            '<ul id="sortable">',
                                                '<li v-if="!right || !right.length"><i>no items left...</i></li>',
                                                '<li',
                                                    'class="item"',
                                                    'v-for="i in right"',
                                                    '@click="remove(i)"',
                                                    '>',
                                                    '{{ i.name }}',
                                                    '<i v-if="isRemovable(i)" class="fa fa-chevron-left moveLeft"></i>',
                                                '</li>',
                                            '</ul>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            ].join(' '),
                            props: ['left', 'right'],
                            data: function() {
                                return {
                                    allfilter: '',
                                };
                            },
                            methods: {
                                isRemovable: function(i) {
                                    return i && !i.notHideable && this.right.length > 1;
                                },
                                isAdded: function(i) {
                                    return _.findIndex(this.right, {data: i.data}) !== -1;
                                },
                                add: function(item, force) {
                                    if (!this.isAdded(item)) {
                                        this.right.push(item);
                                    }
                                    else {
                                        if (!force) {
                                            this.remove(item);
                                        }
                                    }
                                },
                                remove: function(item) {
                                    if (!this.isRemovable(item)) {
                                        return;
                                    }
                                    this.right.$remove(item);
                                },
                                reorder: function(oldIndex, newIndex) {
                                    // move the item in the underlying array
                                    this.right.splice(newIndex, 0, this.right.splice(oldIndex, 1)[0]);
                                    // update order property based on position in array
                                    this.right.forEach(function(item, index) {
                                        item.order = index;
                                    });
                                }
                            },
                            beforeCompile: function() {
                                // debugger
                            },
                            ready: function() {
                                var vm = this;
                                if (!vm.left) {
                                    console.warn('отсутствует общий список колонок');
                                }
                                vm.left = _(vm.left)
                                    .map(function(c) {
                                        return _.extend({}, c, {name: c.vueTitle || c.title});
                                    })
                                    .compact()
                                    .sortBy('name')
                                    .value()
                                    ;

                                vm.right = _(vm.right)
                                    .cMap(function(c) {
                                        return _.find(vm.left, {data: c.data});
                                    })
                                    .value()
                                    ;

                                _.each(vm.left, function(c) {
                                    if (c.notHideable) {
                                        vm.add(c, true);
                                    }
                                });



                                if (vm.right.length < 1) {
                                    vm.add(_.find(vm.left, {data: 'name'}) || vm.left[0]);
                                }

                                Sortable.create(document.getElementById('sortable'), {
                                    draggable: 'li.item',
                                    ghostClass: "sort-ghost",
                                    animation: 80,
                                    forceFallback: true,
                                    onUpdate: function(evt) {
                                        console.log('dropped (Sortable)');
                                        vm.reorder(evt.oldIndex, evt.newIndex);
                                    }
                                });

                                initTT();
                            },
                        }),
                    },
                }); // end of vue cmp
            },
            close: function() {
                me.parent.editingFilterIdx = null;
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
