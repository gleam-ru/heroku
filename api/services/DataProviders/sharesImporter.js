var me = {};
var type = sails.config.app.providers.shares.type;

var path   = require('path').join;
var glob   = require("glob")
var fs     = require('fs-extra');
var moment = require('moment');
var parse  = require('csv-parse');


var dir = sails.config.app.providers.shares.src;


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
                    getDataFromFile(path(dir, file), function(err, res) {
                        return next(err, res, created, issuer);
                    });
                },
                // схороняю
                function(res, created, issuer, next) {
                    if (!next) return res(); // особенности waterfall
                    created.setStore({
                        general: {
                            name: res.name,
                            ticker: issuer.path,
                        },
                        dailyCandles: res.candles,
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
            var name;
            res = _(res)
                .map(function(candle) {
                    if (parseInt(candle['<VOL>']) === 0) return;
                    name = candle['<TICKER>'];
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
            return cb(null, {
                name: name,
                candles: res
            });
        });
    });
}

module.exports = me;
