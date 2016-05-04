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
                        ':saveas="\'shares/filters\'"',
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
                    {key: 'Данные обновлены', value: shares.info.updatedAt},
                    {key: 'Ближайшее обновление', value: 'через 15 минут'},
                ],
                rows: createRows(_shares.data),
                columns: createColumns(_shares.params),
                filters: us.filters || [],
                // filters: [
                //     {
                //         "text":"test #1",
                //         "conditions": [
                //             {
                //                 "column": {"data":"code"},
                //                 "type": {"value":"contains"},
                //                 "value":"F"
                //             }, {
                //                 "column": {"data":"PE"},
                //                 "type": {"value":"less"},
                //                 "value": "8"
                //             }
                //         ],
                //         "visibleColumns": [
                //             {"data":"code"},
                //             {"data":"name"},
                //             {"data":"PE"}
                //         ]
                //     }, {
                //         "text":"test #2",
                //         "conditions": [
                //             {
                //                 "column": {"data":"code"},
                //                 "type": {"value":"contains"},
                //                 "value":"G"
                //             }, {
                //                 "column": {"data":"PE"},
                //                 "type": {"value":"more"},
                //                 "value": "8"
                //             }
                //         ],
                //         "visibleColumns": [
                //             {"data":"name"},
                //             {"data":"Volume"},
                //             {"data":"PE"}
                //         ]
                //     }
                // ],
            }
        });
    })
    .catch(function(err) {
        console.error(err);
        mp.alert('Что-то пошло не так!');
    })
    ;
});


function createColumns(params) {
    var defaultColumns = [
        {
            title: 'Name',
            data: 'name',
            filter: 'string',
            bVisible: true,
        }, {
            title: 'Code',
            data: 'code',
            filter: 'string',
            bVisible: true,
        }
    ];
    return defaultColumns.concat(_.cMap(params, function(p) {
        return {
            title: p.title+
                '<span class="tt" title="'+p.desc+'">'+
                    Jade.els.roundIcon('fa-question')+
                '</span>',
            vueTitle: p.title,
            data: p.serverName,
            filter: p.filter || 'number',
            bVisible: false,
        };
    }));
}

function createRows(shares) {
    return _.map(shares, function(s) {
        var row = _.extend({}, s, s.cols);
        delete row.cols;
        return row;
    });
}
