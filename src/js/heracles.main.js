/**
 * Created by cahilton on 2/4/15.
 */

require(['domReady!', 'jquery', 'bootstrap'], function (domReady, $, b) {

    $(domReady).ready(function () {
        // go back listener on cohort explorer
        $("#cohort-explorer-back").click(function () {
            $("#cohort-explorer-main").slideUp("fast", function () {
                $(".page-one").slideDown('fast', function () {
                    setTimeout(function () {
                        $("#cohorts-typeahead").focus();
                    }, 3000);
                });
            });
        });

        // initialize bootstrap data toggle
        $("body").tooltip({selector: '[data-toggle=tooltip]'});

        // focus on input box
        setTimeout(function () {
            $("#cohorts-typeahead").focus();
        }, 3000);
    });


});
