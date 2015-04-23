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

    current: function(req, res) {
        return res.send(provider.bonds.get());
    },

    datatable: function(req, res) {
        return res.send({
            data: provider.bonds.get()
        })
        // var page = req.query.page;
        // var perPage = req.query.perPage;
        // Bonds.find().paginate({page: page, limit: perPage}).exec(function(err, bonds) {
        //     if (err) {
        //         console.error(err);
        //         bonds = [];
        //     }
        //     return res.send({
        //         "data": bonds
        //     });
        // });
    },

};

