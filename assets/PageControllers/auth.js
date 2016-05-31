$(document).ready(function() {


    $('.w-socials-item-link').click(function() {
        $('.content').mask();
    });

    $('.w-socials-item').each(function() {
        $(this).tooltipster({
            position: 'top',
        });
    });



    System.importAll({
        vtabs : '/Components/Tabs.js',
        // components:
            // sel     : '/PageControllers/sharesTickerEditor/sel-editor.js',
        // tabs:
            // chart : '/PageControllers/sharesTicker/tab-chart.js',
            // div   : '/PageControllers/sharesTicker/tab-div.js',
        _raw: [
            // '/bower_components/d3/d3.js',
        ]
    })
    .then(function(imported) {

        var tabRegister = function(resolve) {
            // el =
            return resolve({
                template: document.querySelector('#registering').outerHTML,
                data: function() {
                    return {
                        uname: '',
                        pwd_1: '',
                        pwd_2: '',
                        email: '',
                    };
                },
                computed: {
                    signIn: function() {
                        return !this.signUp;
                    },
                    error_pwd: function() {
                        return (this.pwd_1.length < 3) || (this.pwd_1 !== this.pwd_2);
                    },
                    error_username: function() {
                        return (this.uname.length < 3);
                    },
                    error_email: function() {
                        return !validator.isEmail(this.email);
                    },
                    hasErrors: function() {
                        return this.error_pwd || this.error_username || this.error_email;
                    },
                },
                methods: {
                    beforeRegister: function(e) {
                        var vm = this;
                        var form = vm.$els.form;
                        e.preventDefault();
                        if (!vm.hasErrors) {
                            $('.content').mask();
                            $(form).submit();
                        }
                        else {
                            return false;
                        }
                    },
                },

            });
        };

        var tabAuth = function(resolve) {
            return resolve({
                template: document.querySelector('#authentication').outerHTML,
                data: function() {
                    return {
                    };
                },
                computed: {
                },
                methods: {
                    beforeLogIn: function() {
                        $('.content').mask();
                    },
                },

            });
        };


        window.App = new Vue({
            el: '#auth',
            components: {
                'v-tabs': imported.vtabs,
            },
            template: [
                '<div>',
                    '<v-tabs :tabs="tabs" :separator="false" :storeroute="true"></v-tabs>',
                '</div>',
            ].join(' '),
            data: function() {
                return {
                    tabs: [
                        {url: '/register', cmp: tabRegister, title: 'Регистрация'},
                        {url: '/auth',     cmp: tabAuth,     title: 'Авторизация'},
                    ],
                };
            },
        });

    })
    .catch(function(err) {
        console.error(err);
        mp.alert('Что-то пошло не так!');
    })
    ;
});
