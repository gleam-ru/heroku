/**
 * BondsController
 *
 * @description :: Server-side logic for managing Bonds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    // страница с облигациями
    index: function(req, res) {
        return res.render('bonds', {
            text: 'test',
        });
    },

    // список облигаций
    bonds: function(req, res) {
        return res.send({
            data: provider.bonds.get()
        })
    },

    // получение сохраненных фильтров
    filters: function(req, res) {
        UserSettings.findOne({
            user: req.user.id,
            page: 'bonds',
        }, function(err, settings) {
            if (err) {
                log.error(err);
                return res.send(500);
            }
            var saved = settings ? settings.data.filters : {};
            var filters = [];
            _.forOwn(saved, function(v, key) {
                filters.push(saved[key]);
            });
            return res.send({
                data: filters,
            })
        });
    },

    // получение дополнительной информации о том, что вообще происходит :)
    additional: function(req, res) {
        var additional = [
            {
                name: 'Данные обновлены',
                value: '14 минут назад',
            },
            {
                name: 'Ближайшее обновление',
                value: 'через 30 минут',
            },
        ];
        return res.send({
            data: additional
        })
    },



    // POST
    // обновление (сохранение/удаление) фильтра
    updateFilter: function(req, res) {
        var filter = {
            name: 'Безымянный',
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
            var filters = saved.filters || {};
            if (filter.remove) {
                delete filters[filter.name];
            }
            else {
                filters[filter.name] = filter;
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

