/**
 * AboutController
 *
 *
 */

module.exports = {
	index: function(req, res) {
        return res.render('about', {});
    },

    donation: function(req, res) {
        return res.render('donation', {});
    },

    feedback: function(req, res) {
        return res.render('feedback', {});
    },

};

