var moment = require('moment');
var request = require('request');
var qs = require('querystring').stringify;
var me = {};

// cb(err, tickers)
// tickers = {ticker: {candles:[]}, ...}
me.getFromDate = function(date_start, tickers, cb) {
    date = moment(date, 'YYYY-MM-DD').format('DD.MM.YYYY');
    var url = ''+
        'http://mfd.ru/export/handler.ashx?'+qs({
            'Tickers'            : '1463,1464',
            'Period'             : '7',
            'timeframeValue'     : '1',
            'timeframeDatePart'  : 'day',
            'StartDate'          : '09.06.2015', // DD.MM.YYYY
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

    console.info('mfd req:', url);
    request({
        method: 'GET',
        uri: url,
    }, function(err, response, body) {
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
                var ticker = tickers[row['<TICKER>']];
                if (!ticker) ticker = {candles: []};
                ticker.candles.push({
                    date: moment(row['<DATE>'], 'YYYYMMDD').format('YYYY-MM-DD'),
                    o: parseFloat(row['<OPEN>']),
                    h: parseFloat(row['<HIGH>']),
                    l: parseFloat(row['<LOW>']),
                    c: parseFloat(row['<CLOSE>']),
                    vol: parseInt(row['<VOL>']),
                });
            });
            debugger;
            return cb(null, tickers);
        });
    });
}

module.exports = me;
