$(document).ready(function() {
    $('#save').click(function() {
        var data = {
            message: {
                id: userid,
                type: 'userrole',
                value: $('#roles').val(),
            },
        }
        $('.content').mask();
        $.post('/adm/users', data)
        .done(function() {
        })
        .fail(function(err) {
            console.error(err);
            mp.alert('что-то пошло не так');
        })
        .always(function() {
            $('.content').unmask();
        })
    })

});
