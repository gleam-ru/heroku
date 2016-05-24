var Q = require('q');
var moment = require('moment');
var request = require('request');
var iConv = require('iconv-lite');
var $ = require('cheerio');
var me = {};
var ddf = 'DD.MM.YYYY';

/*----------------------------------------------*/

var href = 'http://www.dohod.ru/ik/analytics/dividend/';
var code = 'gazp';

var doParse = function() {
    return Q()
        .then(function() {
            return href+code;
        })
        .then(function(url) {
            return new Promise(function(resolve, reject) {
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
                console.warn('нет данных по дивидендам компании:', href);
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
                    reestrdate:     $(cells[0]).text().trim(),
                    paydate:        $(cells[1]).text().trim(),
                    value:          $(cells[2]).text().trim(),
                    profitpercent:  $(cells[3]).text().trim().replace('%', ''),
                };

                if ($(cells[0]).find('img').length) {
                    div.reestrdate_recommended = true;
                }
                if ($(cells[2]).find('img').length) {
                    div.value_recommended = true;
                }

                data.divs.push(div);
            }

            data.comment = $(body).find('#rightside-col > p').last().text().trim();

            return data;
        })
        ;
}

doParse()
    .then(function(parsed) {
        console.log(parsed);
    })
    .catch(function(err) {
        console.error(err);
    })
    ;
