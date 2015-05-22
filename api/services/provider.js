var provider = {
    bonds: require('./DataProviders/bondsProvider.js'),
    shares: require('./DataProviders/sharesProvider.js'),
    // currencies: require('./DataProviders/currencyProvider.js'),
};

provider.init = function(cb) {
    async.series([
        provider.bonds.init,
        provider.shares.init,
        // provider.currencies.init,
    ], cb);
}

module.exports = provider;
