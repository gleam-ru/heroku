var me = {};
var type = sails.config.app.providers.shares.type;

var path   = require('path').join;
var glob   = require("glob")
var fs     = require('fs-extra');
var moment = require('moment');
var parse  = require('csv-parse');


var dir = sails.config.app.providers.shares.src;

// cb(err, res)
// TODO: deprecated
me.provideData = function(cb) {
    getDataFromFile(path(dir, 'GAZP.txt'), cb);
}


// заполняет базу, если она не заполнена
me.process = function(cb) {
    glob('*.txt', {
        cwd: dir,
    },
    function(err, files) {
        // получены файлы из указанной директории
        if (err) return cb(err);

        function iterator(file, itCb) {
            async.waterfall([
                // посмотреть, есть ли такой эмитент в базе
                function(next) {
                    // так выглядит эмитент в базе,
                    // если он уже был создан
                    var issuer = {
                        type: type,
                        path: file.slice(0, -4).toLowerCase()
                    };
                    Issuer.count(issuer, function(err, count) {
                        return next(err, count, issuer);
                    });
                },
                // если нет - создаем
                function(count, issuer, next) {
                    if (count > 0) return next();
                    Issuer.create(issuer, function(err, created) {
                        return next(err, created, issuer);
                    });
                },
                // получаем данные для эмитента из файла
                function(created, issuer, next) {
                    if (!next) return created(); // особенности waterfall
                    getDataFromFile(path(dir, file), function(err, candles) {
                        return next(err, candles, created, issuer);
                    });
                },
                // схороняю
                function(candles, created, issuer, next) {
                    if (!next) return candles(); // особенности waterfall
                    created.setStore({
                        general: {
                            ticker: issuer.path,
                        },
                        dailyCandles: candles,
                        indayCandles: [],
                        lastCandle: {},
                    });
                    created.save(next);
                }
            ], itCb);
        }

        async.eachSeries(files, iterator, cb);
    });
}

// читает файл, форматирует его как надо, отдает отформатированные данные
// cb(err, res)
// res == []
function getDataFromFile(src, cb) {
    fs.readFile(src, function(err, data) {
        if (err) return cb(err);
        parse(data, {
            delimiter: '	',
            columns: true,
            skip_empty_lines: true,
            auto_parse: false,
        },
        function(err, res) {
            if (err) return cb(err);
            res = _(res)
                .map(function(candle) {
                    if (parseInt(candle['<VOL>']) === 0) return;
                    return {
                        date: moment(candle['<DATE>'], 'YYYYMMDD').format('YYYY-MM-DD'),
                        o: parseFloat(candle['<OPEN>']),
                        h: parseFloat(candle['<HIGH>']),
                        l: parseFloat(candle['<LOW>']),
                        c: parseFloat(candle['<CLOSE>']),
                        vol: parseInt(candle['<VOL>']),
                    }
                })
                .compact()
                .value();
            return cb(null, res);
        });
    });
}

module.exports = me;
