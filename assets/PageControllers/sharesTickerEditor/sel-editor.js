/**
 * Редактирование связки ключ-значение
 * Пример использования:

    '<sel-editor',
        'prop="ticker.branch"',
        'ph=""',
        ':model="branches"',
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
                '<select',
                    'class="ib"',
                    'v-model="curr"',
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
                    '@click="sendData"',
                    '>',
                    'Сохранить',
                '</button>',
            ].join(' '),
            //
            //
            //
            props: ['prop', 'model', 'href', 'ph'],
            data: function() {
                return {
                    orig: '',
                    curr: '',
                }
            },
            computed: {
                is_modified: function() {
                    if (this.orig === undefined && this.curr === '') {
                        return false;
                    }
                    return this.curr !== this.orig;
                },
            },
            //
            //
            //
            methods: {
                sendData: function() {
                    var vm = this;
                    var selected = _.find(vm.model, {name: vm.curr});

                    var el = $(vm.$el);
                    if (el.hasClass('disabled')) {
                        return false;
                    }
                    el.disable();

                    $.post(href+vm.href, {
                        message: {
                            key   : vm.prop,
                            value : selected.value,
                        }
                    })
                    .done(function() {
                        vm.orig = vm.curr;
                        vm.setOrig(vm.curr);
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
                        var new_orig = orig[path.shift()];
                        if (!new_orig) new_orig = {};
                        orig = new_orig;
                    }
                    orig = value;
                }
            },
            compiled: function() {
                var vm = this;
                if (typeof vm.href === 'undefined') vm.href = '';

                vm.model = [{
                    value: 0,
                    name: vm.ph,
                }].concat(_.map(vm.model, function(sel) {
                    return {
                        value: sel.id,
                        name: sel.name,
                    }
                }));

                var orig = vm.getOrig() ? vm.getOrig().id : 0;
                var found = _.find(vm.model, {value: orig});
                if (!found) {
                    console.error('smth went wrong...')
                    found = {};
                }
                vm.orig = found.name;
                vm.curr = found.name;
            },
        };
    })
    .then(resolve)
    ;
};
