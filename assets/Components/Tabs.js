module.exports = function(resolve) {
    System.importAll({
        router: '/bower_components/vue-router/dist/vue-router.js',
    })
    .then(function(imported) {

        return {
            template: [
                '<div class="router-tabs">',
                '</div>',
            ].join(' '),
            props: ['tabs'],
            data: function() {
                return {};
            },
            ready: function() {
                var vm = this;
                var App = {
                    template: [
                        '<div>',

                            '<ul class="tabs-nav">',
                                '<li v-for="i in tabs"><span v-link="i.url">{{i.title}}</span></li>',
                            '</ul>',

                            // separator
                            '<div style="margin: 20px 0px 40px 0px;" class="g-hr no-select"><span class="g-hr-h"></span></div>',

                            '<div class="tab">',
                                '<router-view></router-view>',
                            '</div>',

                        '</div>'
                    ].join(' '),
                    data: function() {
                        return {
                            tabs: vm.tabs,
                        };
                    },
                };

                var VueRouter = imported.router;
                var router = new VueRouter();

                // тут получается что-то типо {url1: {component: Cmp}, url2: {...}}
                var routes = _.reduce(vm.tabs, function(result, tab) {
                    if (!tab.cmp || !tab.url || !tab.title) {
                        console.warn('broken tab initialization:', tab, 'ignore.');
                        console.warn('example_tab: {url: "/general",  cmp: imported.general,  title: "Основное"}');
                    }
                    else {
                        result[tab.url] = {
                            component: tab.cmp,
                        };
                    }
                    return result;
                }, {});

                router.redirect({
                    '*': _.first(vm.tabs).url || '',
                });

                router.map(routes);
                router.start(App, vm.$el);
            }
        };
    })
    .then(resolve)
    ;
};
