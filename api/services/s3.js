var s3 = require('s3');
var me = {};

if (!sails.config.local.s3) {
    console.warn('Отсуствует ключ для amazon_s3');
}
else {
    _.extend(sails.config.amazon.s3, sails.config.local.s3);
}

me.client = s3.createClient({
    s3Options: {
        accessKeyId: sails.config.amazon.s3.key,
        secretAccessKey: sails.config.amazon.s3.secret,
    },
});



// загружает файл на амазон
// cb(err)
me.uploadFile = function(src, cb) {
    var params = {
        localFile: src,
        s3Params: {
            Bucket: sails.config.amazon.s3.bucket,
            Key: src,
        }
    };

    var uploader = me.client.uploadFile(params);
    uploader.on('error', function(err) {
        console.error("unable to upload file:", src, err.stack);
        return cb(err);
    });
    uploader.on('end', function() {
        console.log("file uploaded to s3:", src);
        cb();
    });
}


// синхронизирует клиент с сервером (качает все файлы)
me.clientToServer = function(cb) {
    console.time('clientToServer')
    console.log('s3 clientToServer')
    if (!cb) cb = function(){};
    var params = {
        localDir: sails.config.amazon.s3.defaultDir,
        s3Params: {
            Bucket: sails.config.amazon.s3.bucket,
            Prefix: sails.config.amazon.s3.defaultDir,
        },
    };
    var uploader = me.client.uploadDir(params);
    uploader.on('error', function(err) {
        console.error("unable to sync to amazon s3:", err.stack);
        console.timeEnd('serverToClient')
        cb(err);
    });
    uploader.on('end', function() {
        console.log("s3 uploading is complete");
        console.timeEnd('clientToServer')
        cb();
    });
}

// синхронизирует клиент с сервером (качает все файлы)
me.serverToClient = function(cb) {
    console.time('serverToClient')
    console.log('s3 serverToClient')
    if (!cb) cb = function(){};
    var params = {
        localDir: sails.config.amazon.s3.defaultDir,
        s3Params: {
            Bucket: sails.config.amazon.s3.bucket,
            Prefix: sails.config.amazon.s3.defaultDir,
        },
    };
    var downloader = me.client.downloadDir(params);
    downloader.on('error', function(err) {
        console.error("unable to sync from amazon d3:", err.stack);
        console.timeEnd('serverToClient')
        cb(err);
    });
    downloader.on('end', function() {
        console.log("s3 downloading is complete");
        console.timeEnd('serverToClient')
        cb();
    });
}

module.exports = me;
