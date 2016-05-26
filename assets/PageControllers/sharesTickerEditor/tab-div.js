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

                    '<p>',
                        'Данные предоставлены сайтом ',
                        '<a href="http://www.dohod.ru/" target=_blank>dohod.ru</a>',
                        '<span @click="openDonor">'+Jade.els.roundIcon('fa-share')+'</span>',
                    '</p>',
                    '<p>',
                        '{{comment}}',
                    '</p>',

                    '<table class="divs-table">',
                        '<tr>',
                            '<th>Дата закрытия реестра</th>',
                            '<th>Дата выплаты</th>',
                            '<th>Дивиденд (руб.)</th>',
                            '<th>% прибыли</th>',
                        '</tr>',
                        '<tr v-for="div in divs" :class="{forecast: div.is_forecast}">',
                            '<td :class="{recommended: div.reestrdate_recommended}">',
                                '{{div.reestrdate}}',
                                '<i class="fa fa-check" v-if="div.reestrdate_recommended"></i>',
                            '</td>',
                            '<td>{{div.paydate}}</td>',
                            '<td :class="{recommended: div.value_recommended}">',
                                '{{div.value}}',
                                '<i class="fa fa-check" v-if="div.value_recommended"></i>',
                            '</td>',
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
                    rest    : window.updatehref,
                    divs    : ticker.divs || [],
                    comment : ticker.divs_comment || '',
                };
            },
            computed: {
            },
            //
            //
            //
            methods: {
                openDonor: function() {
                    window.open('http://www.dohod.ru/ik/analytics/dividend/'+ticker.code);
                },
                update: function() {
                    var vm = this;

                    var el = $(vm.$el);
                    if (el.hasClass('disabled')) {
                        return false;
                    }
                    el.disable();

                    $.post('/services/shares/'+ticker.id+'/parse_divs')
                    .done(function(response) {
                        if (!response) {
                            mp.alert('Пустой ответ от сервера...');
                            return;
                        }

                        vm.divs = response.divs;
                        vm.divs_comment = response.comment;
                    })
                    .fail(function(err) {
                        console.error(err);
                        mp.alert('Что-то пошло не так');
                    })
                    .always(function() {
                        el.enable();
                    })
                    ;


                }
            },
            compiled: function() {
            },
        };
    })
    .then(resolve)
    ;
};
