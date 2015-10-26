module.exports = function (req, res, cb) {
    if (res.locals.hasRoles('shares-filler')) {
        return cb();
    }
    else {
        return res.forbidden();
    }
};
