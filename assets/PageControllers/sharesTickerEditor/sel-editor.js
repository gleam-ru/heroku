/**
 * Редактирование связки ключ-значение
 * Пример использования:

    '<sel-editor',
        ':ph="\'Выберите сектор\'"',
        ':model="branches"',
        ':selected="branch"',
        '@save="saveBranch"', // callback is needed
        '>',
    '</sel-editor>',

 */


module.exports = function(resolve) {
    System.importAll({
        _raw: [
        ]
    })
    .then(function() {
        return {
            template: [
                '<div class="sel-editor">',
                    '<select',
                        'class="ib"',
                        'v-model="currentSelected"',
                        'style="margin-right: 20px;"',
                        '>',
                        '<option',
                            'v-for="opt in model"',
                            'value="{{opt.id}}"',
                            '>',
                            '{{opt.name}}',
                        '</option>',
                    '</select>',
                    '<button',
                        'type="submit"',
                        'class="g-btn type_midnight size_small"',
                        ':class="{invisible: !is_modified}"',
                        '@click="save"',
                        '>',
                        'Сохранить',
                    '</button>',
                '</div>',
            ].join(' '),
            //
            //
            //
            props: ['model', 'selected', 'ph', 'save'],
            data: function() {
                return {
                    currentSelected: '',
                }
            },
            computed: {
                is_modified: function() {
                    return this.selected !== this.currentSelected;
                },
            },
            //
            //
            //
            methods: {
                setDisabled: function(state) {
                    var vm = this;
                    var el = $(vm.$el);
                    if (state) {
                        // деактивирую
                        if (el.hasClass('disabled')) {
                            return false;
                        }
                        el.disable();
                    }
                    else {
                        el.enable();
                    }
                    return true;
                },
                save: function() {
                    var vm = this;
                    var state = vm.setDisabled(true);
                    if (!state) {
                        return;
                    }

                    var bak = vm.selected;
                    vm.selected = vm.currentSelected;

                    this.$emit('save', function(err) {
                        vm.setDisabled(false);
                        if (err) {
                            vm.selected = bak;
                            return deh(err);
                        }
                    });
                },
            },
            compiled: function() {
                var vm = this;
                vm.currentSelected = this.selected;
            },
        };
    })
    .then(resolve)
    ;
};
