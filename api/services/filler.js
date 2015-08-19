var me = {};

me.process = function(cb) {
    Q.all([
        _statistics(),
        _admin(),
        // _bond_JamesBond(),
    ])
    .nodeify(cb)
}


function _bond_JamesBond(next) {
    var now = moment().format('DD.MM.YYYY');
    return Q.resolve()
        .then(function() {
            return Bond
                .findOrCreate({id: 1111}, {
                    id          : 1111,
                    name        : "Мосэнерго2",
                    num         : "RU000A0GN9B5",
                    rate        : 1000,
                    cpVal       : 41.14,
                    cpDur       : 182,
                    endDate     : now,

                    bid         : 101,
                    ask         : 99,
                    nkd         : 39.55,
                    state       : "A",
                    cpDate      : now,
                    expiresIn   : 188,

                    bid_candle  : {
                        o: 1,
                        h: 2,
                        l: 3,
                        c: 4,
                        d: now
                    },
                    ask_candle  : {
                        o: 11,
                        h: 22,
                        l: 33,
                        c: 44,
                        d: now
                    },
                    indayCandles: [],
                    dailyCandles: [],
                })
        })
        .nodeify(next)
}

function _admin(next) {
    return Q.resolve()
        .then(function() {
            return User
                .findOrCreate({username: 'admin'}, {
                    username: 'admin',
                    email: "admin@host.org",
                    access: "admin",
                })
        })
        .then(function(user) {
            return Passport
                .findOrCreate({user: user.id}, {
                    user: user.id,
                    strategy: 'local',
                    password: 'Xa@Bk1rU',
                })
        })
        .nodeify(next)
}



function _statistics(next) {
    return Q.resolve()
        .then(function() {
            return Statistics
                .findOrCreate({
                    name: 'bondsUpdatedAt',
                }, {
                    name: 'bondsUpdatedAt',
                })
        })
        .nodeify(next)

}

module.exports = me;
