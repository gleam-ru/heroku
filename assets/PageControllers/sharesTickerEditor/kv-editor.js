/**
 * Редактирование связки ключ-значение
 * Пример использования:

    '<kv-editor>',
        'class="link"',
        'prop="ticker.forums"',
        'editor_id="{{forum.id}}"',
        'key="{{forum.key}}"',
        'value="{{forum.value}}"',
        'key_ph="Название"',
        'value_ph="Ссылка"',
        '>',
    '</kv-editor>',

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
                    'class="key ib"',
                    'type="text"',
                    'v-model="key_text"',
                    'placeholder="key_ph"',
                    'style="margin-right: 20px;"',
                    '/>',
                '<input',
                    'class="value ib"',
                    'type="text"',
                    'v-model="value_text"',
                    'placeholder="value_ph"',
                    'style="margin-right: 20px;"',
                    '/>',
                '<button',
                    'class="g-btn type_midnight size_small"',
                    'type="submit"',
                    '@click="removeData"',
                    'style="margin-right: 20px;"',
                    '>',
                    'Удалить',
                '</button>',
                '<button',
                    ':class="[\'g-btn\', \'type_midnight\', \'size_small\', {invisible: !kv_is_modified}]"',
                    'type="submit"',
                    '@click="sendData"',
                    '>',
                    'Сохранить',
                '</button>',
            ].join(' '),
            //
            //
            //
            props: ['editor_id', 'prop', 'href', 'key', 'value', 'key_ph', 'value_ph'],
            data: function() {
                return {
                    key_orig: '',
                    key_text: '',
                    value_orig: '',
                    value_text: '',
                }
            },
            computed: {
                key_is_modified: function() {
                    if (this.key_orig === undefined && this.key_text === '') {
                        return false;
                    }
                    return this.key_text !== this.key_orig;
                },
                value_is_modified: function() {
                    if (this.value_orig === undefined && this.value_text === '') {
                        return false;
                    }
                    return this.value_text !== this.value_orig;
                },
                kv_is_modified: function() {
                    return this.key_is_modified || this.value_is_modified;
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
                            value : {
                                id    : vm.editor_id,
                                key   : vm.key_text,
                                value : vm.value_text,
                            },
                        }
                    })
                    .done(function() {
                        vm.key_orig   = vm.key_text;
                        vm.value_orig = vm.value_text;
                        vm.setOrig(vm.key_text, vm.value_text);
                        vm.$dispatch('kv-editor-saved', vm);
                        el.enable();
                    })
                    .fail(function(err) {
                        console.error(err);
                        mp.alert('Что-то пошло не так');
                    })
                    ;
                },

                removeData: function() {
                    var vm = this;

                    $.post(href+vm.href, {
                        message: {
                            key    : vm.prop,
                            remove : true,
                            value  : {
                                id : vm.editor_id,
                            },
                        }
                    })
                    .done(function() {
                        vm.key_orig   = vm.key_text;
                        vm.value_orig = vm.value_text;
                        vm.setOrig(vm.key_text, vm.value_text);
                        vm.$dispatch('kv-editor-removed', vm);
                    })
                    .fail(function(err) {
                        console.error(err);
                        mp.alert('Что-то пошло не так');
                    })
                    ;

                },

                getOrig: function() {
                    var orig = window;
                    var path = this.prop.split('.');
                    while (path.length) {
                        var new_orig = orig[path.shift()];
                        if (!new_orig) new_orig = {};
                        orig = new_orig;
                    }
                    return orig;
                },
                setOrig: function(key, value) {
                    var orig = window;
                    var path = this.prop.split('.');
                    while (path.length) {
                        var new_orig = orig[path.shift()];
                        if (!new_orig) new_orig = {};
                        orig = new_orig;
                    }

                    orig[key] = value;
                }
            },
            compiled: function() {
                var vm = this;
                if (typeof vm.href === 'undefined') vm.href = '';
                vm.key_orig = vm.key;
                vm.key_text = vm.key;
                vm.value_orig = vm.value;
                vm.value_text = vm.value;
            },
        };
    })
    .then(resolve)
    ;
};
