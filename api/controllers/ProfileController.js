/**
 * ProfileController
 *
 * @description :: Server-side logic for managing tests
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index: function(req, res) {
        return res.render('profile', {
            text: 'test',
        });
    }
};
