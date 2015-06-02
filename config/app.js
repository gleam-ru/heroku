/**
 * Мой конфиг-свалка
 * для всего и сразу
 *
 */

module.exports.app = {
    dataDir: '.data',

    providers: {
        bonds: {
            type: 'bond', // Issuer.type
            cache: 'bonds',
        },
        shares: {
            src: '_shares', // папка, откуда будут импортироваться
            type: 'share', // Issuer.type
            cache: 'shares',
        }
    }
};
