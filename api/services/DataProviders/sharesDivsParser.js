var Q = require('q');
var moment = require('moment');
var request = require('request');
var iConv = require('iconv-lite');
var $ = require('cheerio');
var me = {};
var ddf = 'DD.MM.YYYY';

var donor = 'http://www.dohod.ru/ik/analytics/dividend/';



// получает информацию со всего сайта-донора
me.parse = function(codes) {
    return Q()
        .then(function() {
            console.log('tickers length: ', codes.length);
            return Q.series(_.map(codes, function(code) {
                return function() {
                    return me.parseSingle(code);
                };
            }))
            .catch(function(err) {
                console.error(err);
                console.error(err.stack);
            })
            ;
        })
        .then(function(parsed) {
            return parsed;
        })
        ;
};

me.parseSingle = function(code) {
    return Q()
        .then(function() {
            return donor+code;
        })
        .then(function(url) {
            return new Promise(function(resolve, reject) {
                console.log('request for divs:', code);
                return request({
                    method: 'GET',
                    uri: url,
                    encoding: null,
                    timeout: 1000 * 60 * 5, // 5 min
                }, function(err, response, body) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        if (response.statusCode === 500) {
                            console.warn('err500 от', url);
                            return reject('err500');
                        }
                        return resolve(iConv.decode(response.body, 'utf-8'));
                    }
                });
            });
        })
        .then(function(body) {
            var table = $(body).find('.content-table').get(1);
            var rows = $(table).find('tr');

            if (!rows.length) {
                console.info('нет данных по дивидендам компании:', donor+code);
            }

            var data = {
                divs: [],
                comment: '',
            };
            for (var i = 0; i < rows.length; i++) {
                var row = $(rows[i]);
                var cells = row.find('td');

                if (cells.length === 0) {
                    continue;
                }

                var div = {
                    reestrdate:     moment($(cells[0]).text(), ddf).format(ddf),
                    paydate:        moment($(cells[1]).text(), ddf).format(ddf),
                    value:          myParseFloat($(cells[2]).text().trim()),
                    profitpercent:  myParseFloat($(cells[3]).text().trim().replace('%', '')),
                };

                if (row.hasClass('forecast')) {
                    div.is_forecast = true;
                }
                if ($(cells[0]).find('img').length) {
                    div.reestrdate_recommended = true;
                }
                if ($(cells[2]).find('img').length) {
                    div.value_recommended = true;
                }

                data.divs.push(div);
            }

            data.comment = $(body).find('#rightside-col > p').last().text().trim();



            var topTable = $(body).find('.content-table').get(0);
            var topRows = $(topTable).find('tr');
            var topDivs = [];

            for (var i = 0; i < topRows.length; i++) {
                var topRow = $(topRows[i]);
                var topCells = topRow.find('td');

                if (topCells.length === 0) {
                    continue;
                }

                if (topRow.hasClass('forecast')) {
                    continue;
                }

                var topDiv = {
                    year:           parseInt($(topCells[0]).text().trim()),
                    value:          myParseFloat($(topCells[1]).text().trim()),
                };

                topDivs.push(topDiv);
            }

            _.each(topDivs, function(topDiv) {
                var found = _.find(data.divs, function(div) {
                    return topDiv.year === moment(div.reestrdate, ddf).year();
                });
                if (found) {
                    return;
                }

                data.divs.push({
                    reestrdate     : '01.01.'+topDiv.year,
                    paydate        : '01.01.'+topDiv.year,
                    value          : topDiv.value,
                    profitpercent  : 0,
                });
            });


            return data;
        })
        .then(function(data) {
            return Share.update({code: code}, {
                divs: data.divs,
                divs_comment: data.comment,
            })
            .then(function(share) {
                return data;
            })
            ;
        })
        ;
};


module.exports = me;


function myParseFloat(num) {
    num = num ? num.replace(/,/g, '.') : '';
    return parseFloat(num) || 0;
}
