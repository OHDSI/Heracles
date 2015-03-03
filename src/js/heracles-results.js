// configure angular
require(['angular', 'jquery', 'bootstrap', 'heracles-d3', 'jasny', '../js/charts/dashboard'],
    function (angular, $, b, HeraclesD3, j, DashboardRenderer) {
        var renderers = {
            'dashboard' : DashboardRenderer
        };
        angular.element().ready(function() {
            // setup angular controller on angular ready
            var app = angular.module('HeraclesResults', []);
            app.service('CohortService', function() {
                this.cohort = {};

                this.setCohort = function(c) {
                    this.cohort = c;
                };
                this.getCohort = function() {
                    return this.cohort;
                };
            });

            app.controller('CohortViewerCtrl', function($scope, $http, CohortService) {


                $scope.refreshCommonData = function(){

                };

                $scope.refreshCohortVisualization = function(evt) {
                    // TODO
                };
                
                $scope.goBack = function (evt) {
                    $("#viewer-container").slideUp("fast", function () {
                        $("#searcher-container").slideDown('fast', function () {
                            $("#cohorts").focus();
                        });
                    });
                };

                // include other scripts
                require(['cohort-searcher', 'heracles-common']);

                $(".chartTypes").click(function () {
                    var self = $(this);
                    $(".active").removeClass("active");
                    self.parent("li").addClass("active");

                    var id = $(this).attr("id");
                    $scope.active = id;
                    $scope.template = 'src/templates/' + id + '.html';
                    $scope.$apply();

                    var renderer = renderers[id];
                    if (renderer) {
                        renderer.render(CohortService.getCohort());
                    }
                });

                $("#cohorts-viewer-typeahead").bind('typeahead:selected', function (obj, datum, name) {
                    $("#cohorts").val(datum.cohortDefinitionName);
                    $scope.cohort = datum;
                    CohortService.setCohort(datum);

                    $("#searcher-container").slideUp("fast", function () {

                        // show default div
                        $("#viewer-container").slideDown("slow");
                        $("#dashboard").trigger("click");
                        $scope.$apply();
                    });
                });
            });

            // manually boostrap angular since using amd
            angular.bootstrap(document, ['HeraclesResults']);

        });

        $(document).ready(function() {
            setTimeout(function() {
                $("#cohorts").focus();
            }, 300);
        });
    }
);
