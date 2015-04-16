var provider = {};

// в перспективе
// provider.share = require('./DataProviders/shareProvider.js');
// provider.currency = require('./DataProviders/currencyProvider.js');


provider.init = function(cb) {
    provider.bonds = require('./DataProviders/bondsProvider.js');
    provider.bonds.init(cb);
}


module.exports = provider;
