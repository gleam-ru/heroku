$(document).ready(function() {
    href = '/services/shares/'+ticker.id;

    initVueComponents();




    new Vue({
        el: '#general',
        data: {
            forums: _.map(ticker.general.forums, function(v, k) {
                return {
                    id: k,
                    key: v.name,
                    value: v.href,
                }
            }),
        },
        methods: {
            addForum: function() {
                var vm = this;
                var maxId = _(vm.forums)
                    .map(function(forum) {
                        return parseInt(forum.id.replace('forum_', ''));
                    })
                    .max()
                vm.forums.push({
                    id: 'forum_'+(maxId + 1),
                    key: '',
                    value: '',
                });
            },
            removeForum: function(id) {
                var forum_index = _.findIndex(this.forums, function(forum) {
                    return forum.id == id;
                });
                this.forums.$remove(forum_index);
            }
        },
        created: function() {
            var vm = this;
            this.$on('kv-editor-removed', vm.removeForum);
        },
    });

});


function initVueComponents() {
    initPropEditor();
    initKVEditor();
}


function initPropEditor() {
    Vue.component('prop-editor', {
        template: '#propEditor',
        paramAttributes: ['prop', 'href', 'ph'],

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
        methods: {
            sendData: function() {
                var vm = this;
                var msg = {propEditor: []};

                msg.propEditor.push({
                    key   : vm.prop,
                    value : vm.prop_text,
                });

                $.post(href+vm.href, msg)
                .done(function() {
                    vm.prop_orig = vm.prop_text;
                    vm.setOrig(vm.ticker_code);
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
            vm.prop_orig = vm.getOrig();
            vm.prop_text = vm.getOrig();
            window.qwe = vm;
        },
    });
}

function initKVEditor() {
    Vue.component('kv-editor', {
        template: '#kvEditor',
        paramAttributes: ['editor_id', 'prop', 'href', 'key', 'value', 'key_ph', 'value_ph'],

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
        methods: {
            sendData: function() {
                var vm = this;
                var msg = {propEditor: []};

                msg.propEditor.push({
                    key   : vm.prop,
                    value : {
                        id    : vm.editor_id,
                        key   : vm.key_text,
                        value : vm.value_text,
                    },
                });

                console.log('sending', msg);

                $.post(href+vm.href, msg)
                .done(function() {
                    vm.key_orig   = vm.key_text;
                    vm.value_orig = vm.value_text;
                    vm.setOrig(vm.key_text, vm.value_text);
                });
            },

            removeData: function() {
                var vm = this;
                var msg = {propEditor: []};

                msg.propEditor.push({
                    key    : vm.prop,
                    remove : true,
                    value  : {
                        id    : vm.editor_id,
                    },
                });

                $.post(href+vm.href, msg)
                .done(function() {
                    vm.$dispatch('kv-editor-removed', vm.editor_id);
                    vm.key_orig   = vm.key_text;
                    vm.value_orig = vm.value_text;
                    vm.setOrig(vm.key_text, vm.value_text);
                });

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
            vm.key_orig = vm.key;
            vm.key_text = vm.key;
            vm.value_orig = vm.value;
            vm.value_text = vm.value;
            window.qwe = vm;
        },
    });
}
