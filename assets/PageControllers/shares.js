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
                    return '<a class="ib" href="'+window.location.pathname+'/'+full.ticker+'">'+data+'</a>';
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
                            'href="'+window.location.pathname+'/'+full.ticker+'" '+
                            'target=_blank'+
                            '>'+
                            Jade.els.roundIcon('fa-area-chart')+
                        '</a>';
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'href="'+window.location.pathname+'/'+full.ticker+'" '+
                            'target=_blank'+
                            '>'+
                            Jade.els.roundIcon('fa-external-link')+
                        '</a>';
                    tr += ''+
                        '<a class="inTableIcon"'+
                            'href="'+window.location.pathname+'/'+full.ticker+'" '+
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
        language: {
            "processing": "Подождите...",
            "search": "Поиск:",
            "lengthMenu": "Показать _MENU_ записей",
            "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
            "infoEmpty": "Записи с 0 до 0 из 0 записей",
            "infoFiltered": "(отфильтровано из _MAX_ записей)",
            "infoPostFix": "",
            "loadingRecords": "Загрузка записей...",
            "zeroRecords": "Записи отсутствуют.",
            "emptyTable:": "В таблице отсутствуют данные",
            "paginate": {
                "first": "Первая",
                "previous": "Предыдущая",
                "next": "Следующая",
                "last": "Последняя"
            },
            "aria": {
                "sortAscending": ": активировать для сортировки столбца по возрастанию",
                "sortDescending": ": активировать для сортировки столбца по убыванию"
            }
        },
    })
});
