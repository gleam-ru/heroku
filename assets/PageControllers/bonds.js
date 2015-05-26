$(document).ready(function() {
    var path = window.location.pathname;

    var data = {
        // откуда брать данные
        ajax: path+'/all',
        // описание этих данных
        columns: [
            {
                id          : "id",
                title       : "ID",
                filterType  : "number",
                visible     : false,
            },
            {
                id          : "name",
                title       : "Наименование",
                filterType  : "string",
            },
            {
                id          : "bid",
                title       : "Предл.",
                filterType  : "number",
            },
            {
                id          : "ask",
                title       : "Спрос",
                filterType  : "number",
            },
            {
                id          : "endDate",
                title       : "Погашение<br>(дата)",
                filterType  : "date",
            },
            {
                id          : "expiresIn",
                title       : "Погашение<br>(дни)",
                filterType  : "number",
            },
            {
                id          : "cpVal",
                title       : "Купон<br>(%)",
                filterType  : "number",
            },
            {
                id          : "cpDur",
                title       : "Купон<br>(дни)",
                filterType  : "number",
            },
            {
                id          : "percent",
                title       : "Доходность<br>(%)",
                filterType  : "number",
                className   : "default_sorting",
            },
            {
                id          : "percentWTaxes",
                title       : "Доходность<br>(минус 13%)",
                filterType  : "number",
            },
        ],

        filters: path+'/filters',
        filters_api: path+'/updateFilter',

        // доп инфо, которое нужно отобразить слева
        additional: path+'/additional',
    };

    window.qwe = new MyTable({
        el: '#bonds-table',
        data: _.extend(data, {
            isReady: function() {
                setTimeout(beginLearning, 1000);
            },
        }),
    });

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
