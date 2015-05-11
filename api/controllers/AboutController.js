/**
 * AboutController
 *
 *
 */

module.exports = {
	index: function(req, res) {
        return res.render('about', {});
    },

    statistics: function(req, res) {
        return res.render('statistics', {});
    },

    feedback: function(req, res) {
        return res.render('contacts', {});
    },

};

