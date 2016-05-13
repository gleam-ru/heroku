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
                    '<div>tab-general</div>',
                    '<prop-editor',
                        'prop="ticker.code"',
                        'ph="код (gazp)"',
                        '>',
                    '</prop-editor>',
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
