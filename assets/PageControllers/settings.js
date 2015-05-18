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
        maxWidth: 350,
    });

    $('.w-socials-item').each(function() {
        $(this).tooltipster({
            position: 'top',
        });
    });

    window.qwe = new Vue({
        el: '#edit',
        data: {
            email: '',
            uname: '',
            pwd_1: '',
            pwd_2: '',

            errors: {
                new_pwd: false,
                username: false,
                email: false,
            },
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
                vm.errors.username = (vm.uname.length < 3);
                vm.errors.new_pwd  = (vm.pwd_1.length > 0 && vm.pwd_1.length < 3) || (vm.pwd_1 !== vm.pwd_2);
                vm.errors.email    = (vm.email.length > 0) && !validator.isEmail(vm.email);
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
