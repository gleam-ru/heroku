$(document).ready(function() {
    $('.w-socials-item-link').click(function() {
        $(this).closest('.providers').mask();
    });

    $('.about-attaching').tooltipster({
        content: $(''+
            '<p>'+
                'Вы можете войти, авторизируясь при помощи других сайтов (представлены ниже).'+
                '<br />'+
                'Привязка необходима для того, чтобы попадать в одну и ту же '+
                'учетную запись при авторизации через разные системы.'+
            '</p>'),
        position: 'right',
    });

    $('.w-socials-item').each(function() {
        $(this).tooltipster({
            position: 'top',
        });
    });

    window.qwe = new Vue({
        el: '#edit',
        data: {
            errors: {
                new_pwd: false,
                username: false,
                email: false,
            }
        },
        computed: {
            hasErrors: function() {
                var vm = this;
                return vm.errors.new_pwd || vm.errors.username || vm.errors.email;
            },
        },
        methods: {
            updateValidation: function() {
                var vm = this;
                var uname   = vm.$$.uname.value;
                var pwd_1   = vm.$$.pwd_1.value;
                var pwd_2   = vm.$$.pwd_2.value;
                var email   = vm.$$.email.value;
                vm.errors.username = (uname.length < 3);
                vm.errors.new_pwd  = (pwd_1.length > 0 && pwd_1.length < 3) || (pwd_1 !== pwd_2);
                vm.errors.email    = (email.length > 0) && !validator.isEmail(email);
            },
            beforeSubmit: function(e) {
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
