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

// compiled jade
window.Jade = templatizer;

$(document).ready(function() {
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
    window.dateFormat = "DD.MM.YYYY";
    $.fn.dataTable.moment(dateFormat);

    // tooltipster
    $.fn.tooltipster('setDefaults', {
        theme: 'tooltipster-light'
    });
    $('.tt').each(function() {
        $(this).tooltipster({
            position: 'right',
            maxWidth: 350,
        });
    });


    $(document).on("click", ".close", function(event) {
        $(this).parent().hide();
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
