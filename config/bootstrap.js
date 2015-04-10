/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 */

module.exports.bootstrap = function(cb) {
    // Заполняем модель тестовыми данными
    if (sails.config.models.refill) {
        User.create({
            id: 1,
            username: 'admin',
            email: "admin@host.org",
            access: "admin",
        })
        .exec(function(err, user) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(user.toJSON());
            Passport.create({
                id: 1,
                protocol: 'local',
                password: 'Xa@Bk1rU',
                user: user.id,
            })
            .exec(console.log);
        });
        ;
    }

    cb();
};
