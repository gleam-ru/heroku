/**
 * BondsController
 *
 * @description :: Server-side logic for managing Bonds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment');
moment.locale('ru');


module.exports = {
    // страница с облигациями
    index: function(req, res) {
        return res.render('bonds', {
            text: 'test',
        });
    },

    // список облигаций
    bonds: function(req, res) {
        provider.bonds.get(function(err, bonds) {
            if (err) {
                log.error(err);
                return res.send(500);
            }
            return res.send({
                data: bonds,
            });
        });
    },

    // получение сохраненных фильтров
    filters: function(req, res) {
        UserSettings.findOne({
            user: req.user ? req.user.id : 0,
            page: 'bonds',
        }, function(err, settings) {
            if (err) {
                log.error(err);
                return res.send(500);
            }
            return res.send({
                data: settings ? settings.data.filters : [],
            })
        });
    },

    // получение дополнительной информации о том, что вообще происходит :)
    additional: function(req, res) {
        async.series({
            lastUpdate: function(asyncCb) {
                Statistics.findOne({name: 'bondsUpdatedAt'}, asyncCb);
            },
            nextUpdate: function(asyncCb) {
                return asyncCb(null, {
                    data: cron.tasks.bondsParser ? cron.tasks.bondsParser.next() : undefined,
                });
            },
        }, function(err, results) {
            if (err) {
                log.error(err);
                return res.send(500);
            }
            var data = [];
            if (results && results.lastUpdate && results.nextUpdate) {
                data = [
                    {
                        text: 'Данные обновлены',
                        value: moment(results.lastUpdate.data).fromNow(),
                    },
                    {
                        text: 'Ближайшее обновление',
                        value: moment(results.nextUpdate.data).fromNow(),
                    },
                ];
            }
            return res.send({
                data: data,
            });
        });
    },



    // POST
    // обновление (сохранение/удаление) фильтра
    updateFilter: function(req, res) {
        var filter = {
            id: "0",
            text: 'Безымянный',
            conditions: [],
            visibleColumns: [],
        };
        _.extend(filter, req.body);
        // пост запрос без фильтра? нахер иди.
        if (!filter) return res.send();

        // request to find UserSettings
        var us = {
            user: req.user.id,
            page: 'bonds',
        }
        // such an idiotic API...
        UserSettings.findOrCreate(us, us, function(err, settings) {
            if (err) {
                log.error('unable findOrCreate UserSettings', err);
                return res.send(500);
            }

            var saved = settings.data;
            var filters = saved.filters || [];
            if (filter.remove) {
                // фильтр содержит запрос на удаление
                _.remove(filters, {id: filter.id})
            }
            else {
                // сохранение фильтра
                var idx = _.findIndex(filters, {id: filter.id})
                if (idx != -1) {
                    // такой фильтр уже есть
                    filters[idx] = filter;
                }
                else {
                    // добавляю новый
                    filters.push(filter);
                }
            }
            saved.filters = filters;
            settings.save(function(err) {
                if (err) {
                    log.error('filter saving error', err);
                    return res.send(500);
                }
                return res.send();
            });
        });
    },

};

