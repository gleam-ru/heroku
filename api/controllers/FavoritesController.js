/**
 * AboutController
 *
 *
 */

module.exports = {
	index: function(req, res) {
        var data = {
            title: 'Избранное',
            nextUpdate: cron.tasks.sharesInday ? moment(cron.tasks.sharesInday.next()).fromNow() : '!!! обновление отключено !!!',
        };
        return res.render('favorites', data);
    },

};
