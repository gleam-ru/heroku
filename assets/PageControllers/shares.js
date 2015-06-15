$(document).ready(function() {
    $('#table').dataTable({
        data: shares.rows,
        columns: [
            {
                data: 'id',
                title: 'ID',
                visible: false,
            }, {
                data: 'name',
                title: 'Имя',
                // render: function(data, type, full, meta) {
                render: function(data, type, full) {
                    return '<a class="ib" href="'+href+'/'+full.ticker+'">'+data+'</a>';
                },
            }, {
                title: 'Ссылки',
                render: function(data, type, full) {
                    // оф сайт
                    // форумы
                    // моекс
                    // новости
                    var tr = '';
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'href="'+href+'/'+full.ticker+'" '+
                            'target=_blank'+
                            '>'+
                            Jade.els.roundIcon('fa-area-chart')+
                        '</a>';
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'href="'+href+'/'+full.ticker+'" '+
                            'target=_blank'+
                            '>'+
                            Jade.els.roundIcon('fa-external-link')+
                        '</a>';
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'href="'+href+'/'+full.ticker+'" '+
                            'target=_blank'+
                            '>'+
                            Jade.els.roundIcon('fa-comments')+
                        '</a>';
                    return tr;
                },
            }, {
                data: 'ticker',
                title: 'Тикер',
            }, {
                data: 'price',
                title: 'Цена',
            }, {
                width: "10px",
                targets: -1,
                data: null,
                sortable: false,
                defaultContent: ''+
                    '<span class="buy">'+
                        Jade.els.roundIcon('fa-plus')+
                    '</span>',
            },
        ],
        sDom: 'ft',
        paging: false,
        deferRender: true,
        sScrollX: '100%',
        bScrollCollapse: true,
        language: datatables_localization,
    })
});
