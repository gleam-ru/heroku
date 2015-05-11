/**
 * SettingsController
 *
 * Страничка с настройками пользователя:
 *   - смена своих данный
 *   - привязка других регистраций
 *
 */

module.exports = {
    index: function(req, res) {
        return res.render('settings', {});
    }
};
