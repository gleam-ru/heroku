var provider = {
    bonds: require('./DataProviders/bondsProvider.js'),
    shares: require('./DataProviders/sharesProvider.js'),
    // currencies: require('./DataProviders/currencyProvider.js'),
};

provider.init = function(cb) {
    console.log('provider init')
    async.series([
        provider.bonds.init,
        provider.shares.init,
        // provider.currencies.init,
        s3.clientToServer,
    ], cb);
}

module.exports = provider;
