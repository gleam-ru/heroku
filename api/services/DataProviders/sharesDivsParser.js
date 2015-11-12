var Q = require('q');
var moment = require('moment');
var request = require('request');
var iConv = require('iconv-lite');
var $ = require('cheerio');
var me = {};
var ddf = 'DD.MM.YYYY';

var donor = 'http://закрытияреестров.рф/';



// получает информацию со всего сайта-донора в виде:
// [{code, divs[closed, year, comment, value, currency]}, {}, ...]
me.parse = function() {
    return Q.resolve()
        // .then(me.getTickersList())
        .then(function() {
            return [
            'urka',
            'sber',
            ]
        })
        .then(function(codes) {
            return Q.all(_.map(codes, function(code) {
                return me
                    .getTicker(code)
                    .then(function(ticker) {
                        var isO = false;
                        var ticker_o = {
                            code: code,
                            divs: [],
                        };
                        var isP = false;
                        var ticker_p = {
                            code: code+'P', // это мое предположение (SBER -> SBERP)
                            divs: [],
                        };
                        _.each(ticker, function(row) {
                            if (row.value_o) {
                                isO = true;
                                var result_o = _.cloneDeep(row);
                                result_o.value = result_o.value_o;
                                delete result_o.value_o;
                                delete result_o.value_p;
                                ticker_o.divs.push(result_o);
                            }
                            if (row.value_p) {
                                isP = true;
                                var result_p = _.cloneDeep(row);
                                result_p.value = result_p.value_p;
                                delete result_p.value_o;
                                delete result_p.value_p;
                                ticker_p.divs.push(result_p);
                            }
                        })
                        var results = [];
                        if (isO) {
                            results.push(ticker_o);
                        }
                        if (isP) {
                            results.push(ticker_p);
                        }
                        return results;
                    })
            }))
            .then(function(results) {
                return _.flatten(results);
            })
            // .then(function(results) {
            //     _.each(results, function(result) {
            //         console.log(result.divs);
            //     })
            //     return results;
            // })
            .catch(function(err) {
                console.error(err);
                console.error(err.stack);
            })
        })
}


// получает список кодов акций, указанных в доноре
me.getTickersList = function() {
    console.log('sharesDivsParser getTL');
    return Q.resolve()
        .then(function() {
            return new Promise(function(resolve, reject) {
                request({
                    method: 'GET',
                    uri: donor+'_/',
                    encoding: null,
                    timeout: 1000 * 60 * 5, // 5 min
                }, function(err, response, body) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        if (response.statusCode === 500) {
                            console.warn('err500 от закрытияреестров!')
                            return reject();
                        }
                        return resolve(response, body);
                    }
                })
            })
        })
        .then(function(response, body) {
            body = iConv.decode(response.body, 'utf-8');
            var links = $(body).find('#content-content-inner a');
            var codes = [];
            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                var href = $(link).attr('href');
                if (href) {
                    codes.push(href.trim().slice(3).slice(0, -1));
                }
                else {
                    console.warn('sharesDivsParser smth went wrong!');
                }
            }
            return codes;
        })
        .then(function(codes) {
            console.log(codes);
            return codes;
        })
}

// получает результат парса страницы с акцией в виде:
// [{closed, year, comment, value_o, value_p}, {}, ...]
me.getTicker = function(code) {
    console.log('ask', code);
    return Q.resolve()
        .then(function() {
            return new Promise(function(resolve, reject) {
                request({
                    method: 'GET',
                    uri: donor+code.toUpperCase(),
                    encoding: null,
                    timeout: 1000 * 60 * 5, // 5 min
                }, function(err, response, body) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        if (response.statusCode === 500) {
                            console.warn('err500 от закрытияреестров!')
                            return reject();
                        }
                        return resolve(response, body);
                    }
                })
            })
        })
        .then(function(response, body) {
            body = iConv.decode(response.body, 'utf-8');
            var rows = $(body).find('#content-content-inner table tr');
            var data = [];
            for (var i = 1; i < rows.length; i++) {
                var row = $(rows[i]);
                var cells = row.find('td');
                var result;

                //
                // название строки
                //
                var yearColumn = $(cells[0]);
                var stringForTesting = yearColumn.text().replace(/[\s]/g, '').toLowerCase();
                var tests = [
                    /^закрытиереестра(\d{1,2}\.\d{1,2}\.\d{4})(\d{4})(.*)$/gi,
                    /^()(\d{4})()$/gi,
                    /^()(\d{4})(.+квартал.*)$/gi,
                    /^закрытиереестра(\d{1,2}\.\d{1,2}\.\d{4})()(нераспределеннаяприбыльпрошлыхлет)$/gi,
                    //gi,
                ]

                _.each(tests, function(re) {
                    var found = re.exec(stringForTesting);
                    if (found) {
                        result = {
                            closed: found[1],
                            year: found[2],
                            comment: found[3],
                        }
                        return false;
                    }
                })

                if (!result) {
                    console.debug(stringForTesting)
                    throw new Error('stringForTesting fuckup')
                }

                //
                // Value-1
                // (обычка)
                //
                var valueColumnO = $(cells[1]);
                result.value_o = valueColumnO.text().trim();

                //
                // Value-2
                // (преф)
                //
                var valueColumnP = $(cells[2]);
                result.value_p = valueColumnP.text().trim();

                data.push(result);
            }
            return data;
        })
        .then(function(parsed) {
            return _.map(parsed, function(row) {
                var currency;
                if (row.value_o.indexOf('руб') !== -1) {
                    currency = 'rub';
                }
                else if (row.value_o.indexOf('$') !== -1) {
                    currency = 'usd';
                }
                else if (row.value_o.indexOf('€') !== -1) {
                    currency = 'eur';
                }
                else {
                    console.warn('unknown currency:', row.value_o);
                }
                row.value_o = myParseFloat(row.value_o);
                row.value_p = myParseFloat(row.value_p);
                row.currency = currency;
                return row;
            })
        })
        .catch(function(err) {
            console.error(err);
            console.error(err.stack);
        })
}

module.exports = me;


function myParseFloat(num) {
    num = num.replace(/,/g, '.');
    return parseFloat(num) || 0;
}
