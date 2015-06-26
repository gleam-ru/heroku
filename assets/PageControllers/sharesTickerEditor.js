$(document).ready(function() {
    href = '/services/shares/'+ticker.id;

    new Vue({
        el: '#tabs',
        data: {
            tabs: [
                {
                    name      : 'Инфо',
                    component : '',
                    active    : false,
                }, {
                    name      : 'Полезности',
                    component : 'tab_useful',
                    active    : false,
                }, {
                    name      : 'Основное',
                    component : 'tab_general',
                    active    : false,
                }, {
                    name      : 'Отчетность',
                    component : '',
                    active    : false,
                // }, {
                //     name      : 'Другое',
                //     component : '',
                //     active    : false,
                }
            ]
        },
        methods: {
            getActive: function() {
                return _.find(this.tabs, function(tab) {
                    return tab.active === true;
                });
            },
            activate: function(name) {
                var vm = this;
                var active = vm.getActive();
                if (active) {
                    $(active.component).hide();
                    active.active = false;
                }
                var activating = _.find(vm.tabs, {name: name});
                if (activating) {
                    $(activating.component).show();
                    activating.active = true;
                }
                return activating;
            },
        },
        components: {
            tab_general : tab_general(),
            tab_useful  : tab_useful(),
        },
        compiled: function() {
            var vm = this;
            vm.activate('Основное');
        },
    });



});



var tab_useful = function() {
    return {
        template: '#useful',
        data: function() {
            return {
                forums: _.map(ticker.general.forums, function(v, k) {
                    return {
                        id: k,
                        key: v.name,
                        value: v.href,
                    }
                }),
                links: _.map(ticker.general.links, function(v, k) {
                    return {
                        id: k,
                        key: v.name,
                        value: v.href,
                    }
                }),
            }
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
            },
            addLink: function() {
                var vm = this;
                var maxId = _(vm.links)
                    .map(function(link) {
                        return parseInt(link.id.replace('link_', ''));
                    })
                    .max()
                if (maxId < 0) maxId = 0;
                vm.links.push({
                    id: 'link_'+(maxId + 1),
                    key: '',
                    value: '',
                });
            },
            removeLink: function(id) {
                var link_index = _.findIndex(this.links, function(link) {
                    return link.id == id;
                });
                this.links.$remove(link_index);
            },
        },
        components: {
            'kv-editor'   : kvEditor(),
        },
        created: function() {
            var vm = this;
            this.$on('kv-editor-removed', function(child) {
                var id = child.editor_id;
                if (child.prop === 'ticker.general.forums') {
                    vm.removeForum(id)
                }
                else if (child.prop === 'ticker.general.links') {
                    vm.removeLink(id);
                }
            });
        },
    }
}

var tab_general = function() {
    return {
        template: '#general',
        data: function() {
            return {
                branches: branches,
            }
        },
        methods: {
        },
        components: {
            'prop-editor' : propEditor(),
            'sel-editor'  : selEditor(),
        },
        created: function() {
        },
    }
}



var propEditor = function() {
    return {
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
                    vm.setOrig(vm.prop_text);
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
                    orig = orig[path.shift()];;
                }
                orig = value;
            }
        },
        compiled: function() {
            var vm = this;
            vm.prop_orig = vm.getOrig();
            vm.prop_text = vm.getOrig();
        },
    };
}

var kvEditor = function() {
    return {
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
                    vm.$dispatch('kv-editor-removed', vm);
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
        },
    };
}

var selEditor = function() {
    return {
        template: '#selEditor',
        paramAttributes: ['prop', 'model', 'href', 'ph'],

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
        methods: {
            sendData: function() {
                var vm = this;
                var msg = {propEditor: []};

                var selected = _.find(vm.model, {name: vm.curr});

                msg.propEditor.push({
                    key   : vm.prop,
                    value : selected.value,
                });

                $.post(href+vm.href, msg)
                .done(function() {
                    vm.orig = vm.curr;
                    vm.setOrig(vm.curr);
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

            vm.model = [{
                value: 0,
                name: vm.ph,
            }].concat(_.map(vm.model, function(sel) {
                return {
                    value: sel.id,
                    name: sel.name,
                }
            }));

            var orig = vm.getOrig() || 0;
            var found = _.find(vm.model, function(option) {
                return option.value == orig;
            });
            if (!found) {
                console.error('smth went wrong...')
                found = {};
            }
            vm.orig = found.name;
            vm.curr = found.name;

            // vm.prop_orig = vm.getOrig();
            // vm.prop_text = vm.getOrig();
            window.qwe = vm;
        },
    };
}
