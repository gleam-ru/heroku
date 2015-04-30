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
            {
                name: "And more...",
                conditions: [],
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

    bonds: function(req, res) {
        return res.send({
            data: provider.bonds.get()
        })
    },

};

