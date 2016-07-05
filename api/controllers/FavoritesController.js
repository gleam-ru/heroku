/**
 * AboutController
 *
 *
 */

module.exports = {
	index: function(req, res) {
        var data = {
            title: 'Избранное',
        };
        return res.render('favorites', data);
    },

};

