module.exports = function (req, res, cb) {
    if (req.user.access === 'admin') {
        return cb();
    }
    else {
        return res.forbidden();
    }
};
