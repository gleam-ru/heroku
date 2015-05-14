var me = {};

// пакует всю собранную информацию в дейли свечу.
me.bondsNewDay = function(done) {
    if (typeof done !== 'function') done = function() {};
    var date = new Date();
    provider.bonds.fetchFromDB(function(err, bonds) {
        function iterator(bond, cb) {
            return bond.createDaily(date, cb);
        }
        async.eachSeries(bonds, iterator, function(err) {
            if (err) console.error(err);
            else console.info('Bonds: created', bonds.length, 'daily candles');
            return done(err);
        });
    });
}

module.exports = me;
