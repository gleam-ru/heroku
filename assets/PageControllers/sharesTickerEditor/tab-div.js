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

                    '<table>',
                        '<tr>',
                            '<th>Дата закрытия реестра</th>',
                            '<th>Дата выплаты</th>',
                            '<th>Дивиденд (руб.)</th>',
                            '<th>% прибыли</th>',
                        '</tr>',
                        '<tr v-for="div in divs">',
                            '<td>{{div.reestrdate}}</td>',
                            '<td>{{div.paydate}}</td>',
                            '<td>{{div.value}}</td>',
                            '<td>{{div.profitpercent}}</td>',
                        '</tr>',
                    '</table>',

                    '<button',
                        'class="g-btn type_midnight size_small"',
                        'type="submit"',
                        '@click="update"',
                        '>',
                        'Обновить данные',
                    '</button>',

                '</div>',
            ].join(' '),
            //
            //
            //
            props: [],
            data: function() {
                return {
                    //
                    rest: window.updatehref,
                    divs: ticker.divs || [],
                };
            },
            computed: {
            },
            //
            //
            //
            methods: {
                update: function() {
                    console.log('update');
                }
            },
            compiled: function() {
            },
        };
    })
    .then(resolve)
    ;
};
