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
                        ':saveas="shares/filters"',
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
                filters: [] || us.filters || [],
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
        }, {
            title: 'Code',
            data: 'code',
            filter: 'string',
        }
    ];
    return defaultColumns.concat(_.map(params, function(p) {
        return {
            title: p.title+
                '<span class="tt" title="'+p.desc+'">'+
                    Jade.els.roundIcon('fa-question')+
                '</span>',
            vueTitle: p.title,
            data: p.serverName,
            filter: p.filter || 'number',
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
