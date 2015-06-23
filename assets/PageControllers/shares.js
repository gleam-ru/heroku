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
                // оф сайт
                // форумы
                // моекс
                // новости
                var tr = '';
                tr += ''+
                    '<a class="inTableIcon"'+
                        'href="'+href+'/'+full.id+'/edit" '+
                        '>'+
                        Jade.els.roundIcon('fa-paw')+
                    '</a>';
                tr += ''+
                    '<a class="inTableIcon"'+
                        'href="'+href+'/'+full.href+'" '+
                        'target=_blank'+
                        '>'+
                        Jade.els.roundIcon('fa-area-chart')+
                    '</a>';
                tr += ''+
                    '<a class="inTableIcon"'+
                        'href="'+href+'/'+full.href+'" '+
                        'target=_blank'+
                        '>'+
                        Jade.els.roundIcon('fa-external-link')+
                    '</a>';
                tr += ''+
                    '<a class="inTableIcon"'+
                        'href="'+href+'/'+full.href+'" '+
                        'target=_blank'+
                        '>'+
                        Jade.els.roundIcon('fa-comments')+
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
