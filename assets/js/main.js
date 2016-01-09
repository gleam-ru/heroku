// compiled jade
window.Jade = templatizer;

// удаляю trailing slashes
window.href = window.location.pathname.replace(/\/$/, "");

// datatables localization
window.datatables_localization = {
    "processing": "Подождите...",
    "search": "",
    "searchPlaceholder": "Поиск в таблице",
    "lengthMenu": "_MENU_",
    "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
    "infoEmpty": "Записи с 0 до 0 из 0 записей",
    "infoFiltered": "(отфильтровано из _MAX_ записей)",
    "infoPostFix": "",
    "loadingRecords": "Загрузка записей...",
    "zeroRecords": "Записи отсутствуют.",
    "emptyTable:": "В таблице отсутствуют данные",
    "paginate": {
        "first": "Первая",
        "previous": "<",
        "next": ">",
        "last": "Последняя"
    },
    "aria": {
        "sortAscending": ": активировать для сортировки столбца по возрастанию",
        "sortDescending": ": активировать для сортировки столбца по убыванию"
    }
}

// стандартные сообщения
window.messages = {
    issue: ''+
        '<p>Пожалуйста, опишите проблему <a href="/about/feedback">здесь</a>.</p>'+
        '',
    auth: ''+
        '<p>Для данного действия необходимо <br />'+
            '<a href="/auth?register">зарегистрироваться</a> или <br />'+
            '<a href="/auth">войти в систему</a>.'+
        '</p>'+
        '',
    not_implemented: ''+
        '<p>Извините, данная возможность пока не реализована</p>'+
        '',
}

window.hasRoles = function(roleNames) {
    var ok = false;
    if (!Array.isArray(roleNames)) {
        roleNames = [roleNames]
    }
    _.each(roleNames, function(roleName) {
        if (_.find(window.user ? window.user.roles : [], {name: roleName})) {
            ok = true;
            return false;
        }
    })
    return ok;
}

$(document).ready(function() {
    // lodash
    _.mixin({
        sortByValues: function(collection, values) {
            var first = [];
            _.each(values, function(v) {
                var idx = collection.indexOf(v);
                if (idx !== -1) {
                    first.push(_.pullAt(collection, idx));
                }
            })
            return first.concat(collection);
        }
    });

    // pickmeup
    var locale = {
        days:        ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        daysShort:   ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        daysMin:     ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        months:      ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    }
    $.pickmeup.format = "d-m-Y";
    $.pickmeup.position = "top";
    $.pickmeup.view = "years";
    $.pickmeup.hide_on_select = true;
    $.pickmeup.locale = locale;



    // datatables
    window.dateFormat = ddf;
    $.fn.dataTable.moment(dateFormat);
    $.fn.dataTable.ext.pager.numbers_length = 5;


    // tooltipster
    $.fn.tooltipster('setDefaults', {
        theme: 'tooltipster-light'
    });
    window.initTT = function() {
        $('.tt').each(function() {
            var el = $(this);
            var opts = {};
            opts.position = 'bottom';
            opts.maxWidth = 350;

            if (el.hasClass('tt_interactive')) {
                opts.interactive = true;
                opts.interactiveTolerance = 100;
            }
            if (el.hasClass('tt_html')) {
                opts.contentAsHTML = true;
            }

            el.tooltipster(opts);
        });
    }
    initTT();




    // g-alert (req.flash сообщения)
    $(document).on("click", ".g-alert-close", function() {
        $(this).closest('.g-alert').hide();
    });



    // disable interface parts
    $.fn.mask = function(state) {
        if(state === undefined || state) {
            // add mask
            var mask = $("<div id='mask'><img src='/img/loading.png'/></div>");
            if (this.find('#mask').length > 0) return;
            this.append(mask);
        }
        else {
            // remove mask
            this.find('#mask').fadeOut(500, function(){ $(this).remove();});
        }
    }
    $.fn.unmask = function() {
        this.mask(false);
    }
    $.fn.disable = function(state) {
        if(state === undefined || state) {
            // disable
            this.addClass('disabled');
        }
        else {
            this.removeClass('disabled');
        }

    }
    $.fn.enable = function() {
        this.disable(false);
    }



    // уведомление об результате действия
    // state - true/false (success/fail)
    // cb - cb.
    $.fn.done = function(state, cb) {
        var el = this;
        if (typeof cb !== 'function') cb = function() {};
        var mask;
        if(state) {
            mask = $("<div id='done'><img src='/img/success.png' /></div>");
        }
        else {
            mask = $("<div id='done'><img src='/img/fail.png' /></div>");
        }
        if (el.find('#done').length > 0) return;
        el.append(mask);
        setTimeout(function() {
            el.find('#done').fadeOut(200, function(){ $(this).remove();});
            cb();
        }, 300);
    }



    // magnific popups
    window.mp = {};
    // замена стандартному алерту
    window.mp.alert = function(html) {
        var popup = $('<div></div>');
        popup.addClass('white-popup');
        // popup.append('<h3>Внимание!</h3>');
        popup.append(html);

        $.magnificPopup.open({
            items: {
                src: popup,
                type: 'inline'
            },
        });
    }
    // замена стандартному confirm
    window.mp.confirm = function(html, cb) {
        var popup = $('<div></div>');
        popup.addClass('white-popup');
        popup.append('<h3>Требуется подтверждение!</h3>');
        popup.append(html);

        var btns = $('<div class="row"></div>');
            var ok = $(Jade.els.button('OK'));
                ok.bind('click', function() {
                    cb();
                    $.magnificPopup.close();
                });
            var cancel = $(Jade.els.button('Отмена'));
                cancel.bind('click', function() {
                    $.magnificPopup.close();
                });
            btns.append(ok);
            btns.append(cancel);
        popup.append(btns);

        $.magnificPopup.open({
            items: {
                src: popup,
                type: 'inline'
            },
            modal: true,
        });
    }

});
