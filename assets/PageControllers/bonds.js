$(document).ready(function() {
    var path = window.location.pathname;


    // popups.confirm('Спасибо за внимание', function() {
    //     alert('done');
    // });


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



    qwe.selectFilter(undefined);
    qwe.editFilter(0);
    setTimeout(function() {

        var trip = new Trip([{
            //
            // preview
            //
            sel: $(".my-table .filters-preview .fa-gear"),
            content: "Редактировать фильтр",
            position: "w",
        }, {
            sel: $(".my-table .filters-preview .filters-preview-text"),
            content: "Активировать фильтр",
            position: "w",
        }, {
            sel: $(".my-table .filters-preview .fa-times"),
            content: "Удалить фильтр",
            position: "w",
        }, {
            sel: $(".my-table .filters-preview .add"),
            content: "Новый фильтр",
            position: "w",
        }, {
            //
            // editor
            //
            sel: $(".my-table .filter-editor .name"),
            content: "Название фильтра",
            position: "e",
        }, {
            sel: $(".my-table .filter-editor .row"),
            content: "Условия фильтрации",
            position: "n",
        }, {
            sel: $(".my-table .filter-editor .row"),
            content: "Тип фильтрации зависит <br />от типа выбранной колонки",
            position: "n",
        }, {
            sel: $(".my-table .filter-editor .row"),
            content: "Все условия должны <br />выполняться одновременно",
            position: "n",
        }, {
            sel: $(".my-table .filter-editor .row"),
            content: "Условиия применяются автоматически",
            position: "n",
        }, {
            sel: $(".my-table .filter-editor .save"),
            content: "После редактирования необходимо <br />сохранить фильтр",
            position: "n",
        }, {
            sel: $(".my-table .table .dataTables_scrollHead"),
            content: "Нажмите для сортировки по столбцу",
            position: "w",
        }], {
            delay: -1,
            tripTheme: 'dark',
            animation: 'fadeInDown',
            showNavigation: true,
        });

        trip.start();
    }, 1000);

});
