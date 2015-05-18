$(document).ready(function() {


    $('.w-socials-item-link').click(function() {
        $('.content').mask();
    });

    $(document).on('submit', 'form', function() {
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

            errors: {
                pwd: false,
                username: false,
                email: false,
            }
        },
        watch: {
            uname  : function() {
                this.updateValidation();
            },
            pwd_1  : function() {
                this.updateValidation();
            },
            pwd_2  : function() {
                this.updateValidation();
            },
            email  : function() {
                this.updateValidation();
            },
            signUp : function() {
                this.updateValidation();
            },
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
                vm.updateValidation();
                return false;
            },
            updateValidation: function() {
                var vm = this;
                vm.errors.username = (vm.uname.length < 3);
                vm.errors.pwd      = (vm.pwd_1.length < 3) || (vm.pwd_1 !== vm.pwd_2);
                vm.errors.email    = !validator.isEmail(vm.email);
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
            this.updateValidation();
        },
    });
});
