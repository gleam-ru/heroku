$(document).ready(function() {

    var additional;
    var filters;
    var columns;
    var rows;

    var view = $('.content');
    view.mask();

    var loaded = _.after(3, function() {
        window.qwe = new MyTable({
            el: '#bonds-table',
            data: {
                additional  : additional,
                filters     : filters,
                filters_api : href+'/updateFilter',
                rows        : rows,
                columns     : columns,
                isReady     : function() {
                    view.mask(false);
                    setTimeout(beginLearning, 1000);
                },
            }
        });
    });


    // получаю дополнительную информацию (верхний левый угол)
    $.get(href+'/additional')
    .done(function(loaded) {
        additional = loaded.data;
    })
    .always(function() {
        loaded();
    });


    // получаю сохраненные фильтры
    $.get(href+'/filters')
    .done(function(loaded) {
        filters = loaded.data;
    })
    .fail(function(err) {
        alert('smth went wrong...');
        console.error(err);
    })
    .always(function() {
        loaded();
    });


    // получаю данные для таблицы
    $.get(href+'/all')
    .done(function(loaded) {
        rows = loaded.data;
    })
    .fail(function(err) {
        alert('smth went wrong...');
        console.error(err);
    })
    .always(function() {
        loaded();
    });


    // описание колонок для datatables
    columns = [
        {
            id: "id",
            title: "ID",
            filterType: "number",
            visible: false,
        }, {
            id: "name",
            title: "Наименование",
            filterType: "string",
        }, {
            id: "bid",
            title: "Предл.",
            filterType: "number",
        }, {
            id: "ask",
            title: "Спрос",
            filterType: "number",
        }, {
            id: "endDate",
            title: "Погашение (дата)",
            filterType: "date",
        }, {
            id: "expiresIn",
            title: "Погашение (дни)",
            filterType: "number",
        // }, {
        //     id: "cpVal",
        //     title: "Купон (%)",
        //     filterType: "number",
        // }, {
        //     id: "cpDur",
        //     title: "Купон (дни)",
        //     filterType: "number",
        }, {
            id: "percent",
            title: "Доходность (%)",
            filterType: "number",
            className: "default_sorting",
        }, {
            id: "percentWTaxes",
            title: "Доходность (-13%)",
            filterType: "number",
        }, {
            width: "10px",
            className: "buttonColumn",
            targets: -1,
            data: null,
            sortable: false,
            defaultContent: ''+
                '<span class="buy">'+
                    Jade.els.roundIcon('fa-plus')+
                '</span>',
        },
    ];

});


function beginLearning() {
    Learning.init({
        starter: {
            el: '.begin-learning',
            tt: {
                content: $('<p>Нажмите, чтобы<br />показать / скрыть подсказки</p>'),
                trigger: 'hover',
                interactive: false,
                multiple: false,
                maxWidth: 250,
                position: 'right',
            }
        },
        steps: [
            {
                el: '.my-table .additional',
                tt: {
                    content: 'Для закрытия подсказки нажмите на нее',
                    position: 'top-right',
                    arrow: false,
                }
            },


            //
            // Preview
            //
            {
                el: '.my-table .filters-preview .fa-gear',
                tt: {
                    content: 'Нажмите для редактирования фильтра',
                    position: 'left',
                }
            },
            {
                el: '.my-table .filters-preview .fa-gear',
                tt: {
                    content: 'Нажмите еще раз для отмены',
                    position: 'left',
                }
            },
            {
                el: '.my-table .filters-preview .filters-preview-text',
                tt: {
                    content: 'Нажмите для выбора фильтра',
                    position: 'bottom',
                }
            },
            {
                el: '.my-table .filters-preview .filters-preview-text',
                tt: {
                    content: 'Нажмите еще раз для отмены',
                    position: 'bottom',
                }
            },
            {
                el: '.my-table .filters-preview .fa-times',
                tt: {
                    content: 'Удаление фильтра',
                    position: 'top',
                }
            },


            //
            // Table
            //
            {
                el: '.my-table .dataTables_scroll',
                tt: {
                    content: 'Нажмите для сортировки',
                    position: 'top',
                }
            },
        ]
    });
}
