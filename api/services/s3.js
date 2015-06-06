var s3 = require('s3');
var me = {};

me.client = s3.createClient({
    s3Options: {
        accessKeyId: "AKIAJC6YHEIGLL5BQR6A",
        secretAccessKey: "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",
    },
});

me.getParams = function() {
    return {
        localDir: ".data",
        s3Params: {
            Bucket: "blozhikheroku2",
            Prefix: ".data",
        },
    }
}


// синхронизирует клиент с сервером (качает все файлы)
me.clientToServer = function(cb) {
    var params = me.getParams();
    var uploader = me.client.uploadDir(params);
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
    var params = me.getParams();
    var downloader = me.client.downloadDir(params);
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
