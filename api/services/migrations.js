var migrations = require('require-all')({
    dirname:  __dirname+'/migrations',
    recursive: false,
    resolve: function(migration) {
        return migration;
    }
});

function init() {
    console.log('migrations started');
    return Q.series(_.map(migrations, function(migration, filename) {
        return function() {
            return Q()
                .then(function() {
                    if (!migration || !migration.name || !migration.apply) {
                        throw new Error('bad migration (not all required params are represented):', migration);
                    }
                    return Migration.findOne({name: migration.name});
                })
                .then(function(found) {
                    if (found) {
                        throw new Error('already applied!');
                    }
                    console.log('migration apply:', filename);
                    return migration.apply();
                })
                .then(function() {
                    console.log('migration complete:', filename);
                    return Migration.create({name: migration.name});
                })
                .catch(function(err) {
                    if (err.message === 'already applied!') {
                        return;
                    }
                    throw err;
                })
                ;
        };
    }));
}


module.exports = function(next) {
    return init().nodeify(next);
};
