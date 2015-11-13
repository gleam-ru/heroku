window.VueTabs = Vue.extend({
    // шаблон
    template: Jade.VueTabsTemplate(),
    data: {
        tabs: []
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
            var activating;
            if (!activating) {
                activating = _.find(vm.tabs, {name: name});
            }
            if (!activating) {
                activating = _.find(vm.tabs, {alias: name});
            }
            if (!activating) {
                var matches = window.location.href.match(/\#(.*)/g);
                var alias = matches ? matches[0].replace('#', '') : undefined;
                activating = _.find(vm.tabs, {alias: alias});
            }
            if (!activating) {
                activating = vm.tabs[0];
            }

            $(activating.component).show();
            activating.active = true;
            window.location.hash = '#'+activating.alias;
            if (activating.activatedCb) {
                activating.activatedCb();
            }

            return activating;
        },
    },
    components: {
    },

    created: function() {
        var sheet = window.document.styleSheets[0];
        var cssRules = [
            ".tab.header + .tab.header::before { \
                content: '|'; \
                font-size: 24px; \
                font-family: Serif; \
                padding: 0px 10px; \
                line-height: 24px; \
            }",
            ".tab.header h3:hover { \
                color: #ffa412; \
            }",
            ".tab.header h3 { \
                line-height: 24px; \
                padding: 0px; \
                border-bottom: dashed 1px #CCC; \
                cursor: pointer; \
                color: #1abc9c; \
            }",
            ".tab.header .active { \
                border-bottom: none; \
                cursor: auto; \
                color: inherit !important; \
            }",
        ]
        _.each(cssRules, function(rule) {
            sheet.insertRule(rule, sheet.cssRules.length);
        })
    },

    compiled: function() {
        var vm = this;
        vm.activate();
        $(window).bind('hashchange', vm.activate);
    },
});
