window.Learning = {};
var me = window.Learning;
/**
 * Инициализация обучалки
 * config == {
 *   starter -- элемент, начинающий обучение
 *   steps   -- шаги
 * }
 *
 */
me.init = function(config) {
    config.steps = config.steps.reverse();
    _.extend(me, config);

    // инит начальной кнопки
    me.starter = me.createTT(me.starter);
    // показать тултипы
    me.starter.click(function() {
        me.createSteps();
        me.toggleSteps();
    });

    // скрывать тултип по клику,
    // изменить состояние, если все тултипы скрыты
    $('body').on('click', '.tooltipster-base', function() {
        $(this).remove();
        if ($('.tooltipster-base').length === 0) {
            me._visible = false;
        }
    });

    return me;
}

// создает ступеньки
me.createSteps = function() {
    if (!me._steps) {
        me._visible = false;
        me._steps = [];
        _.each(me.steps, function(step) {
            me._steps.push(me.createTT(step));
        });
    }
}

// показать/скрыть
me.toggleSteps = function() {
    _.each(me._steps, function(tt) {
        var current = tt[0];
        if (!current) return;
        if (me._visible) {
            current.hide();
        }
        else {
            current.show();
        }
    });
    me._visible = !me._visible;
}

// создает тултип
me.createTT = function(data) {
    var opts = {
        autoclose: false,
        trigger: 'custom',
        multiple: true,
        interactive: true,
    };

    _.extend(opts, data.tt);

    return $(data.el).first().tooltipster(opts);
}
