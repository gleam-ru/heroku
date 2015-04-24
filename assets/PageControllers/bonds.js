$(document).ready(function() {

    var data = {
        // откуда брать данные
        ajax: 'bonds/get',
        // описание этих данных
        columns: [
            {
                title: "Наименование",
                data: "name",
            },
            {
                title: "Номер",
                data: "num",
                visible: false,
            },
            {
                title: "Спрос",
                data: "bid",
                type: "number",
            },
            {
                title: "Предложение",
                data: "ask",
                type: "number",
            },
            {
                title: "Купон",
                data: "cpVal",
                type: "number",
                visible: false,
            },
            {
                title: "НКД",
                data: "nkd",
                type: "number",
                visible: false,
            },
            {
                title: "Дюрация купона",
                data: "cpDur",
                visible: false,
            },
            {
                title: "Дата выплаты купона",
                data: "cpDate",
                type: "date",
                visible: false,
            },
            {
                title: "Номинал (руб.)",
                data: "rate",
                visible: false,
            },
            {
                title: "Дата погашения",
                data: "endDate",
                type: "date",
            },
            {
                title: "Дюрация (дни)",
                data: "dur",
                visible: false,
            },
            {
                title: "Статус",
                data: "state",
                visible: false,
            },
            {
                title: "Дней до погашения",
                data: "expiresIn",
            },
            {
                title: "Купонная доходность",
                data: "cpYie",
                type: "number",
                visible: false,
            },
            {
                title: "Цена",
                data: "price",
                type: "number",
            },
            {
                title: "Доходность",
                data: "percent",
                type: "number",
                // visible: false,
            },
            {
                title: "Доходность -13%",
                data: "percentWTaxes",
                type: "number",
                visible: false,
            },
        ],
        // доп инфо, которое нужно отобразить слева
        additional: [
            {
                name: 'Данные обновлены',
                value: '14 минут назад',
            },
            {
                name: 'Ближайшее обновление',
                value: 'через 30 минут',
            },
        ],
        // сохраненные фильтры
        savedFilters: [
            {
                name: "First filter",
                visibleColumns: [
                    'name',
                    'bid',
                    'ask',
                    'percentWTaxes',
                ],
                conditions: [
                    {
                        column: 'name',
                        type: 'contains',
                        value: 'ОФЗ',
                    }
                ],
            },
            {
                name: "One more",
                conditions: [
                    {
                        column: 'name',
                        type: 'contains',
                        value: 'тул',
                    }
                ],
            },
            {
                name: "And more...",
                conditions: [],
            },
        ],
    };

    new MyTable({
        el: '#bonds-table',
        data: data,
    });

});
