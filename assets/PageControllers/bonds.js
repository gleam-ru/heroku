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



    $.fn.tooltipster('setDefaults', {
        autoclose: false,
        trigger: 'custom',
        multiple: true,
        interactive: true,
    });


    window.start = $('.begin-learning').tooltipster({
        content: $('<p>Нажмите, чтобы<br />показать / скрыть подсказки</p>'),
        trigger: 'hover',
        interactive: false,
        multiple: false,
        maxWidth: 200,
    }).click(function() {
        learning();
    });

    function learning() {
        console.log('init');
        // qwe.selectFilter(undefined);
        // qwe.editFilter(0);
        // Vue.nextTick(drawTT);
        drawTT();


        function drawTT() {
            if (!window._tt) {
                window._tt = {};
                _tt.visible = false;
                _tt.steps = [
                    $('.my-table .filters-preview').first().tooltipster({
                        content: 'Для закрытия подсказки нажмите на нее',
                        position: 'top',
                        arrow: false,
                    }),


                    //
                    // Preview
                    //
                    $('.my-table .filters-preview .fa-gear').first().tooltipster({
                        content: 'Нажмите для редактирования фильтра',
                        position: 'left',
                    }),
                    $('.my-table .filters-preview .fa-gear').first().tooltipster({
                        content: 'Нажмите еще раз для отмены',
                        position: 'left',
                    }),
                    $('.my-table .filters-preview .filters-preview-text').first().tooltipster({
                        content: 'Нажмите для выбора фильтра',
                        position: 'bottom',
                    }),
                    $('.my-table .filters-preview .filters-preview-text').first().tooltipster({
                        content: 'Нажмите еще раз для отмены',
                        position: 'bottom',
                    }),
                    $('.my-table .filters-preview .fa-times').first().tooltipster({
                        content: 'Удаление фильтра',
                        position: 'top',
                    }),


                    //
                    // Editor
                    //
                    // $('.my-table .filter-editor').first().tooltipster({
                    //     content: $(''+
                    //         '<p>'+
                    //             'Редактирование выбранного фильтра<br />'+
                    //             'Изменения применяются автоматически<br />'+
                    //             // 'После изменения фильтра его нужно сохранить<br />'+
                    //         '</p>'),
                    //     position: 'top',
                    // }),
                    // $('.my-table .filter-editor .name').first().tooltipster({
                    //     content: 'Название фильтра',
                    //     position: 'right',
                    // }),
                    // $('.my-table .filter-editor .column-selector').first().tooltipster({
                    //     content: 'Выбор колонки',
                    //     position: 'bottom',
                    // }),
                    // $('.my-table .filter-editor .type-selector').first().tooltipster({
                    //     content: 'Тип фильтрации',
                    //     position: 'bottom',
                    // }),
                    // $('.my-table .filter-editor .value-selector').first().tooltipster({
                    //     content: 'Ввод значения',
                    //     position: 'bottom',
                    // }),
                    // $('.my-table .filter-editor .save').first().tooltipster({
                    //     content: 'После изменения фильтра его нужно сохранить',
                    //     position: 'left',
                    // }),


                    //
                    // Table
                    //
                    $('.my-table .dataTables_scroll').first().tooltipster({
                        content: 'Нажмите для сортировки',
                        position: 'top',
                    }),
                ].reverse();
            }
            _.each(_tt.steps, function(tt) {
                var current = tt[0];
                if (!current) return;
                if (_tt.visible) {
                    current.hide();
                }
                else {
                    current.show();
                }
            });
            _tt.visible = !_tt.visible;
            // if (_tt.visible) {
            //     _tt = undefined;
            // }
            // else {
            //     _tt.visible = !_tt.visible;
            // }
        }

    }

    $('body').on('click', '.tooltipster-base', function() {
        $(this).remove();
        if ($('.tooltipster-base').length === 0) {
            _tt.visible = false;
        }
    });

});
