/**
 * Created by cahilton on 2/3/15.
 */

require.config({
    shim : {
        "bootstrap" : { "deps" :['jquery'] }
    },
    paths: {
        jquery: '../../lib/jquery/jquery',
        angular: '../../lib/angular/angular',
        bootstrap: '../../lib/bootstrap/bootstrap',
        d3: '../../lib/d3/d3',
        handlebars: '../../lib/handlebars/handlebars',
        'jquery-ui': '../../lib/jquery-ui/jquery-ui',
        requirejs: '../../lib/requirejs/require',
        typeahead: '../../lib/typeahead.js/typeahead.bundle.js',
        'domReady':'../../lib/requirejs/domReady'
    },
    packages: [

    ]
});

require(['domReady!','jquery','bootstrap'],function(domReady,$,b){

    domReady(function () {
        // go back listener on cohort explorer
        $("#cohort-explorer-back").click(function() {
            $("#cohort-explorer-main").slideUp("fast", function() {
                $(".page-one").slideDown('fast', function() {
                    setTimeout(function(){
                        $("#cohorts-typeahead").focus();
                    }, 3000);
                });
            });
        });

        // initialize bootstrap data toggle
        $("body").tooltip({ selector:'[data-toggle=tooltip]' });

        // focus on input box
        setTimeout(function(){
            $("#cohorts-typeahead").focus();
        }, 3000);
    });
});

