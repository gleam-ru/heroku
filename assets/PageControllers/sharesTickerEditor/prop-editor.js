/**
 * Редактирование связки ключ-значение
 * Пример использования:

    '<prop-editor',
        'prop="ticker.code"',
        'ph="код (gazp)"',
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
                '<input',
                    'class="ib"',
                    'type="text"',
                    'v-model="prop_text"',
                    'placeholder="ph"',
                    'style="margin-right: 20px;"',
                    '/>',
                '<button',
                    ':class="[\'g-btn\', \'type_midnight\', \'size_small\', {invisible: !prop_is_modified}]"',
                    'type="submit"',
                    '@click="sendData"',
                    '>',
                    'Сохранить',
                '</button>',
            ].join(' '),
            //
            //
            //
            props: ['prop', 'href', 'ph'],
            data: function() {
                return {
                    prop_orig: '',
                    prop_text: '',
                }
            },
            computed: {
                prop_is_modified: function() {
                    if (this.prop_orig === undefined && this.prop_text === '') {
                        return false;
                    }
                    return this.prop_text !== this.prop_orig;
                },
            },
            //
            //
            //
            methods: {
                sendData: function() {
                    var vm = this;

                    var el = $(vm.$el);
                    if (el.hasClass('disabled')) {
                        return false;
                    }
                    el.disable();

                    $.post(href+vm.href, {
                        message: {
                            key   : vm.prop,
                            value : vm.prop_text,
                        }
                    })
                    .done(function() {
                        vm.prop_orig = vm.prop_text;
                        vm.setOrig(vm.prop_text);
                        el.enable();
                    });
                },
                getOrig: function() {
                    var orig = window;
                    var path = this.prop.split('.');
                    while (path.length) {
                        orig = orig[path.shift()];
                    }
                    return orig;
                },
                setOrig: function(value) {
                    var orig = window;
                    var path = this.prop.split('.');
                    while (path.length) {
                        orig = orig[path.shift()];
                    }
                    orig = value;
                }
            },
            compiled: function() {
                var vm = this;
                if (typeof vm.href === 'undefined') vm.href = '';
                vm.prop_orig = vm.getOrig();
                vm.prop_text = vm.getOrig();
            },
        };
    })
    .then(resolve)
    ;
};
