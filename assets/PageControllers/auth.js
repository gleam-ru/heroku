$(document).ready(function() {
    new Vue({
        el: '#auth',
        data: {
            signUp: window.location.href.indexOf('register') > -1,
            signUpText: 'регистрация',
            signInText: 'авторизация',
        },
        computed: {
            signIn: function() {
                return !this.signUp;
            },
        },
        methods: {
            change_vue: function() {
                $(this.$el).addClass('no-error');
                this.signUp = !this.signUp;
                var location = window.location.pathname;
                if (this.signUp) {
                    window.history.pushState('registration', 'Регистрация', location+'?register');
                }
                else {
                    window.history.pushState('auth', 'Авторизация', location);
                }
                return false;
            }
        }
    });
});
