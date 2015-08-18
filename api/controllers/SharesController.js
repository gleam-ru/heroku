/**
 * SharesController
 *
 * @description :: Server-side logic for managing shares
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: function(req, res) {
        var data = {
            title: 'Акции',
            shares: {
                rows: [],
            },
        }

        // строки для таблицы на странице
        // {ticker: {}, ...}
        Q
            .nfbind(provider.shares.all)()
            .then(function(shares) {
                if (!shares) {
                    console.warn('Возвращен пустой список акций. Вероятно какие-то проблемы с кэшем...');
                }
                else {
                    // TODO: перенести это на клиент
                    _.each(shares, function(s) {
                        var lastCandle = s.lastCandle.c ? s.lastCandle : s.candles[s.candles.length - 1];
                        data.shares.rows.push({
                            id     : s.id,
                            ticker : s.general.ticker,
                            href   : s.general.href,
                            site   : s.general.site,
                            name   : s.general.name,
                            code   : s.general.ticker_code || '',
                            price  : lastCandle ? lastCandle.c : '',
                            forums : s.general.forums,
                            links  : s.general.links,
                        });
                    });
                }
            })
            .then(function() {
                res.render('services/shares/shares', data);
            })
    },

    ticker: function(req, res) {
        var href = req.param('href');
        var possible_id = parseInt(href);

        async.waterfall([
            function(next) {
                if (possible_id == href) {
                    provider.shares.get(possible_id, next);
                }
                else {
                    provider.shares.getByHref(href, next);
                }
            },
        ], function(err, ticker) {
            if (!ticker) {
                return res.render('404', {
                    msg: 'Тикер <b>'+href+'</b> не найден',
                });
            }
            else if (err) {
                return res.render('500', {
                    msg: err,
                });
            }
            else {
                return res.render('services/shares/ticker', {
                    ticker: {
                        id: ticker.id,
                        general: ticker.general || {},
                    },
                    tickerForums: _.map(ticker.general.forums, function(f) {
                        return {
                            name: f.name,
                            href: f.href,
                        }
                    }),
                    tickerLinks: _.map(ticker.general.links, function(l) {
                        return {
                            name: l.name,
                            href: l.href,
                        }
                    }),
                });
            }
        });
    },

    getTickerData: function(req, res) {
        var id = req.param('id');
        provider.shares.get(id, function(err, found) {
            if (err) {
                console.log(err);
                return res.send(500, err);
            }
            if (!found) {
                return res.send(404);
            }
            return res.send(found);
        });

    },



    //  ╔═╗╔╦╗╔╦╗╦╔╗╔
    //  ╠═╣ ║║║║║║║║║
    //  ╩ ╩═╩╝╩ ╩╩╝╚╝

    editorPage: function(req, res) {
        var id = req.param('id');
        // TODO: async
        var found = provider.shares.get(id);
        if (!found) {
            return res.render('404', {
                msg: 'Тикер <b>ID: '+id+'</b> не найден'
            });
        }
        // TODO: хранить в БД, но я не придумал как это нормально организовать
        var branches = [
            {
                id: 1,
                name: 'Нефтегаз',
            }, {
                id: 2,
                name: 'Потребительский сектор',
            }, {
                id: 3,
                name: 'Химия и нефтехимия',
            }, {
                id: 4,
                name: 'Металлургия',
            }, {
                id: 5,
                name: 'Машиностроение',
            }, {
                id: 6,
                name: 'Телекоммуникации',
            }, {
                id: 7,
                name: 'Энергетика',
            }, {
                id: 8,
                name: 'Финансы',
            }, {
                id: 9,
                name: 'Транспорт',
            }, {
                id: 10,
                name: 'Другая',
            },
        ];
        return res.render('services/shares/editor', {
            branches: branches,
            ticker: {
                id      : found.id,
                info    : {
                    mfd_id       : found.general.mfd_id,
                    candlesCount : found.candles.length,
                    lastDay      : found.candles[found.candles.length - 1].date,
                    lastCandle   : found.lastCandle,
                    indayCount   : found.indayCandles.length,
                },
                general : found.general || {},
                reports : found.reports,
            }
        });
    },

    updateGeneral: function(req, res) {
        var id = req.param('id');
        var message = req.param('message');

        async.waterfall([
            function(next) {
                Issuer.findOne({
                    id: id,
                }, function(err, found) {
                    if (err) return next(err);
                    if (!found) return next('Not found');
                    return next(null, found);
                });
            },
            function(share, next) {
                var store = share.getStore();
                if (!message.key) {
                    console.warn('SharesController.updateGeneral получено сообщение без ключа!', message);
                }
                else if (message.key === 'ticker.general.ticker_code') {
                    store.general.ticker_code = message.value;
                }
                else if (message.key === 'ticker.general.site') {
                    store.general.site = message.value;
                }
                else if (message.key === 'ticker.general.branch') {
                    store.general.branch = message.value;
                }
                else if (message.key === 'ticker.general.shares_count') {
                    store.general.shares_count = message.value;
                }
                else if (message.key === 'ticker.general.forums') {
                    var forum = message.value;
                    if (!store.general.forums) store.general.forums = {};

                    console.log('shares adminig:', store.general.name);
                    if (message.remove) {
                        delete store.general.forums[forum.id];
                        console.log('forum removed:', forum);
                    }
                    else {
                        store.general.forums[forum.id] = {
                            name: forum.key,
                            href: forum.value,
                        }
                        console.log('forum upd:', forum);
                    }
                }
                else if (message.key === 'ticker.general.links') {
                    var link = message.value;

                    if (!store.general.links) store.general.links = {};

                    console.log('shares adminig:', store.general.name);
                    if (message.remove) {
                        delete store.general.links[link.id];
                        console.log('link removed:', link);
                    }
                    else {
                        store.general.links[link.id] = {
                            name: link.key,
                            href: link.value,
                        }
                        console.log('link upd:', link);
                    }
                }
                else if (message.key === 'ticker.reports.fields') {
                    var field = message.value;

                    if (!store.reports) store.reports = {};
                    if (!store.reports.fields) store.reports.fields = [];

                    console.log('shares adminig:', store.general.name);
                    if (message.remove) {
                        var removed = _.remove(store.reports.fields, {id: field.id});
                        console.log('field removed:', removed);
                    }
                    else {
                        var found_field = _.find(store.reports.fields, {id: field.id});
                        if (!found_field) {
                            store.reports.fields.push(field);
                            console.log('field added:', field);
                        }
                        else {
                            if (found_field.key != field.key) {
                                console.log('field key modified:', found_field.key, '->', field.key);
                                _.each(store.reports.data, function(report) {
                                    report.data[field.key] = report.data[found_field.key];
                                    report.data[found_field.key] = undefined;
                                });
                                found_field.key = field.key;
                            }
                            if (found_field.value != field.value) {
                                console.log('field value modified:', found_field.value, '->', field.value);
                                found_field.value = field.value;
                            }
                        }
                    }
                }
                else if (message.key === 'ticker.reports.data') {
                    var report = message.value;

                    if (!store.reports) store.reports = {};
                    if (!store.reports.data) store.reports.data = [];

                    console.log('shares adminig:', store.general.name);
                    if (message.remove) {
                        var removed = _.remove(store.reports.data, {id: report.id});
                        console.log('report removed:', removed);
                    }
                    else {
                        var found_report = _.find(store.reports.data, {id: report.id});
                        if (!found_report) {
                            store.reports.data.push(report);
                            console.log('report added:', report);
                        }
                        else {
                            console.log('report modified');
                            console.log('old:', found_report);
                            _.extend(found_report, report);
                            console.log('new:', found_report);
                        }
                    }
                }
                share.setStore(store);
                provider.shares.cache(share);
                return next();
            }
        ], function(err) {
            if (err === 'Not found') {
                return res.send(404);
            }
            else if (err) {
                console.error(err);
                return res.send(500, err);
            }
            else {
                return res.send();
            }
        })

    },





};

