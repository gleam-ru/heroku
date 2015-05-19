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

    thx: function(req, res) {
        return res.send('спасибо');
    },

    feedback: function(req, res) {
        return res.render('feedback', {});
    },

};

