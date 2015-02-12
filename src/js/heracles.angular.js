// configure angular
require(['angular', 'jquery', 'bootstrap', 'heracles-d3'], function (angular, $, b, HeraclesD3) {
        angular.element().ready(function() {
            // setup angular controller on angular ready
            angular.module('Heracles', []).controller('CohortExplorerCtrl', function($scope, $http) {

                $scope.job = {};
                $scope.message = {};

                $scope.showCohort = function(datum) {
                    $scope.selected = datum;
                    //$http.get('src/data/sample-cohort-explorer.json')
                    $http.get(getWebApiUrl() + "/cohortanalysis/" + datum.COHORT_DEFINITION_ID + "/summary")
                        .then(function(res){
                            $scope.cohort = res.data;

                            if (res.data.ANALYSES) {
                                var map = {};
                                $.each(res.data.ANALYSES, function() {
                                    var prettifyAnalysisType = this.ANALYSIS_TYPE.split("_").join(" ");
                                    if (!map[prettifyAnalysisType]) {
                                        map[prettifyAnalysisType] = [];
                                    }
                                    this.CLASS = +this.ANALYSIS_COMPLETE ? "analysis-complete" : "analysis-open";
                                    map[prettifyAnalysisType].push(this);
                                });
                                $scope.cohort.ANALYSES_MAP = map;

                            }
                            if ($scope.cohort.AGE_DISTRIBUTION !== null && $scope.cohort.AGE_DISTRIBUTION.length > 0) {
                                HeraclesD3.showAgeDistribution($scope.cohort.AGE_DISTRIBUTION);
                            }
                            if ($scope.cohort.GENDER_DISTRIBUTION !== null && $scope.cohort.GENDER_DISTRIBUTION.length > 0) {
                                HeraclesD3.showGenderDistribution($scope.cohort.GENDER_DISTRIBUTION);
                            }
                        });
                };

                $scope.refreshCohort = function() {
                    if ($scope.selected) {
                        $("input:checkbox").prop("checked", false);
                        $("#auto-filter-input").val("");
                        $("#auto-filter-div").find("label").show();
                        $scope.showCohort($scope.selected);
                    }
                };

                $scope.submitJob = function($event) {
                    if ($(".toggle-checkbox-item:checked").length === 0) {
                        $scope.message.text = "Please select at least one Analysis to run.";
                        $scope.message.label = "Error submitting Analysis";
                        $("#messageModal").modal('show');
                        return;
                    }

                    var btn = $(event.currentTarget);
                    btn.button('loading');
                    var cohortJob = {};
                    cohortJob.SMALL_CELL_COUNT = "1";
                    cohortJob.COHORT_DEFINITION_IDS = [];
                    cohortJob.COHORT_DEFINITION_IDS.push($scope.cohort.COHORT_DEFINITION.COHORT_DEFINITION_ID);
                    cohortJob.ANALYSIS_IDS = [];
                    $(".toggle-checkbox-item:checked").each(function () {
                        cohortJob.ANALYSIS_IDS.push($(this).attr("analysis-id"));
                    });
                    cohortJob.RUN_HERACLES_HEEL = false;
                    // TODO
                    cohortJob.CONDITION_CONCEPT_IDS = [];
                    cohortJob.DRUG_CONCEPT_IDS = [];
                    cohortJob.PROCEDURE_CONCEPT_IDS = [];
                    cohortJob.OBSERVATION_CONCEPT_IDS = [];
                    cohortJob.MEASUREMENT_CONCEPT_IDS = [];
                    $http.post(getWebApiUrl() + "/cohortanalysis", cohortJob).
                        success(function(data, status, headers, config) {
                            btn.button('reset');
                            showJobResultModal(true, data, status, headers, config);
                        }).
                        error(function(data, status, headers, config) {
                            btn.button('reset');
                            showJobResultModal(false, data, status, headers, config);
                        });
                };

                function showJobResultModal(success, data, status, headers, config) {
                    $scope.job = {};
                    $scope.job.success = success;
                    if (success) {
                       $scope.job.label = "Success";
                       $scope.job.message = "Your job was submitted successfully!";
                        if (data.jobInstance) {
                            $scope.job.job_link = getWebApiUrl() + "/job/" + data.jobInstance.instanceId +
                                "/execution/" + data.executionId;
                        }
                    } else {
                        $scope.job.label = "Failure";
                        $scope.job.message = "Your job failed.";
                    }
                    $("#jobStatusModal").modal("show");
                }

                $scope.parentAnalysesClick = function($event) {
                    var parent = $(event.currentTarget);
                    var key = parent.attr("key");
                    var checked = parent.find("input:checkbox").prop("checked");
                    $("input[parent='" + key + "']:visible").prop("checked", checked);
                };


            });

            // manually boostrap angular since using amd
            angular.bootstrap(document, ['Heracles']);

            // include other scripts
            require(['cohort-searcher', 'auto-filter-box', 'heracles.main']);
        });
    }
);
