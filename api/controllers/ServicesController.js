/**
 * ServicesController
 *
 * Страничка с описанием сервисов
 * Просто для "однотипности"
 *
 */

module.exports = {
	index: function(req, res) {
        return res.render('services', {});
    }
};
