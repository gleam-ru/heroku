var parser = require('./bondsParser.js');
var me = {};

me.process = function(cb) {
    async.waterfall([
        parser.parse,
        me.saveBonds,
    ], cb);
}


// сохраняет облигации в базу
// (нет - создаст, есть - обновит)
me.saveBonds = function(parsedBonds, cb) {
    console.time('saving_to_db')
    var lastSuccess = new Date();
    console.info('parsed bonds are saving into DB...')
    Q.resolve()
        .then(function() {
            var parsed_nums = _.map(parsedBonds, 'num');
            return Bond.find({num: parsed_nums})
        })
        .then(function(bonds) {
            return Q.all(_.map(parsedBonds, function(parsed) {
                var found = _.find(bonds, {num: parsed.num, name: parsed.name})
                if (found) {
                    _.extend(found, {
                        bid       : parsed.bid || 0,
                        ask       : parsed.ask || 0,
                        cpVal     : parsed.cpVal || 0,
                        nkd       : parsed.nkd || 0,
                        cpDur     : parsed.cpDur || 0,
                        cpDate    : parsed.cpDate,
                        endDate   : parsed.endDate,
                        state     : parsed.state,
                        expiresIn : parsed.dur,
                    });
                    return found.save();
                }
                else {
                    return Bond
                        .create(parsed)
                        .catch(function(err) {
                            console.warn('im here')
                            console.warn(err)
                            if (err.originalError === 'forever_bond') {
                                console.warn('forever_bond', parsed.num);
                            }
                            else if (err.originalError === 'stale_bond') {
                                console.warn('stale_bond', parsed.num);
                            }
                            else {
                                console.error('save bond error', err)
                                throw err;
                            }
                        });
                }
            }))
        })
        .then(function(bonds) {
            console.timeEnd('saving_to_db')
            console.log('bonds updated:', bonds.length)
            return Statistics
                .findOne({name: 'bondsUpdatedAt'})
                .then(function(stat) {
                    stat.data = lastSuccess;
                    return stat.save();
                })
                .then(function(stat) {
                    console.log('stat updated', moment(stat.data).format('DD.MM.YYYY'));
                    return bonds;
                })
        })
        .nodeify(cb)
}





module.exports = me;
