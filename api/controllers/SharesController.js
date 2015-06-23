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
        return res.render('services/shares/editor', {
            ticker: {
                id: found.id,
                general: found.general || {},
            }
        });
    },

    updateGeneral: function(req, res) {
        var id = req.param('id');
        var ticker_code = req.param('ticker_code');

        var existingInCache = provider.shares.get(id);
        Issuer.findOne({
            id: existingInCache.id,
        }, function(err, found) {
            if (err) res.send(500, err);
            if (!found) res.send(404);

            var store = found.getStore();
            store.general.ticker_code = ticker_code;
            found.setStore(store);

            provider.shares.cache(found);
            return res.send();
        })
    },





};

