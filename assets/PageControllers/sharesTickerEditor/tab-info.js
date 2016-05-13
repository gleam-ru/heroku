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
                    '<ul>',
                        '<li>',
                            '<a',
                                'href="http://mfd.ru/marketdata/ticker/?id={{info.mfd_id}}"',
                                'target="_blank"',
                                'class="mr-10"',
                                '>',
                                '<i class="fa fa-external-link"></i>',
                            '</a>',
                            'MFD_id: {{info.mfd_id}}',
                        '</li>',
                        '<li>',
                            '<a',
                                'href="/services/shares/{{ticker.id}}/info"',
                                'target="_blank"',
                                'class="mr-10"',
                                '>',
                                '<i class="fa fa-external-link"></i>',
                            '</a>',
                            'Всего свечей: {{info.candlesCount}}',
                        '</li>',
                        '<li>',
                            'Крайняя daily свеча: {{info.lastDailyDate}}',
                        '</li>',
                        '<li>',
                            'Крайняя inday свеча: {{info.lastIndayDate}}',
                        '</li>',
                        '<li>',
                            'Количество сегодняшних свечей: {{info.indayCount}}',
                        '</li>',
                    '</ul>',
                '</div>',
            ].join(' '),
            //
            //
            //
            props: [],
            data: function() {
                var info = {};
                info.id = ticker.id;
                info.mfd_id = ticker.mfd_id;
                info.candlesCount = ticker.info.candlesCount;
                info.lastDailyDate = ticker.info.lastDay;
                info.lastIndayDate = ticker.info.lastCandle && ticker.info.lastCandle.date ? ticker.info.lastCandle.date : '...';
                info.indayCount = ticker.info.indayCount ? ticker.info.indayCount : 0;
                return {
                    info: info,
                    ticker: ticker,
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


