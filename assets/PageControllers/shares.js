$(document).ready(function() {
    var table = $('#table');
    var columns = [
        {
            data: 'id',
            title: 'ID',
            visible: false,
        }, {
            title: 'Ссылки',
            width: 84, // 28px * количество_иконок
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
            data: 'name',
            title: 'Имя',
            // render: function(data, type, full, meta) {
            render: function(data, type, full) {
                return '<a class="ib" href="'+href+'/'+full.href+'">'+data+'</a>';
            },
        }, {
            data: 'code',
            title: 'Код',
        }, {
            data: 'price',
            title: 'Цена',
        },
    ]



    var DT = table.dataTable({
        data: shares.rows,
        columns: columns,
        sDom: 'lfpt',
        stateSave: true,
        oSearch: {
            // smart: true,
            bRegex: true,
        },
        stateSaveParams: function (settings, data) {
            // data.search.search = "";
        },
        paging: true,
        deferRender: true,
        sScrollX: '100%',
        bScrollCollapse: true,
        language: datatables_localization,
        fnDrawCallback: initTT,
    });

    // http://stackoverflow.com/questions/25382569/jquery-datatables-or-search-filter
    $('#table_filter input').on('keyup click search input', function() {
        var input = $(this);
        var keywords = input.val().split(' ');
        var filter = '';
        for (var i = 0; i < keywords.length; i++) {
            filter = (filter !== '') ? filter + '|' + keywords[i] : keywords[i];
        }
        DT.fnFilter(filter, null, true, false, true, true);
    });

});
