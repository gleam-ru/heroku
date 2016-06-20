/**
 * Вкладка с основными данными тикера
 *
 */

module.exports = function(resolve) {
    System.importAll({
        _raw: [
        ]
    })
    .then(function() {

        return {
            template: [
                '<div>',

                    '<prop-editor',
                        'class="code"',
                        ':ph="\'код (gazp)\'"',
                        ':value.sync="code"',
                        '@save="saveCode"', // callback is needed
                        '>',
                    '</prop-editor>',

                    '<sel-editor',
                        ':ph="\'Выберите сектор\'"',
                        ':model="branches"',
                        ':selected.sync="branch"',
                        '@save="saveBranch"', // callback is needed
                        '>',
                    '</sel-editor>',

                    '<prop-editor',
                        'class="site"',
                        ':ph="\'ссылка на главную страницу сайта\'"',
                        ':value.sync="site"',
                        '@save="saveSite"', // callback is needed
                        '>',
                    '</prop-editor>',

                    Jade.els.separator(),

                    '<h4>Количество акций</h4>',
                    '<prop-editor',
                        'class="count"',
                        ':ph="\'акции, штук\'"',
                        ':value.sync="shares_count"',
                        '@save="saveShares"', // callback is needed
                        '>',
                    '</prop-editor>',

                    Jade.els.separator(),

                    '<prop-editor',
                        'class="code"',
                        ':ph="\'mfd_id\'"',
                        ':value.sync="mfd_id"',
                        '@save="saveMfdId"', // callback is needed
                        '>',
                    '</prop-editor>',

                    '<button',
                        'class="g-btn type_midnight size_small"',
                        'type="submit"',
                        '@click="updateAllCandles"',
                        '>',
                        'Обновить свечи',
                    '</button>',

                '</div>',
            ].join(' '),
            //
            //
            //
            props: [],
            data: function() {
                return {
                    //
                    rest: window.updatehref,
                    //
                    branches: branches,
                    //
                    code: ticker.code,
                    mfd_id: ticker.mfd_id,
                    branch: ticker.branch && (ticker.branch.id || ticker.branch),
                    site: ticker.site,
                    shares_count: ticker.shares_count,

                };
            },
            computed: {
            },
            //
            //
            //
            methods: {
                saveCode: function(cb) {
                    this.save({code: this.code}, cb);
                    window.ticker.code = this.code;
                },
                saveBranch: function(cb) {
                    // warn: особенности монго
                    // this.save({branch: {"$oid": this.branch}}, cb);
                    this.save({branch: {"id": this.branch}}, cb);
                },
                saveSite: function(cb) {
                    this.save({site: this.site}, cb);
                },
                saveMfdId: function(cb) {
                    this.save({mfd_id: this.mfd_id}, cb);
                },
                saveShares: function(cb) {
                    this.save({shares_count: this.shares_count}, cb);
                },

                save: function(data, next) {
                    var url = this.rest;
                    if (!url) {
                        return next('не знаю куда сохранять');
                    }
                    if (!data) {
                        return next('не знаю что сохранять');
                    }
                    $.post(url, {
                        msg: data,
                    })
                    .done(function() {
                        return next();
                    })
                    .error(function(err) {
                        return next(err);
                    });
                },

                updateAllCandles: function() {
                    var vm = this;

                    var el = $(vm.$el);
                    if (el.hasClass('disabled')) {
                        return false;
                    }
                    el.disable();

                    $.post('/services/shares/'+ticker.id+'/parse_candles')
                    .done(function(response) {
                        if (!response) {
                            mp.alert('Пустой ответ от сервера...');
                            return;
                        }
                        else {
                            mp.alert(JSON.stringify(response));
                            return;
                        }
                    })
                    .fail(function(err) {
                        console.error(err);
                        mp.alert('Что-то пошло не так');
                    })
                    .always(function() {
                        el.enable();
                    })
                    ;

                },
            },
            ready: function() {
                window.tabGeneral = this;
            },
        };
    })
    .then(resolve)
    ;
};
