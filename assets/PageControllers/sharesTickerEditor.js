$(document).ready(function() {
    href = '/services/shares/'+ticker.id;

    window.vue_tkr = new Vue({
        el: '#general',
        data: {
            stored_ticker_code: ticker.general.ticker_code,
            ticker_code: ticker.general.ticker_code,
        },
        watch: {
        },
        computed: {
            modified_ticker_code: function() {
                return this.ticker_code !== this.stored_ticker_code;
            },
        },
        methods: {
            postTickerCode: function() {
                var vm = this;
                var msg = {
                    ticker_code: vm.ticker_code,
                };
                $.post(href+'/general', msg)
                .done(function() {
                    vm.stored_ticker_code      = vm.ticker_code;
                    ticker.general.ticker_code = vm.ticker_code;
                });
            },
        },
    });
});
