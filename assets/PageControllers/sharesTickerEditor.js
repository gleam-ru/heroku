$(document).ready(function() {
    href = '/services/shares/'+ticker.id;


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



    new Vue({
        el: '#general',
    });

});
