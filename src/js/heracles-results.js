// configure angular
require(['angular', 'jquery', 'bootstrap', 'heracles-d3'], function (angular, $, b, HeraclesD3) {
        angular.element().ready(function() {
            // setup angular controller on angular ready
            angular.module('HeracleResults', []).controller('CohortViewerCtrl', function($scope, $http) {

            });

            // manually boostrap angular since using amd
            angular.bootstrap(document, ['HeracleResults']);

            // include other scripts
            require(['cohort-searcher']);
        });
    }
);
