/**
 * MainController
 *
 * @description :: Server-side logic for managing Mains
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index: function(req, res) {
        return res.redirect('/bonds');
        return res.render('index', {
            text: 'main page',
        });
    }
};

