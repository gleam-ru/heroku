/**
 * BondsController
 *
 * @description :: Server-side logic for managing Bonds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: function(req, res) {
        return res.render('bonds', {
            text: 'test',
        });
    },

    filters: function(req, res) {
        var filters = [
            {
                name: "First filter",
                visibleColumns: [
                    'name',
                    'bid',
                    'ask',
                    'percentWTaxes',
                ],
                conditions: [
                    {
                        column: 'name',
                        type: 'contains',
                        value: 'ОФЗ',
                    }
                ],
            },
            {
                name: "One more",
                conditions: [
                    {
                        column: 'name',
                        type: 'contains',
                        value: 'тул',
                    }
                ],
            },
        ];
        return res.send({
            data: filters
        })
    },

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

    updateFilter: function(req, res) {
        var filter = req.body;
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
            if (filter.remove === true) {
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
                log.verbose('bonds filter saved', {
                    user: req.user,
                });
                return res.send();
            });
        });
    },

    bonds: function(req, res) {
        return res.send({
            data: provider.bonds.get()
        })
    },

};

