/**
 * Редактирование связки ключ-значение
 * Пример использования:

    '<prop-editor',
        'class="code"',
        ':ph="\'код (gazp)\'"',
        ':value.sync="code"',
        '@save="saveCode"', // callback is needed
        '>',
    '</prop-editor>',

 */

module.exports = function(resolve) {
    System.importAll({
        _raw: [
        ]
    })
    .then(function() {
        return {
            template: [
                '<div class="prop-editor">',
                    '<input',
                        'class="ib"',
                        'type="text"',
                        'v-model="currentValue"',
                        'placeholder="{{ph}}"',
                        'style="margin-right: 20px;"',
                        '/>',
                    '<button',
                        ':class="[\'g-btn\', \'type_midnight\', \'size_small\', {invisible: !prop_is_modified}]"',
                        'type="submit"',
                        '@click="save"',
                        '>',
                        'Сохранить',
                    '</button>',
                '</div>',
            ].join(' '),
            //
            //
            //
            props: ['ph', 'value', 'save'],
            data: function() {
                return {
                    currentValue: '',
                }
            },
            computed: {
                prop_is_modified: function() {
                    return this.value !== this.currentValue;
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

                    var bak = vm.value;
                    vm.value = vm.currentValue;

                    this.$emit('save', function(err) {
                        vm.setDisabled(false);
                        if (err) {
                            vm.value = bak;
                            return deh(err);
                        }
                    });
                },
            },
            compiled: function() {
                var vm = this;
                vm.currentValue = vm.value;
            },
        };
    })
    .then(resolve)
    ;
};
