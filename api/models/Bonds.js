/**
* Bonds.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var moment = require('moment');
var jsonpack = require('jsonpack');

module.exports = {

    attributes: {
        // статика (приходит из парса)
        name           : {type: 'string'},
        num            : {type: 'alphanumeric'},
        rate           : {type: 'float'},
        cpVal          : {type: 'float'},
        cpDur          : {type: 'integer'},
        endDate        : {type: 'date'},
        // динамика:
        additional     : {type: 'text', defaultsTo: 'candles^^^$0|@]]'}, // {candles:[]}
        // вынес для более быстрой работы
        lastCandle     : {type: 'json'},
        // lastCandle: {
        //     // dynamic from parse
        //     bid            : bond.bid,
        //     ask            : bond.ask,
        //     nkd            : bond.nkd,
        //     cpDate         : bond.cpDate,
        //     dur            : bond.dur,
        //     state          : bond.state,
        //     // dynamic from calculations (больше места на диске, но быстрее)
        //     expiresIn      : bond.expiresIn,
        //     cpYie          : bond.cpYie,
        //     price          : bond.price,
        //     percent        : bond.percent,
        //     percentWTaxes  : bond.percentWTaxes,
        // }
        // время апдейта (чтобы быстро выловить все облиги крайнего парса)
        updatedAt      : {type: 'datetime', index: true},

        // исторические данные (дейли свечи):
        history: {type: 'text', defaultsTo: 'candles^^^$0|@]]'}, // {candles:[]}
        createDaily: function(date, next) {
            // накопленные данные (предположительно за сутки)
            var additional = jsonpack.unpack(this.additional);
            var count = additional.candles.length;
            // исторические данные (~ десятки лет)
            var history;
            if (!this.history) history = {candles: []};
            else history = jsonpack.unpack(this.history);
            // новый день, новая свеча...
            var open = additional.candles[0];
            var close = additional.candles[count - 1];
            if (count === 0) {
                console.warn('Bonds. Создание daily свечи без данных. ID:', this.id);
                return next();
            }
            if (!open || !close) {
                console.error('Bonds. Битые сохраненные данные. ID: ', this.id);
                return next();
            }
            var daily = {
                date: date,
                bid: {
                    h: open.bid,
                    l: open.bid,
                    o: open.bid,
                    c: close.bid,
                },
                ask: {
                    h: open.ask,
                    l: open.ask,
                    o: open.ask,
                    c: close.ask,
                },
                percent: {
                    h: open.percent,
                    l: open.percent,
                    o: open.percent,
                    c: close.percent,
                },
            };
            // устанавливаю макс/мин значения у дейли свечи
            _.each(additional.candles, function(candle) {
                // high
                if (candle.bid > daily.bid.h) {
                    daily.bid.h = candle.bid;
                }
                if (candle.ask > daily.ask.h) {
                    daily.ask.h = candle.ask;
                }
                if (candle.percent > daily.percent.h) {
                    daily.percent.h = candle.percent;
                }
                // low
                if (candle.bid < daily.bid.l) {
                    daily.bid.l = candle.bid;
                }
                if (candle.ask < daily.ask.l) {
                    daily.ask.l = candle.ask;
                }
                if (candle.percent < daily.percent.l) {
                    daily.percent.l = candle.percent;
                }
            });
            // удаляю дневные данные
            additional = {candles:[]};
            // сохраняю новую дейли свечу
            history.candles.push(daily);
            // пишу все обратно в базу
            this.additional = jsonpack.pack(additional);
            this.history = jsonpack.pack(history);
            return this.save(next);
        },


        // a-la push
        newData: function(bond, next) {
            var additional = jsonpack.unpack(this.additional);
            var candle = this.lastCandle;

            additional.candles.push(candle);
            this.additional = jsonpack.pack(additional);
            this.lastCandle = bond.lastCandle;
            this.updatedAt = bond.updatedAt;

            return this.save(next);
        },

        // форматирует облигацию для datatables (там все туго с форматированием :(
        getCurrent: function() {
            var bond = _.clone(this);
            // переносим свечу в тело облигации
            _.extend(bond, this.lastCandle);
            // форматируем нужные ключи
            bond.endDate = moment(bond.endDate).format('DD.MM.YYYY');
            bond.cpDate  = moment(bond.cpDate).format('DD.MM.YYYY');
            var nums = [
                'rate',
                'cpVal',
                'cpDur',
                'bid',
                'ask',
                'nkd',
                'dur',
                'expiresIn',
                'cpYie',
                'price',
                'percent',
                'percentWTaxes',
            ];
            _.each(nums, function(num) {
                bond[num] = bond[num] ? (1 * bond[num].toFixed(2)) : '';
            });

            return [
                bond.id,
                bond.name,
                bond.bid,
                bond.ask,
                bond.endDate,
                bond.expiresIn,
                1 * (bond.cpYie * 100).toFixed(2),
                bond.cpDur,
                bond.percent,
                bond.percentWTaxes,
            ];

            /*
            // Все доступные данные выглядят так:
            return {
                "id"           : bond.id,
                "name"         : bond.name,
                "num"          : bond.num,
                "rate"         : bond.rate,
                "cpVal"        : bond.cpVal,
                "cpDur"        : bond.cpDur,
                "endDate"      : bond.endDate,
                "bid"          : bond.bid,
                "ask"          : bond.ask,
                "nkd"          : bond.nkd,
                "cpDate"       : bond.cpDate,
                "state"        : bond.state,
                "expiresIn"    : bond.expiresIn,
                "cpYie"        : bond.cpYie,
                "price"        : bond.price,
                "percent"      : bond.percent,
                "percentWTaxes": bond.percentWTaxes,
            }
            //*/
        },
    },

};
