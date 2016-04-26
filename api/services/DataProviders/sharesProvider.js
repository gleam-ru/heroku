var importer = require('./sharesImporter.js');
var me = {};


me.init = function(cb) {
    Q.resolve()
        // импорт отсутствующих эмитентов (есть в конфиге, но нет в базе)
        // или тех эмитентов, у которых более 4 месяцев пропущенных свечей
        .then(function() {
            return Q.ninvoke(importer, 'process')
        })
        // кэширую все
        .then(function() {
            return me.cacheAll();
        })
        .nodeify(cb)
}

// начальное кэширование
me.cacheAll = function(shares) {
    console.log('shares:cache')
    return me.dropCached()
        .then(function() {
            if (shares) {
                return shares;
            }
            else {
                return Share.find({
                    where: {
                        dead: false,
                    },
                    select: [
                        'id',
                        'name',
                        'code',
                        'site',
                        'forums',
                        'links',
                        'lastCandle',
                        'indayCandle',
                    ],
                })
            }
        })
        .then(function(shares) {
            return me.createSharesTableCache(shares);
        })
}

// кэширует акцию
me.cache = function(share) {
    if (share) {
        if (share.id) {
            cache.set('share_by_id_'+share.id, share);
        }
        if (share.code) {
            cache.set('share_by_code_'+share.code, share);
        }
    }
    return share;
}

// дроп закешированных "одиночек"
me.dropCached = function() {
    console.log('shares:dropCached');
    return Q.resolve()
        .then(function() {
            var dropped = [];
            _.each(cache.keys(), function(key) {
                if (key.indexOf('share_by_id_') !== -1 || key.indexOf('share_by_code_') !== -1) {
                    dropped.push(key);
                    cache.del(key);
                }
            })
            return dropped;
        })
}

// обновляет inday свечи
me.updateIndayCandles = function() {
    return Q.resolve()
        .then(function() {
            return importer.updateIndayCandles();
        })
        .then(function() {
            return me.cacheAll();
        })
}



// получает всех эмитентов из бд
me.getAllFromDB = function() {
    console.log('shares:getAllFromDB')
    return Q.resolve()
        .then(function() {
            return [];
            // return Share.find({dead: false}).populateAll();
            // return Share
            //     .find({dead: false})
            //     .prune(['dailyCandles'])
            //     .populateAll();
            return Share.find({
                    where: {
                        dead: false,
                    },
                    // select: ['reports'],
                })
        })
}

// получает акцию по айдишнику
// если нет в кэше - база+кэш+return
me.getById = function(id) {
    console.log('shares:getById', id)
    return Q.resolve()
        .then(function() {
            var alreadyInCache = cache.get('share_by_id_'+id);
            if (alreadyInCache) {
                return alreadyInCache;
            }
            else {
                return Q.resolve()
                    .then(function() {
                        console.log('shares:getById:fromDB', id)
                        return Share.findOne({id: id}).populateAll();
                    })
                    .then(function(share) {
                        cache.set('share_by_id_'+id, share);
                        return share;
                    })
            }
        })
}

// получает акцию по коду
// если нет в кэше - база+кэш+return
me.getByCode = function(code) {
    console.log('shares:getByCode', code)
    return Q.resolve()
        .then(function() {
            var alreadyInCache = cache.get('share_by_code_'+code);
            if (alreadyInCache) {
                return alreadyInCache;
            }
            else {
                return Q.resolve()
                    .then(function() {
                        console.log('shares:getByCode:fromDB', code)
                        return Share.findOne({code: code}).populateAll();
                    })
                    .then(function(share) {
                        cache.set('share_by_code_'+code, share);
                        return share;
                    })
            }
        })
}






// кэш для таблички сервисы/акции
me.createSharesTableCache = function(shares) {
    console.log('shares:createSharesTableCache')
    return Q.resolve()
        .then(function() {
            if (shares) {
                return shares;
            }
            else {
                return me.getAllFromDB();
            }
        })
        .then(function(shares) {
            var toCache = _.map(shares, function(s) {
                return {
                    id        : s.id,
                    name      : s.name,
                    code      : s.code || '',
                    href      : s.code || s.id,
                    site      : s.site,
                    price     : s.indayCandle ? s.indayCandle.c : '',
                    yesterday : s.lastCandle ? s.lastCandle.c : '',
                    forums    : s.forums,
                    links     : s.links,
                }
            });
            cache.set('all_shares_table', toCache);
            console.log('shares:createSharesTableCache_finished', toCache.length)
            return toCache;
        })
}

// получает данные для таблицы сервисы/акции
me.getSharesTable = function() {
    console.log('shares:getSharesTable')
    return Q.resolve()
        .then(function() {
            var cached = cache.get('all_shares_table');
            if (cached) {
                return cached;
            }
            else {
                console.warn('shares:getSharesTable:createSharesTableCache - обновляю не по расписанию')
                return me.createSharesTableCache();
            }
        })
}






module.exports = me;
