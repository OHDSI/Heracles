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
        'heracles-d3' : 'heracles-d3'
    },
    priority: [
        "angular"
    ]
});

// configure angular
require(['angular', 'jquery', 'bootstrap', 'heracles-d3'], function (angular, $, b, HeraclesD3) {
        angular.element().ready(function() {
            // bootstrap the app manually
            angular.module('Heracles', []).controller('CohortExplorerCtrl', function($scope, $http) {
                $scope.showCohort = function(datum) {
                    $http.get('src/data/sample-cohort-explorer.json')
                        .then(function(res){
                            res.data.completed_cohorts = {};
                            res.data.new_cohorts = {};
                            $.each(res.data.analyses, function() {
                                if (this.done === true) {
                                    if (!res.data.completed_cohorts[this.category]) {
                                        res.data.completed_cohorts[this.category] = [];
                                    }
                                    res.data.completed_cohorts[this.category].push(this);
                                } else {
                                    if (!res.data.new_cohorts[this.category]) {
                                        res.data.new_cohorts[this.category] = [];
                                    }
                                    res.data.new_cohorts[this.category].push(this);
                                }
                            });
                            $scope.cohort = res.data;
                            HeraclesD3.showAgeDistribution(res.data.age_distribution)
                            HeraclesD3.showGenderDistribution(res.data.gender_distribution);
                        });
                };
            });
            angular.bootstrap(document, ['Heracles']);
            require(['cohort-searcher', 'auto-filter-box', 'heracles.main']);
        });
    }
);

