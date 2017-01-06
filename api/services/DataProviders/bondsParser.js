var request = require('request');
var qRequest = function(params) {
    console.log('requested page: ', params.uri);
    return new Promise(function(ok, neok) {
        request(params, function(err, response, body) {
            if (err) {
                return neok(err);
            }
            else {
                return ok(response, body);
            }
        })
    })
}
var iConv = require('iconv-lite');
var $ = require('cheerio');
var sanitize = require('sanitize-html');


var donor1 = "http://www.2stocks.ru/main/invest/bonds/services/obl_prices?page=";
var donor2 = "http://bonds.finam.ru/trades/today/default.asp?resultsType=1&tradesOnly=0&close=on&bid=on&ask=on";
// var donorRisks = "http://www.ra-national.ru/ratings/raiting-emitters/risks-releases-bonds";
var donorRisks = "http://arsagera.ru/my_ne_rabotaem_s_klientom_esli_on/ne_razdelyaet_nash_podhod/prakticheskoe_primenenie_metodik1/";

var me = {}
me.isParsing = false;

/**
 * парсит сайты с облигациями,
 * возвращает {bond: {}, bond: {}}
 */
// var fs = require('fs-extra');
// var fakeParse = JSON.parse(fs.readFileSync('./parsed/test.json'));
me.parse = function(callback) {
    // var jf = require('jsonfile');
    // var data = jf.readFileSync('parsed.json');
    // callback(null, data.parsed);
    // /*
    me.isParsing = true;
    console.time('bonds_parsing')
    async.parallel({
        arsagera: function(asyncCb) {
            // {code: risk, code: risk, ...}
            // Парсим арсагеру.
            return parseArsagera(donorRisks).nodeify(asyncCb);
        },
        twoStocks: function(asyncCb) {            
            // [{}, {}]
            // получает данные из первого, многостраничного донора.
            return getTotalBondsData(donor1, [], 1, asyncCb);
        },
        finam: function(asyncCb) {
            console.log('2stocks complete');
            // [{name:'', ask:'', bid:''}, {}, ...]
            // получает недостающие данные из второго донора
            return parseDonor2(donor2, asyncCb);
        },
    }, function(err, results) {
        if (err) {
            console.error('parsing trouble (p1)!!!', err);
            console.error('parsing trouble (p2)!!!', err.stack);
            return callback(err);
        }
        console.log('finam complete');

        var arsagera = results.arsagera;
        var donor1 = results.twoStocks;
        var donor2 = results.finam;

        // добавляю поля донора_2 (bid/ask) в донора_1
        _.each(donor2, function(d2Bond) {
            var bond = _.find(donor1, {name: d2Bond.name});
            if (!bond) {
                return;
            }
            _.extend(bond, d2Bond);
            bond.risk = arsagera[bond.num] || '';
        });
        me.isParsing = false;
        console.timeEnd('bonds_parsing')
        return callback(err, donor1);
    });
    //*/
}


/**
 * Парсим арсагеру...
 * {code: risk, code: risk, ...}
 */
function parseArsagera(url) {
    var results = {};
    return Q()
        .then(function() {
            return qRequest({uri: url, encoding: null});
        })
        .then(function(response) {
            console.log('ars responded');
            var body = iConv.decode(response.body, 'cp-1251');
            var links = $(body).find('#main > div.content.work_area a');
            var link = {};
            var href = '';
            var urls = [];
            for (var i = 0; i < links.length; i++) {
                link = links[i];
                href = link.attribs.href;
                if (href && href.toLowerCase().indexOf('\/obligacii\/') !== -1) {
                    urls.push(href);
                }
            }
            return urls.reverse();
        })
        .then(function(urls) {
            return Q.series(_.map(urls, function(url) {
                return function() {
                    return qRequest({uri: url, encoding: null})
                        .then(function(response) {
                            var body = iConv.decode(response.body, 'cp-1251');
                            var headers = $(body).find('#main > div.content.work_area > h2');
                            var risk = '';
                            var tab = {};
                            for (var i = 0; i < headers.length; i++) {
                                header = $(headers[i]);
                                if (!header) {
                                    console.warn('no arsegera risk header!');
                                }
                                else if (header.text().indexOf('.1') !== -1) {
                                    risk = 'A';
                                }
                                else if (header.text().indexOf('.2') !== -1) {
                                    risk = 'B';
                                }
                                else if (header.text().indexOf('.3') !== -1) {
                                    risk = 'C';
                                }
                                else if (header.text().indexOf('.4') !== -1) {
                                    risk = 'D';
                                }
                                else if (header.text().indexOf('.5') !== -1) {
                                    risk = 'E';
                                }
                                else if (header.text().indexOf('.6') !== -1) {
                                    risk = 'F';
                                }
                                else {
                                    console.warn('unknown arsagera risk header: ', header.text());
                                }

                                tab = $(header.next());
                                if (tab) {
                                    var table = $(tab.find('table > tbody')[0]);
                                    var trs = table.find('tr');
                                    for (var j = 0; j < trs.length; j++) {
                                        var tr = $(trs[j]);
                                        results[$(tr.find('td')[0]).text()] = risk;
                                    }
                                }
                            }
                        })
                }
            }))
            .then(function() {
                return results;
            })
        })
}


/**
 * создает json облигации из списка значений
 * параметры биндинга внутри.
 */
function createBond(list) {
    var bond = {
        'name':         list[1],                   // 'Облигация'
        'num':          list[0],                   // 'Тикер'
        'lastPrice':    myParseFloat(list[2]),     // ??
        'bid':          myParseFloat(list[3]),     //
        'ask':          myParseFloat(list[4]),     //
        // 'yie':          myParseFloat(list[5]),     // 'Доходность, %'
        'cpVal':        myParseFloat(list[6]),     // 'Купон, руб.'
        'nkd':          myParseFloat(list[7]),     // 'НКД, руб.'
        'cpDur':        myParseFloat(list[8]),     // 'Длит. купона, дней'
        'cpDate':       list[9],                   // 'Дата ближ. купона'
        'rate':         myParseFloat(list[10]),    // 'Номинал, руб.'
        // 'dealLots':     myParseFloat(list[11]),    // 'Объем торгов, лот.'
        // 'dealRubs':     myParseFloat(list[12]),    // 'Объем торгов, руб.'
        // 'dealCount':    myParseFloat(list[13]),    // 'Кол-во сделок'
        'endDate':      list[14],                  // 'Дата погашения'
        'dur':          myParseFloat(list[15]),    // 'Дюрация, дней'
        'state':        list[17],                  // 'Статус' (a - торгуются, n - прекращены)
        // 'lastDeal':     list[19]                   // 'Время'
    }
    // 17.06.2015
    // наверное так делать не стоит...
    // но донор_1 (2stocks) отдает облигации, у которых
    // нет предложения/спроса, но есть цена последней сделки
    // это... странно.
    bond.bid = bond.bid || bond.lastPrice;
    bond.ask = bond.ask || bond.lastPrice;
    //
    //
    //
    return bond;
}


/**
 * парсит строку таблицы
 *
 * получает tr, отдает ["",""]
 */
function parseTableLine(line) {
    var cells = line.find('td');
    var res = [];
    cells.each(function(k, cell) {
        cell = $(cell);
        res.push(cell.text().trim());
    });
    return res;
}


/**
 * парсит страницу с облигациями
 * 2stocks.ru/main/invest/bonds/services/obl_prices
 *
 * принимает - данные страницы
 * возвращает - список json-ов облигаций [ {}, {} ]
 */
function parseBondsPage(body) {
    var bonds = [];

    var table = $(body).find('#content .main-content .content-body table');
    // иногда сайт отдает какую-то непонятную,
    // похоже что "битую" страницу.
    // на это и проверка...
    if (table.length === 0) {
        console.warn('donor-1 broken page...')
        return;
    }
    var rows = table.find('tr');

    // 0 - header, он не нужен.
    for(var i = 1; i < rows.length; i++) {
        // получаю список значений для облигации (из строки):
        var bondData = parseTableLine($(rows[i]));
        // создаю объекты-облигации из строк:
        if(bondData.length != 20) {
            console.error('Изменения на сайте-доноре!!!')
            break;
        }
        bonds.push(createBond(bondData));
    }

    return bonds;
}


/**
 * подгатавливает страницу для парсинга
 * (качает и декодирует)
 *
 * counter - количество попыток "перекачать" битую страницу
 */
function getPageBondsData(src, callback, counter) {
    request({
        uri: src,
        encoding: null,
        timeout: 1000 * 60 * 5, // 5 min
        rejectUnauthorized: false, // оно крашилось с непонятной ошибкой. Это мне подсказал великий SOW 06.01.2017
    }, function(error, response, body) {
        if (error) {
            console.log('gpbd failed');
            return callback(error);
        }
        body = iConv.decode(body, 'cp-1251');
        var bonds = parseBondsPage(body);
        if (!bonds) {
            // broken page
            var attempt = (counter || 0) + 1;
            if (attempt > 3) {
                return callback(new Error('2stocks поломался...'))
            }
            else {
                console.warn('donor-1 is trying to be requested again ('+attempt+')')
                return getPageBondsData(src, callback, attempt)
            }
        }
        return callback(error, bonds);
    });
}


/**
 * парсит все страницы с облигациями
 * (пока не закончатся данные на сайте-доноре)
 */
function getTotalBondsData(src, data, i, callback) {
    console.log('donor-1 is parsing page #'+i);
    getPageBondsData(src+i, function(err, result) {
        if (err) {
            console.error('gtbd failed');
            return callback(err);
        }
        if(result.length === 0) {
            data = _.flatten(data);
            return callback(null, data);
        }
        else {
            data.push(result);
            return getTotalBondsData(src, data, i + 1, callback);
        }
    })
}



/**
 * Получает данные из второго донора
 */
function parseDonor2(url, callback) {
    request({
        uri: donor2,
        encoding: null,
    }, function(error, response, body) {
        if(error) {
            console.error('ошибка в получении данных из донора-2');
            return callback(error);
        }
        console.log('donor-2 is parsing...');

        body = iConv.decode(body, 'cp-1251');
        // 07.10.14 - почему то в таблице ДВА tbody... я работаю с последним
        var table = $(body).find('.light tbody');
        var rows = table.find('tr');
        var bonds = [];
        for(var i = 0; i < rows.length; i++) {
            // получаю список значений для облигации (из строки):
            var bond = parseTableLine($(rows[i]));
            bonds.push({
                name: bond[0],
                ask:  myParseFloat(bond[1]),
                bid:  myParseFloat(bond[2])
            });
        }
        return callback(null, bonds);
    });
}



function myParseFloat(num) {
    num = num.replace(/,/g, '.');
    return parseFloat(num) || 0;
}





module.exports = me;
