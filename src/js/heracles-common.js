

require(['domReady!', 'jquery', 'bootstrap'], function (domReady, $, b) {

    $(domReady).ready(function () {

        // initialize bootstrap data toggle
        $("body").tooltip({selector: '[data-toggle=tooltip]'});

        // focus on input box
        setTimeout(function () {
            $(".heracles-typeahead").focus();
        }, 3000);

    });
});
