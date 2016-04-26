/**
 * BondsController
 *
 * @description :: Server-side logic for managing Bonds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    // POST
    // обновление (сохранение/удаление) фильтра
    updateUserSettings: function(req, res) {
        var msg = req.param('msg');

        var user = req.user ? req.user.id : null;
        var page = msg.page;
        var data = msg.data;

        if (!user || !page || !data) {
            console.error('data saving error (user/page/data):', user, page, data);
            return res.send(500);
        }

        // request to find UserSettings
        var us = {
            user: user,
            page: page,
        };

        UserSettings.findOrCreate(us, us, function(err, settings) {
            if (err) {
                console.error('unable findOrCreate UserSettings', err);
                return res.send(500);
            }

            settings.data = _.extend(settings.data, data);

            settings.save(function(err) {
                if (err) {
                    console.error('filter saving error', err);
                    return res.send(500);
                }
                return res.send();
            });
        });
    },

};

