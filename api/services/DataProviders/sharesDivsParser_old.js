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
        .then(me.getTickersList)
        // .then(function() {
        //     return [
        //     'alnu',
        //     'rlmn',
        //     'udmn',
        //     'gaza',
        //     ]
        // })
        .then(function(codes) {
            console.log('tickers length: ', codes.length)
            return Q.series(_.map(codes, function(code) {
                return function() {
                    return me
                        .getTicker(code)
                        // .delay(5000)
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
                            if (results.length < 1) {
                                console.debug(code);
                            }
                            return results;
                        })
                }
            }))
            .then(function(results) {
                console.error('after format: ', results.length);
                results = _.flatten(results);
                console.error('after format: ', results.length);
                return results;
            })
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
}

// получает результат парса страницы с акцией в виде:
// [{closed, year, comment, value_o, value_p}, {}, ...]
me.getTicker = function(code) {
    return Q.resolve()
        .then(function() {
            console.log('requseted url: ', donor+code.toUpperCase())
            return new Promise(function(resolve, reject) {
                request({
                    method: 'GET',
                    uri: donor+code.toUpperCase()+'/',
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
                        setTimeout(function() {
                            return resolve(response, body);
                        })
                    }
                })
            })
        })
        .then(function(response, body) {
            body = iConv.decode(response.body, 'utf-8');
            var rows = $(body).find('#content-content-inner table tr');
            var data = [];
            var result;
            for (var i = 1; i < rows.length; i++) {
                var row = $(rows[i]);
                var cells = row.find('td');
                result = undefined;

                //
                // название строки
                //
                var yearColumn = $(cells[0]);
                var stringForTesting = yearColumn.text().replace(/[\s]/g, '').toLowerCase();
                // console.log(stringForTesting)
                var tests = [
                    /^закрытиереестра(\d{1,2}\.\d{1,2}\.\d{4})(\d{4})(.*)$/gi,
                    /^закрытиереестра(\d{1,2}\.0\d{1,2}\.\d{4})(\d{4})(.*)$/gi,
                    /^()(\d{4})()$/gi,
                    /^()(\d{4})(.+квартал.*)$/gi,
                    /^закрытиереестра(\d{1,2}\.\d{1,2}\.\d{4})()(нераспределеннаяприбыльпрошлыхлет)$/gi,
                    /^закрытиереестра(\d{1,2}\.\d{1,2}\.\d{4})()(частьнераспределеннойприбыли)$/gi,
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
                        if (result.closed.match(/\d{1,2}\.0\d{1,2}\.\d{1,4}/gi)) {
                            result.closed = result.closed.replace('.0', '.');
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
                // console.log('result', result)
            }
            return data;
        })
        .then(function(parsed) {
            // console.log('prsd', parsed.length, parsed)
            return _.map(parsed, function(row) {
                var currency;
                var v_o = row && row.value_o; v_o = v_o ? String(v_o) : '';
                var v_p = row && row.value_p; v_p = v_p ? String(v_p) : '';
                // console.warn('v_o', v_o);
                // console.warn('v_p', v_p);
                // console.log(row, v_o)
                if (v_o && v_o.indexOf('руб') !== -1 || v_p && v_p.indexOf('руб') !== -1) {
                    currency = 'rub';
                }
                else if (v_o && v_o.indexOf('$') !== -1 || v_p && v_p.indexOf('$') !== -1) {
                    currency = 'usd';
                }
                else if (v_o && v_o.indexOf('€') !== -1 || v_p && v_p.indexOf('€') !== -1) {
                    currency = 'eur';
                }
                else {
                    if (v_o.indexOf('НЕ ВЫПЛАЧИВАТЬ') !== -1) {
                        v_o = undefined;
                    }
                    if (v_p.indexOf('НЕ ВЫПЛАЧИВАТЬ') !== -1) {
                        v_p = undefined;
                    }
                    if (v_o || v_p) {
                        console.warn('unknown currency:', row.value_o);
                        console.warn('unknown currency:', row);
                    }
                }
                row.value_o = myParseFloat(v_o);
                row.value_p = myParseFloat(v_p);
                row.currency = currency;
                // console.log('qweROWROW', row)
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
    num = num ? num.replace(/,/g, '.') : '';
    return parseFloat(num) || 0;
}
