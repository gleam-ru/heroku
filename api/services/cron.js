var later = require("later");

var cron = {};
cron.tasks = {};

cron.add = function(name, pattern, foo) {
    var s = later.parse.cron(pattern);
    var schedule = {
        s: s,
        timer: later.setInterval(foo, s),
        go: function() {
            foo();
        },
        stop: function() {
            this.timer.clear();
        },
        next: function(count) {
            return later.schedule(this.s).next(count);
        },
    }
    cron.tasks[name] = schedule;

    return schedule;
}

cron.init = function() {
    // UTC TIME!!!
    // http://www.corntab.com/pages/crontab-gui
    cron.add('bondsParser', '5,35 7,8,9,10,11,12,13,14,15,16 * * 1,2,3,4,5', function() {
        provider.bonds.update();
    });
}

module.exports = cron;