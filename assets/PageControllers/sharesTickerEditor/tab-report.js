/**
 * Вкладка с основными данными тикера
 *
 */

module.exports = function(resolve) {
    System.importAll({
        _raw: [
        ]
    })
    .then(function() {
        return {
            template: [
                '<div>',
                    '<div>tab-report</div>',
                '</div>',
            ].join(' '),
            //
            //
            //
            props: [],
            data: function() {
                return {
                }
            },
            computed: {
            },
            //
            //
            //
            methods: {
            },
            compiled: function() {
            },
        };
    })
    .then(resolve)
    ;
};
