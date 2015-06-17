var request = require('request');
var iConv = require('iconv-lite');
var $ = require('cheerio');


var donor1 = "http://www.2stocks.ru/main/invest/bonds/services/obl_prices?page=";
var donor2 = "http://bonds.finam.ru/trades/today/default.asp?resultsType=1&tradesOnly=0&close=on&bid=on&ask=on";
// var donorRisks = "http://www.ra-national.ru/ratings/raiting-emitters/risks-releases-bonds";


/**
 * парсит сайты с облигациями,
 * возвращает {bond: {}, bond: {}}
 */
// var fs = require('fs-extra');
// var fakeParse = JSON.parse(fs.readFileSync('./parsed/test.json'));
exports.parse = function(callback) {
    async.parallel({
        twoStocks: function(asyncCb) {
            // [{}, {}]
            // получает данные из первого, многостраничного донора.
            getTotalBondsData(donor1, [], 1, asyncCb);
        },
        finam: function(asyncCb) {
            // [{name:'', ask:'', bid:''}, {}, ...]
            // получает недостающие данные из второго донора
            parseDonor2(donor2, asyncCb);
        },
    }, function(err, results) {
        if(err) return callback(err);

        var donor1 = results.twoStocks;
        var donor2 = results.finam;

        // добавляю поля донора_2 (bid/ask) в донора_1
        _.each(donor2, function(d2Bond) {
            var bond = _.find(donor1, {name: d2Bond.name});
            _.extend(bond, d2Bond);
        });

        return callback(err, donor1);
    });
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
        // 'dur':          myParseFloat(list[15]),    // 'Дюрация, дней'
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
 */
function getPageBondsData(src, callback) {
    request({
        uri: src,
        encoding: null
    }, function(error, response, body) {
        var bonds = [];
        if(error) return callback(error);

        body = iConv.decode(body, 'cp-1251');
        bonds = parseBondsPage(body);
        return callback(error, bonds);
    });
}


/**
 * парсит все страницы с облигациями
 * (пока не закончатся данные на сайте-доноре)
 */
function getTotalBondsData(src, data, i, callback) {
    console.log('Parsing page #'+i);
    getPageBondsData(src+i, function(err, result) {
        if(err) return callback(err);
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
        encoding: null
    }, function(error, response, body) {
        if(error) {
            console.error('ошибка в получении данных из донора-2');
            return callback(error);
        }
        console.log('Donor-2 is parsing...');

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
    return isNaN(num) ? "" : parseFloat(num);
}
