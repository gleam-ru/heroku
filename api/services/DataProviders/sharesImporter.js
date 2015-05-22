var me = {};

var moment = require('moment');
var fs = require('fs-extra');
var parse = require('csv-parse');

var dir = '_shares';
var file = dir+'/GAZP.txt';

// cb(err, res)
me.provideData = function(cb) {
    var data = fs.readFileSync(file);
    parse(data, {
        delimiter: '	',
        columns: true,
        skip_empty_lines: true,
        auto_parse: false,
    },
    function(err, res) {
        if (err) {
            console.error(err);
            return cb(err);
        }
        res = _.map(res, function(candle) {
            return {
                date: moment(candle['<DATE>'], 'YYYYMMDD'),
                o: parseFloat(candle['<OPEN>']),
                h: parseFloat(candle['<HIGH>']),
                l: parseFloat(candle['<LOW>']),
                c: parseFloat(candle['<CLOSE>']),
                vol: parseInt(candle['<VOL>']),
            }
        });
        console.info('gazp:', res.length);
        return cb(err, {
            code: 'GAZP',
            name: 'ГАЗПРОМ ао',
            candles: res,
        });
    });
}

module.exports = me;
