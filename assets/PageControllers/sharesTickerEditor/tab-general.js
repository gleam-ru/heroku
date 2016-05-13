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
                '<div>tab-general</div>',
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
