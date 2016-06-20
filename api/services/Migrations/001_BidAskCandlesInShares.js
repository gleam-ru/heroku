var me = {
    name: 'remove bid/ask candles in shares',
    // oldVersion: 0,
    // newVersion: 1,
};

me.apply = function() {
    return Q()
        .then(function() {
            return new Promise(function(ok, neok) {
                // https://github.com/balderdashy/sails-mongo/issues/21#issuecomment-20765896
                return Share.native(function(err, collection) {
                    if (err) {
                        return neok(err);
                    }
                    // http://stackoverflow.com/questions/6851933/how-do-i-remove-a-field-completely-from-mongo
                    return collection.update({}, {$unset: {bid_candle:1, ask_candle:1}}, {multi: true})
                        .then(function(updated) {
                            return ok(updated);
                        })
                        .catch(function(err) {
                            return neok(err);
                        })
                        ;
                });
            });
        })
        .then(function(shares) {
            console.log('shares updated');
        })
        ;
};


module.exports = me;
