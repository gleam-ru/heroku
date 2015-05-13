$(document).ready(function() {
    var path = window.location.pathname;

    var data = {
        // откуда брать данные
        ajax: path+'/all',
        // описание этих данных
        columns: [
            {
                title       : "Наименование",
                data        : "name",
                filterType  : "string",
            },
            {
                title       : "Номер",
                data        : "num",
                filterType  : "string",
                visible     : false,
            },
            {
                title       : "Предложение",
                data        : "bid",
                filterType  : "number",
            },
            {
                title       : "Спрос",
                data        : "ask",
                filterType  : "number",
            },
            {
                title       : "Купон",
                data        : "cpVal",
                filterType  : "number",
                visible     : false,
            },
            {
                title       : "НКД",
                data        : "nkd",
                filterType  : "number",
                visible     : false,
            },
            {
                title       : "Дюрация купона",
                data        : "cpDur",
                filterType  : "number",
                visible     : false,
            },
            {
                title       : "Дата выплаты купона",
                data        : "cpDate",
                filterType  : "date",
                visible     : false,
            },
            {
                title       : "Номинал (руб.)",
                data        : "rate",
                filterType  : "number",
                visible     : false,
            },
            {
                title       : "Дата погашения",
                data        : "endDate",
                filterType  : "date",
            },
            {
                title       : "Дюрация (дни)",
                data        : "dur",
                filterType  : "number",
                visible     : false,
                defaultContent: '',
            },
            {
                title       : "Статус",
                data        : "state",
                filterType  : "string",
                visible     : false,
            },
            {
                title       : "Дней до погашения",
                data        : "expiresIn",
                filterType  : "number",
            },
            {
                title       : "Купонная доходность",
                data        : "cpYie",
                filterType  : "number",
                visible     : false,
            },
            {
                title       : "Цена",
                data        : "price",
                filterType  : "number",
                visible     : false,
            },
            {
                title       : "Доходность",
                data        : "percent",
                filterType  : "number",
                className   : "default_sorting",
            },
            {
                title       : "Доходность -13%",
                data        : "percentWTaxes",
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
        data: data,
    });



    Learning.init({
        starter: {
            el: '.begin-learning',
            tt: {
                content: $('<p>Нажмите, чтобы<br />показать / скрыть подсказки</p>'),
                trigger: 'hover',
                interactive: false,
                multiple: false,
                maxWidth: 200,
            }
        },
        steps: [
            {
                el: '.my-table .filters-preview',
                tt: {
                    content: 'Для закрытия подсказки нажмите на нее',
                    position: 'top',
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
});
