/**
 * SharesController
 *
 * @description :: Server-side logic for managing shares
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: function(req, res) {
        // строки для таблицы на странице
        var rows = [];
        var shares = provider.shares.all(); // {ticker: {}, ...}
        if (!shares) {
            console.warn('Возвращен пустой список акций. Вероятно какие-то проблемы с кэшем...');
        }
        // TODO: перенести это на клиент
        _.each(shares, function(s) {
            var lastCandle = s.lastCandle.c ? s.lastCandle : s.candles[s.candles.length - 1];
            rows.push({
                id     : s.id,
                ticker : s.general.ticker,
                href   : s.general.href,
                name   : s.general.name,
                code   : s.general.ticker_code || '',
                price  : lastCandle ? lastCandle.c : '',
            });
        });
        return res.render('services/shares/shares', {
            title: 'Акции',
            shares: {
                rows: rows,
            },
        });
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
                    }
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
                general : found.general || {},
                info    : {
                    mfd_id       : found.general.mfd_id,
                    candlesCount : found.candles.length,
                    lastDay      : found.candles[found.candles.length - 1].date,
                    lastCandle   : found.lastCandle,
                }
            }
        });
    },

    updateGeneral: function(req, res) {
        var id = req.param('id');
        var propEditor = req.param('propEditor');

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
            function(found, next) {
                var store = found.getStore();
                _.each(propEditor, function(prop) {
                    if (prop.key === 'ticker.general.ticker_code') {
                        store.general.ticker_code = prop.value;
                    }
                    else if (prop.key === 'ticker.general.site') {
                        store.general.site = prop.value;
                    }
                    else if (prop.key === 'ticker.general.branch') {
                        store.general.branch = prop.value;
                    }
                    else if (prop.key === 'ticker.general.forums') {
                        var forum = prop.value;

                        if (!store.general.forums) store.general.forums = {};

                        console.log('shares adminig:', store.general.name);
                        if (prop.remove) {
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
                    else if (prop.key === 'ticker.general.links') {
                        var link = prop.value;

                        if (!store.general.links) store.general.links = {};

                        console.log('shares adminig:', store.general.name);
                        if (prop.remove) {
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
                });
                found.setStore(store);
                provider.shares.cache(found);
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

