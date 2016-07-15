$(".reveal-a").on('click',function() {
        var $pwd = $(".pwd-a");
        if ($pwd.attr('type') === 'password') {
            $pwd.attr('type', 'text');
        } else {
            $pwd.attr('type', 'password');
        }
    });

    $(".reveal-t").on('click',function() {
        var $pwd = $(".pwd-t");
        if ($pwd.attr('type') === 'password') {
            $pwd.attr('type', 'text');
        } else {
            $pwd.attr('type', 'password');
        }
    });
