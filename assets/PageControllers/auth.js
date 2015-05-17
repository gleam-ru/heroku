$(document).ready(function() {

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
            errors: {
                pwd: false,
                username: false,
                email: false,
            }
        },
        computed: {
            signIn: function() {
                return !this.signUp;
            },
            hasErrors: function() {
                var vm = this;
                return vm.errors.pwd || vm.errors.username || vm.errors.email;
            },
        },
        methods: {
            init: function() {
                var vm = this;
                if (vm.signUp) {
                    vm.updateValidation();
                }
            },
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
                Vue.nextTick(vm.init);
                return false;
            },
            updateValidation: function() {
                var vm = this;
                var uname = vm.$$.uname.value;
                var pwd_1 = vm.$$.pwd_1.value;
                var pwd_2 = vm.$$.pwd_2.value;
                var email = vm.$$.email.value;
                vm.errors.username = (uname.length < 3);
                vm.errors.pwd      = (pwd_1.length < 3) || (pwd_1 !== pwd_2);
                vm.errors.email    = (email.length > 0) && !validator.isEmail(email);
                console.log(vm.errors)
            },
            beforeRegister: function(e) {
                var vm = this;
                var form = vm.$$.form;
                e.preventDefault();
                if (!vm.hasErrors) {
                    $(form).submit();
                }
                else {
                    return false;
                }
            },
        },
        compiled: function() {
            this.init();
        },
    });
});
