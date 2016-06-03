var me = {
    name: 'move candles to other tables',
    // oldVersion: 0,
    // newVersion: 1,
};

me.apply = function() {
    return Q()
        .then(function() {
            return Share.find();
        })
        .then(function(shares) {
            console.log('shares found:', shares && shares.length);
            return Q.all(_.map(shares, function(share) {
                return Q()
                    .then(function() {
                        console.log('dc length', share && share.dailyCandles && share.dailyCandles.length);
                        share.dailyCandles = null;
                        return share.save();
                    })
                    .then(function() {
                        console.log('candles dropped for share:', share.name);
                    })
                    ;
            }));
        })
        ;
};


module.exports = me;
