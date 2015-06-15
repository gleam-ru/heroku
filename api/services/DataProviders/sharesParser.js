var moment = require('moment');
var request = require('request');
var qs = require('querystring').stringify;
var me = {};

// cb(err, tickers)
// tickers = {ticker: {candles:[]}, ...}
me.getFromDate = function(date_start, tickers, cb) {
    var url = ''+
        'http://mfd.ru/export/handler.ashx?'+qs({
            'Tickers'            : tickers.toString(),
            'Period'             : '7',
            'timeframeValue'     : '1',
            'timeframeDatePart'  : 'day',
            'StartDate'          : date_start.format('DD.MM.YYYY'),
            'EndDate'            : moment().format('DD.MM.YYYY'),
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
        if (err) return cb(err);
        if (!body) return cb('Получена пустая страница: url');

        require('csv-parse')(body, {
            delimiter: ';',
            columns: true,
            skip_empty_lines: true,
            auto_parse: false,
        },
        function(err, rows) {
            if (err) return cb(err);
            var tickers = {};
            _.each(rows, function(row) {
                var name = row['<TICKER>'];
                var ticker = tickers[name];
                if (!ticker) tickers[name] = {candles: []};
                tickers[name].candles.push({
                    date: moment(row['<DATE>'], 'YYYYMMDD').format('YYYY-MM-DD'),
                    o: parseFloat(row['<OPEN>']),
                    h: parseFloat(row['<HIGH>']),
                    l: parseFloat(row['<LOW>']),
                    c: parseFloat(row['<CLOSE>']),
                    vol: parseInt(row['<VOL>']),
                });
            });
            return cb(null, tickers);
        });
    });
}



// cb(err, [candles])
me.getTicker = function(ticker, cb) {
    var url = ''+
        'http://mfd.ru/export/handler.ashx?'+qs({
            'Tickers'            : ticker.toString(),
            'Period'             : '7',
            'timeframeValue'     : '1',
            'timeframeDatePart'  : 'day',
            'StartDate'          : moment(new Date(1900, 1, 1)).format('DD.MM.YYYY'),
            'EndDate'            : moment().format('DD.MM.YYYY'),
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
        if (err) return cb(err);
        if (!body) return cb('Получена пустая страница: url');

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
                    date: moment(row['<DATE>'], 'YYYYMMDD').format('YYYY-MM-DD'),
                    o: parseFloat(row['<OPEN>']),
                    h: parseFloat(row['<HIGH>']),
                    l: parseFloat(row['<LOW>']),
                    c: parseFloat(row['<CLOSE>']),
                    vol: parseInt(row['<VOL>']),
                });
            });
            return cb(null, candles);
        });
    });
}

module.exports = me;
