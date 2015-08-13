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
                var empty_space = '<span class="emptyRoundIcon"></span>';
                if (full.code) {
                    console.log(full)
                }
                // оф сайт
                // форумы
                // моекс
                // новости
                var tr = '';
                // admin
                if (user && user.access === 'admin') {
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'href="'+href+'/'+full.id+'/edit" '+
                            '>'+
                            Jade.els.roundIcon('fa-paw')+
                        '</a>';
                }
                else {
                    // tr += empty_space;
                }
                // moex
                if (full.code) {
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'title="MOEX" '+
                            'href="http://moex.com/ru/issue.aspx?code='+full.code+'"'+
                            'target=_blank'+
                            '>'+
                            Jade.els.roundIcon('fa-area-chart')+
                        '</a>';
                }
                else {
                    tr += Jade.els.roundIcon('fa-area-chart', true)
                }
                // main (external) page
                if (full.site) {
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'href="'+full.site+'" '+
                            'target=_blank'+
                            '>'+
                            Jade.els.roundIcon('fa-external-link')+
                        '</a>';

                }
                else {
                    tr += Jade.els.roundIcon('fa-external-link', true)
                }
                // tr += ''+
                //     '<a class="inTableIcon"'+
                //         'href="'+href+'/'+full.href+'" '+
                //         'target=_blank'+
                //         '>'+
                //         Jade.els.roundIcon('fa-comments')+
                //     '</a>';
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



    table.DataTable({
        data: shares.rows,
        columns: columns,
        sDom: 'ftp',
        paging: true,
        deferRender: true,
        sScrollX: '100%',
        bScrollCollapse: true,
        language: datatables_localization,
    });
});
