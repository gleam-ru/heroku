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
                '<div class="kv-editor" :class="{modified: isModified}">',
                    '<input',
                        'class="key ib"',
                        'type="text"',
                        'v-model="key"',
                        'placeholder="key"',
                        'style="margin-right: 20px;"',
                        '/>',
                    '<input',
                        'class="value ib"',
                        'type="text"',
                        'v-model="value"',
                        'placeholder="value"',
                        'style="margin-right: 20px;"',
                        '/>',
                    '<button',
                        'class="g-btn type_midnight size_small"',
                        'type="submit"',
                        '@click="remove"',
                        'style="margin-right: 20px;"',
                        '>',
                        'Удалить',
                    '</button>',
                '</div>',
            ].join(' '),
            //
            //
            //
            props: ['key', 'value', 'modified', 'remove'],
            data: function() {
                return {
                    key_orig: '',
                    value_orig: '',
                };
            },
            computed: {
                keyIsModified: function() {
                    return this.key !== this.key_orig;
                },
                valueIsModified: function() {
                    return this.value !== this.value_orig;
                },
                isModified: function() {
                    return this.modified = this.keyIsModified || this.valueIsModified;
                },
            },
            watch: {
                modified: function(mod) {
                    if (!mod) {
                        this.setSaved();
                    }
                }
            },
            //
            //
            //
            methods: {
                remove: function() {
                    this.$emit('remove');
                },
                setSaved: function() {
                    this.key_orig = this.key;
                    this.value_orig = this.value;
                }
            },
            compiled: function() {
                var vm = this;
                vm.setSaved();
            },
        };
    })
    .then(resolve)
    ;
};
