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
                id: s.id,
                ticker: s.general.ticker,
                mfd_id: s.general.mfd_id,
                href: s.general.href,
                name: s.general.name,
                price: lastCandle ? lastCandle.c : '',
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
        var mfd_id = req.param('mfd_id');
        var data = provider.shares.get(mfd_id);
        if (!data) {
            return res.render('404', {
                msg: 'Тикер <b>'+mfd_id+'</b> не найден'
            });
        }
        return res.render('services/shares/ticker', {
            ticker: {
                id: data.id,
                general: data.general || {},
            }
        });
    },

    editorPage: function(req, res) {
        var mfd_id = req.param('mfd_id');
        var data = provider.shares.get(mfd_id);
        if (!data) {
            return res.render('404', {
                msg: 'Тикер <b>'+mfd_id+'</b> не найден'
            });
        }
        return res.render('services/shares/editor', {
            ticker: {
                id: data.id,
                general: data.general || {},
            }
        });
    },


    getTickerData: function(req, res) {
        var mfd_id = req.param('mfd_id');
        var data = provider.shares.get(mfd_id);
        if (!data) {
            return res.send(404);
        }
        return res.send(data);
    },

};

