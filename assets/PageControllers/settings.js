$(document).ready(function() {
    $('.w-socials-item-link').click(function() {
        $('.content').mask();
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

    window.vm = new Vue({
        el: '#edit',
        data: {
            email: '',
            uname: '',
            pwd_1: '',
            pwd_2: '',
        },
        computed: {
            error_username: function() {
                return (this.uname.length < 3);
            },
            error_email: function() {
                return (this.email.length > 0) && !validator.isEmail(this.email);
            },
            error_new_pwd: function() {
                return (this.pwd_1.length > 0 && this.pwd_1.length < 3) || (this.pwd_1 !== this.pwd_2);
            },
            hasErrors: function() {
                return this.error_new_pwd || this.error_username || this.error_email;
            },
        },
        methods: {
            updateValidation: function() {
            },
            beforeSubmit: function(e) {
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
        },
        compiled: function() {
            this.updateValidation();
        },
    });

});
