var s3 = require('s3');
var me = {};

me.getClient = function() {
    if (!me.client) {
        me.client = s3.createClient({
            s3Options: {
                accessKeyId: sails.config.amazon.s3.key,
                secretAccessKey: sails.config.amazon.s3.secret,
            },
        });
    }
    console.error(sails.config.amazon.s3)
    return me.client;
}



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

    var uploader = me.getClient().uploadFile(params);
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
    if (!cb) cb = function(){};
    var params = {
        localDir: sails.config.amazon.s3.defaultDir,
        s3Params: {
            Bucket: sails.config.amazon.s3.bucket,
            Prefix: sails.config.amazon.s3.defaultDir,
        },
    };
    var uploader = me.getClient().uploadDir(params);
    uploader.on('error', function(err) {
        console.error("unable to sync to amazon s3:", err.stack);
        cb(err);
    });
    uploader.on('end', function() {
        console.log("s3 uploading is complete");
        cb();
    });
}

// синхронизирует клиент с сервером (качает все файлы)
me.serverToClient = function(cb) {
    if (!cb) cb = function(){};
    var params = {
        localDir: sails.config.amazon.s3.defaultDir,
        s3Params: {
            Bucket: sails.config.amazon.s3.bucket,
            Prefix: sails.config.amazon.s3.defaultDir,
        },
    };
    var downloader = me.getClient().downloadDir(params);
    downloader.on('error', function(err) {
        console.error("unable to sync from amazon d3:", err.stack);
        cb(err);
    });
    downloader.on('end', function() {
        console.log("s3 downloading is complete");
        cb();
    });
}

module.exports = me;
