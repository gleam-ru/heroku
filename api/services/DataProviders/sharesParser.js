var moment = require('moment');
var request = require('request');
var qs = require('querystring').stringify;
var me = {};
var ddf = 'DD.MM.YYYY';

var query = {
    'Tickers'            : '',
    'Period'             : '7',
    'timeframeValue'     : '1',
    'timeframeDatePart'  : 'day',
    'StartDate'          : moment().format(ddf),
    'EndDate'            : moment().format(ddf),
    // .subtract(1, 'day').format(ddf)
    'SaveFormat'         : '0',
    'SaveMode'           : '0',
    'FileName'           : '_',
    'FieldSeparator'     : ';',
    'DecimalSeparator'   : '.',
    'DateFormat'         : 'yyyyMMdd',
    'TimeFormat'         : 'HHmmss',
    'AddHeader'          : 'true',
    'RecordFormat'       : '0',
    'Fill'               : 'true',
}

// парс крайнего дня тикеров
me.getInday = function(tickers, cb) {
    // При таймфрейме меньше дня можно запрашивать информацию по не более чем 30 инструментам.
    // mfd (c)
    var max_tickers = 30;
    var ranges = _.chunk(tickers, max_tickers);

    // тут будут все тикеры после парса
    var parsed_tickers = {};

    function iterator(range, next) {
        // подготовка ссылки
        var url = ''+
            'http://mfd.ru/export/handler.ashx?'+qs(_.extend({}, query, {
                'Period'  : '5', // 30 min
                'Tickers' : range.toString(),
            }));
        // запрос на сервер
        request({
            method: 'GET',
            uri: url,
        }, function(err, response, body) {
            console.info('inday candles mfd req:', url);
            if (err) return next(err);
            if (response.statusCode === 500) {
                console.warn('err500 от mfd!')
                return next(null, [])
            }
            if (!body) {
                console.warn('Получена пустая страница (mfd 15m)')
                return next(null, []);
            }
            // разбираю полученную цсв-шку
            require('csv-parse')(body, {
                delimiter: ';',
                columns: true,
                skip_empty_lines: true,
                auto_parse: false,
            },
            function(err, rows) {
                if (err) return next(err);
                _.each(rows, function(row) {
                    var name = row['<TICKER>'];
                    var ticker = parsed_tickers[name];
                    if (!ticker) {
                        parsed_tickers[name] = {candles: []};
                    }
                    parsed_tickers[name].candles.push({
                        d: moment(row['<DATE>'], 'YYYYMMDD').format(ddf),
                        o: parseFloat(row['<OPEN>']),
                        h: parseFloat(row['<HIGH>']),
                        l: parseFloat(row['<LOW>']),
                        c: parseFloat(row['<CLOSE>']),
                        v: parseInt(row['<VOL>']) || 0,
                    });
                });
                return next();
            });
        });
    }

    async.each(ranges, iterator, function(err) {
        // console.log('qwe', _.keys(parsed_tickers))
        return cb(err, parsed_tickers);
    });
}


// cb(err, tickers)
// tickers = {ticker: {candles:[]}, ...}
me.getByDate = function(date_start, tickers, cb) {
    // много тикеров -> слишком длинный запрос -> невозможно получить данные
    var max_tickers = 200;
    var req_count = tickers.length / max_tickers;
    var ranges = [];
    for (var i = 0; i < req_count; i++) {
        var range_from = i * max_tickers;
        var range_to   = (i + 1) * max_tickers;
        var range = tickers.slice(range_from, range_to);
        ranges.push(range);
    }

    // тут будут все тикеры после парса
    var parsed_tickers = {};

    function iterator(range, next) {
        // подготовка ссылки
        var url = ''+
            'http://mfd.ru/export/handler.ashx?'+qs(_.extend({}, query, {
                'Tickers'            : range.toString(),
                'StartDate'          : date_start.format(ddf),
            }));
        // запрос на сервер
        request({
            method: 'GET',
            uri: url,
        }, function(err, response, body) {
            console.info('mfd req:', url);
            if (err) return next(err);
            if (response.statusCode === 500) {
                console.warn('err500 от mfd!')
                return next(null, [])
            }
            if (!body) {
                console.warn('Получена пустая страница')
                return next(null, []);
            }
            // разбираю полученную цсв-шку
            require('csv-parse')(body, {
                delimiter: ';',
                columns: true,
                skip_empty_lines: true,
                auto_parse: false,
            },
            function(err, rows) {
                if (err) return next(err);
                _.each(rows, function(row) {
                    var name = row['<TICKER>'];
                    var ticker = parsed_tickers[name];
                    if (!ticker) parsed_tickers[name] = {candles: []};
                    parsed_tickers[name].candles.push({
                        d: moment(row['<DATE>'], 'YYYYMMDD').format(ddf),
                        o: parseFloat(row['<OPEN>']),
                        h: parseFloat(row['<HIGH>']),
                        l: parseFloat(row['<LOW>']),
                        c: parseFloat(row['<CLOSE>']),
                        v: parseInt(row['<VOL>']) || 0,
                    });
                });
                return next();
            });
        });
    }

    async.each(ranges, iterator, function(err) {
        return cb(err, parsed_tickers);
    });

}



// cb(err, [candles])
// banned - смотри описание в sails.config.app.providers.shares.possibleBanTimeout
me.getTicker = function(ticker, cb, banned) {
    var url = ''+
        'http://mfd.ru/export/handler.ashx?'+qs({
            'Tickers'            : ticker.toString(),
            'Period'             : '7',
            'timeframeValue'     : '1',
            'timeframeDatePart'  : 'day',
            'StartDate'          : moment(new Date(1900, 1, 1)).format(ddf),
            'EndDate'            : moment().format(ddf),
            'SaveFormat'         : '0',
            'SaveMode'           : '0',
            'FileName'           : '_',
            'FieldSeparator'     : ';',
            'DecimalSeparator'   : '.',
            'DateFormat'         : 'yyyyMMdd',
            'TimeFormat'         : 'HHmmss',
            'AddHeader'          : 'true',
            'RecordFormat'       : '0',
            'Fill'               : 'true',
        });
    request({
        method: 'GET',
        uri: url,
    }, function(err, response, body) {
        console.info('mfd req:', url);
        if (err) {
            if (banned) {
                return cb(err);
            }
            else {
                return setTimeout(function() {
                    me.getTicker(ticker, cb, true);
                }, sails.config.app.providers.shares.possibleBanTimeout)
            }
        }
        if (response.statusCode === 500) {
            console.warn('err500 от mfd!')
            return cb(null, [])
        }
        if (!body) {
            console.warn('Получена пустая страница')
            return cb(null, []);
        }

        require('csv-parse')(body, {
            delimiter: ';',
            columns: true,
            skip_empty_lines: true,
            auto_parse: false,
        },
        function(err, rows) {
            if (err) return cb(err);
            var candles = [];
            _.each(rows, function(row) {
                candles.push({
                    d: moment(row['<DATE>'], 'YYYYMMDD').format(ddf),
                    o: parseFloat(row['<OPEN>']),
                    h: parseFloat(row['<HIGH>']),
                    l: parseFloat(row['<LOW>']),
                    c: parseFloat(row['<CLOSE>']),
                    v: parseInt(row['<VOL>']) || 0,
                });
            });
            return cb(null, candles);
        });
    });
}

module.exports = me;
