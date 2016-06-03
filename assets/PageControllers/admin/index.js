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




    $('#candlesupdater').click(function(e) {

        e.preventDefault();

        mp.confirm('Это ОЧЕНЬ сложная операция. Продолжить?', function() {
            $('.content').mask();

            $.post('/API/update_all_shares_candles')
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
        });

        return false;
    });



    $('#mongorestore').click(function(e) {

        e.preventDefault();

        mp.confirm('Восстановить базу из бекапа?', function() {
            $('.content').mask();
            $('#file').click();
            $('#file').change(function(e) {
                if (!$(this).val() || $(this).val() === '')
                    return;
                var uploadPath = '/adm/mongorestore';
                var data = new FormData($('#mongorestoreUploadForm')[0]);
                $.ajax({
                    url: uploadPath,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    success: function(data) {
                        mp.alert('Восстановлено!');
                        $('.content').unmask();
                    },
                    error: function(err) {
                        console.error(err);
                        mp.alert('что-то пошло не так...');
                        $('.content').unmask();
                    }
                });
            });

        });


        return false;
    });

});
