/**
 * MainController
 *
 * @description :: Server-side logic for managing Mains
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index: function(req, res) {
        return res.render('index', {
            text: 'main page',
        });
    },

    test: function(req, res) {
        return res.send(''+
            '<div id="test">'+
                'чо как'+
            '</div>'+
            '')
    }
};

