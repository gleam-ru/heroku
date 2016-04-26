$(document).ready(function() {
    System.importAll({
        twf: '/Components/TWF/index.js',
    })
    .then(function(imported) {
        window.imp = imported;
        window.vm = new Vue({
            el: '#vue',
            template: [
                '<div>',
                    '<TWF',
                        ':info="info"',
                        ':rows="rows"',
                        ':columns="columns"',
                        ':filters="filters"',
                        '>',
                    '</TWF>',
                '</div>',
            ].join(' '),
            components: {
                'twf': imported.twf,
            },
            data: {
                info: [
                    {
                        key   : 'Данные обновлены',
                        value : moment().format('DD.MM.YYYY - hh:mm:ss'),
                    },
                    {
                        key   : 'Ближайшее обновление',
                        value : 'через 19 минут',
                    },
                    {
                        key   : 'Всего',
                        value : shares.rows.length,
                    },
                    {
                        key   : 'После фильтрации',
                        value : shares.rows.length,
                    }
                ],
                rows: shares.rows,
                columns: [
                    {data: 'name', title: 'Тикер', filter: 'string'},
                    {data: 'id', title: 'id', filter: 'date'},
                    {
                        class: 'buttonColumn',
                        render: function(a, b, row, pos) {
                            return [
                                '<span>',
                                    Jade.els.roundIcon('fa-question'),
                                '</span>',
                            ].join(' ');
                        }
                    },
                    // {id: 'name', title: 'Test', filter: 'string', render: function() {console.log(arguments); return 'it wrks';}},
                ],
                filters: [
                    {text: 'test filter', conditions: []},
                    {text: 'one more', conditions: []},
                ],
            }
        });
    })
    .catch(function(err) {
        console.error(err);
        mp.alert('Что-то пошло не так!');
    })
    ;
});
