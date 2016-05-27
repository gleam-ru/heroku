$(document).ready(function() {

    $('#divupdater').click(function(e) {

        $('.content').mask();
        e.preventDefault();

        $.post('/API/parse_divs')
        .done(function() {
            console.log('done');
        })
        .fail(function(err) {
            console.error(err);
            mp.alert('что-то пошло не так');
        })
        .always(function() {
            $('.content').unmask();
        })
        ;

        return false;
    });

});
