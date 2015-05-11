$(document).ready(function() {
    // compiled jade
    window.Jade = templatizer;

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

    // disable interface parts
    $.fn.mask = function(state) {
        if(state === undefined || state) {
            // add mask
            var mask = $("<div id='mask'><img src='/img/loading.gif' /></div>");
            if (this.find('#mask').length > 0) return;
            this.append(mask);
        }
        else {
            // remove mask
            this.find('#mask').fadeOut(500, function(){ $(this).remove();});
        }
    }

    // magnific popups
    window.popups = {};
    // замена стандартному алерту
    window.popups.alert = function(html) {
        var popup = $('<div></div>');
        popup.addClass('white-popup');
        popup.append('<h4>Внимание!</h4>');
        popup.append(html);

        $.magnificPopup.open({
            items: {
                src: popup,
                type: 'inline'
            },
        });
    }
    // замена стандартному confirm
    // window.popups.alert = function(html, cb) {
    //     var popup = $('<div></div>');
    //     popup.addClass('white-popup');
    //     popup.append($(html));

    //     $.magnificPopup.open({
    //         items: {
    //             src: popup,
    //             type: 'inline'
    //         },
    //     });
    // }

});
