/**
 * SharesController
 *
 * @description :: Server-side logic for managing shares
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: function(req, res) {
        return res.render('services/shares', {
            title: 'test',
        });
    },

    get: function(req, res) {
        var code = req.param('code');
        var candles = provider.shares.get();
        if (!candles) {
            return res.send({
                code: code,
                name: '',
                candles: [],
                msg: 'not created yet...',
            });
        }
        return res.send({
            candles: candles,
        });
    },

};

