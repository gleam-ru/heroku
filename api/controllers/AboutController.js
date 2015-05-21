/**
 * AboutController
 *
 *
 */

module.exports = {
	index: function(req, res) {
        return res.render('about', {
            title: 'О проекте',
        });
    },

    donation: function(req, res) {
        return res.render('donation', {
            title: 'Поддержите проект',
        });
    },

    thx: function(req, res) {
        return res.send('спасибо');
    },

    feedback: function(req, res) {
        return res.render('feedback', {
            title: 'Обсуждение',
        });
    },

};

