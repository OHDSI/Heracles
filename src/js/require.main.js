/**
 * Created by cahilton on 2/4/15.
 */
require.config({
    baseUrl: "src/js",
    shim : {
        'angular' : {'exports' : 'angular'},
        "bootstrap" : { "deps" :['jquery'] },
        "handlebars" : { "deps" :['jquery'] },
        "typeahead" : { "deps" :['jquery'] },
        "heracles-d3" : { "deps" : ['jquery', 'd3']}

    },
    paths: {
        jquery: '../../lib/jquery/jquery',
        angular: '../../lib/angular/angular',
        bootstrap: '../../lib/bootstrap/bootstrap',
        d3: '../../lib/d3/d3',
        handlebars: '../../lib/handlebars/handlebars',
        'jquery-ui': '../../lib/jquery-ui/jquery-ui',
        requirejs: '../../lib/requirejs/require',
        typeahead: '../../lib/typeahead.js/typeahead.bundle',
        'domReady':'../../lib/requirejs/plugins/domReady',
        'lodash' : '../../lib/lodash/lodash',
        'monster' : '../../lib/cookie-monster/cookie-monster',
        'heracles-d3' : 'heracles-d3',
        'd3.chart' : '../../lib/d3/d3.chart.js',
        'd3.tip' : '../../lib/d3/d3.tip.js',
        'jnj.chart' : '../../lib/ohdsi/jnj.chart.js'
    },
    priority: [
        "angular"
    ]
});


