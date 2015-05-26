$(document).ready(function() {


    $('.w-socials-item-link').click(function() {
        $('.content').mask();
    });

    $('.w-socials-item').each(function() {
        $(this).tooltipster({
            position: 'top',
        });
    });


    window.qwe = new Vue({
        el: '#auth',
        data: {
            signUp: window.location.href.indexOf('register') > -1,
            signUpText: 'регистрация',
            signInText: 'авторизация',

            uname: '',
            pwd_1: '',
            pwd_2: '',
            email: '',
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
            change_vue: function() {
                var vm = this;
                $(vm.$el).addClass('no-error');
                vm.signUp = !vm.signUp;
                var location = window.location.pathname;
                if (vm.signUp) {
                    window.history.pushState('registration', 'Регистрация', location+'?register');
                }
                else {
                    window.history.pushState('auth', 'Авторизация', location);
                }
                return false;
            },
            beforeRegister: function(e) {
                var vm = this;
                var form = vm.$$.form;
                e.preventDefault();
                if (!vm.hasErrors) {
                    $('.content').mask();
                    $(form).submit();
                }
                else {
                    return false;
                }
            },
            beforeLogIn: function() {
                $('.content').mask();
            },
        },
    });
});
