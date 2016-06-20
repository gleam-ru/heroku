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
                var nextPromice;
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
                    if (parsed.risk) {
                        found.risk = parsed.risk;
                    }
                    nextPromice = found.save();
                }
                else {
                    nextPromice = Bond
                        .create(parsed)
                }
                return nextPromice
                    .catch(function(err) {
                        if (err === 'forever_bond' || err.originalError === 'forever_bond') {
                        }
                        else if (err === 'stale_bond' || err.originalError === 'stale_bond') {
                        }
                        else {
                            console.error('save bond error', err)
                            throw err;
                        }
                        return;
                    });
            }))
        })
        .then(function(bonds) {
            console.timeEnd('saving_to_db')
            console.log('bonds updated:', bonds.length)
            return Statistics
                .findOne({name: 'bondsUpdatedAt'})
                .then(function(stat) {
                    stat.data = lastSuccess;
                    stat.save();
                    return stat;
                })
                .then(function(stat) {
                    console.log('stat updated', moment(stat.data).format(ddf));
                    return bonds;
                })
        })
        .nodeify(cb)
}





module.exports = me;
