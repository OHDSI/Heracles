// configure angular
require(['angular', 'jquery', 'bootstrap', 'heracles-d3'], function (angular, $, b, HeraclesD3) {
        angular.element().ready(function() {
            // setup angular controller on angular ready
            angular.module('HeraclesResults', []).controller('CohortViewerCtrl', function($scope, $http) {
                $scope.refreshCohortVisualization = function(evt) {

                };
                
                $scope.goBack = function (evt) {
                    $(evt.target).slideUp("fast", function () {
                        $(".page-one").slideDown('fast', function () {
                            $("#cohorts").focus();
                        });
                    });
                };
            });

            // manually boostrap angular since using amd
            angular.bootstrap(document, ['HeraclesResults']);

            // include other scripts
            require(['cohort-searcher', 'heracles-common']);

            $("#cohorts-viewer-typeahead").bind('typeahead:selected', function (obj, datum, name) {
                $("#cohorts").val(datum.cohortDefinitionName);

                $(".page-one").slideUp("fast", function () {

                    // show div
                    $("#cohort-viewer-main").slideDown("slow");
                });

            });
        });
    }
);
