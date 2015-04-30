$(document).ready(function() {


    var data = {
        // откуда брать данные
        ajax: 'bonds/all',
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
                title       : "Спрос",
                data        : "bid",
                filterType  : "number",
            },
            {
                title       : "Предложение",
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
            },
            {
                title       : "Доходность",
                data        : "percent",
                filterType  : "number",
                //      visible: false,
            },
            {
                title       : "Доходность -13%",
                data        : "percentWTaxes",
                filterType  : "number",
                visible     : false,
            },
        ],
        // доп инфо, которое нужно отобразить слева

        editingFilterIndex: 0,
        currentFilterIndex: 0,

        filters: 'bonds/filters',
        filters_api: 'bonds/updateFilter',

        additional: 'bonds/additional',

        save: function(cb) {
            if (typeof cb !== 'function') cb = function() {};

        },
    };

    new MyTable({
        el: '#bonds-table',
        data: data,
    });

});
