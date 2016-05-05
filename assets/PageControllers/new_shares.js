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
                rows: createRows(shares.rows),
                columns: createColumns(shares.params),
                filters: us.filters || [],
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
            title: 'Links',
            sClass: 'sharesIconsColumn',
            bVisible: true,
            render: function(data, type, full) {
                var tr = '';

                // admin
                if (hasRoles(['admin', 'shares-filler']))
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'href="'+href+'/'+full.id+'/edit" '+
                            '>'+
                            Jade.els.roundIcon('fa-paw')+
                        '</a>';



                // moex
                if (full.code)
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'title="MOEX" '+
                            'href="http://moex.com/ru/issue.aspx?code='+full.code+'"'+
                            'target=_blank'+
                            '>'+
                            Jade.els.roundIcon('fa-area-chart')+
                        '</a>';
                else
                    tr += Jade.els.roundIcon('fa-area-chart', true)



                // main (external) page
                if (full.site)
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'href="'+full.site+'" '+
                            'target=_blank'+
                            '>'+
                            Jade.els.roundIcon('fa-external-link')+
                        '</a>';
                else
                    tr += Jade.els.roundIcon('fa-external-link', true)



                // forums
                if (_.keys(full.forums).length)
                    tr += ''+
                        '<span class="inTableIcon tt tt_interactive tt_html cur-p"'+
                            'title="'+
                                '<ul><p>Полезные форумы:</p>'+
                                    _.map(full.forums, function(f) {
                                            return {
                                                name: f.key,
                                                href: f.value,
                                            }
                                        })
                                        .map(function(f) {
                                            return '<li><a target=\'_blank\' href=\''+f.href+'\'>'+f.name+'</a></li>';
                                        })
                                        .join('')+
                                '</ul>'+
                            '"'+
                        '>'+
                            Jade.els.roundIcon('fa-comments')+
                        '</span>';
                else
                    tr += Jade.els.roundIcon('fa-comments', true)



                // links
                if (_.keys(full.links).length)
                    tr += ''+
                        '<span class="inTableIcon tt tt_interactive tt_html cur-p"'+
                            'title="'+
                                '<ul><p>Полезные ссылки:</p>'+
                                    _.map(full.links, function(l) {
                                            return {
                                                name: l.key,
                                                href: l.value,
                                            }
                                        })
                                        .map(function(l) {
                                            return '<li><a target=\'_blank\' href=\''+l.href+'\'>'+l.name+'</a></li>';
                                        })
                                        .join('')+
                                '</ul>'+
                            '"'+
                        '>'+
                            Jade.els.roundIcon('fa-paperclip')+
                        '</span>';
                else
                    tr += Jade.els.roundIcon('fa-paperclip', true)



                tr += ''+
                    '<a class="inTableIcon"'+
                        'title="Добавить в портфель"'+
                        'href="#"'+
                        '>'+
                        Jade.els.roundIcon('fa-plus')+
                    '</a>';

                return tr;
            },
        }, {
            title: 'Code',
            data: 'code',
            filter: 'string',
            bVisible: true,
            sClass: 'sharesCodeColumn',
        }, {
            title: 'Name',
            data: 'name',
            filter: 'string',
            bVisible: true,
            render: function(name, dunno, data) {
                return '<a href="/services/shares/'+data.href+'">'+name+'</a>';
            }
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
            filter: p.filter || p.type || 'number',
            bVisible: false,
        };
    }));
}

function createRows(shares) {
    return _.map(shares, function(s) {
        var row = _.extend({}, s, s.google);
        delete row.google;
        return row;
    });
}
