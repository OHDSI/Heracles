// configure angular
require(['angular', 'jquery', 'bootstrap', 'heracles-d3'], function (angular, $, b, HeraclesD3) {
        angular.element().ready(function() {
            // bootstrap the app manually
            angular.module('Heracles', []).controller('CohortExplorerCtrl', function($scope, $http) {

                $scope.showCohort = function(datum) {
                    //$http.get('src/data/sample-cohort-explorer.json')
                    $http.get(getWebApiUrl() + "/cohortanalysis/" + datum.COHORT_DEFINITION_ID + "/summary")
                        .then(function(res){
                            $scope.cohort = res.data;
                            if (res.data.GENDER_DISTRIBUTION) {
                                $.each(res.data.GENDER_DISTRIBUTION, function() {
                                    if (this.CONCEPT_NAME === "FEMALE") {
                                        $scope.cohort.PERCENT_FEMALE = Math.round((+this.NUM_PERSONS/+res.data.TOTAL_PATIENTS) * 100);
                                    }
                                });
                            } else {
                                $scope.cohort.PERCENT_FEMALE = null;
                            }
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
                            //        HeraclesD3.showAgeDistribution(res.data.age_distribution)
                            //        HeraclesD3.showGenderDistribution(res.data.gender_distribution);
                        });
                };

                $scope.submitJob = function($event) {
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
                            showJobModal(true, data, status, headers, config);
                        }).
                        error(function(data, status, headers, config) {
                            btn.button('reset');
                            showJobModal(false, data, status, headers, config);
                        });
                }

                function showJobModal(success, data, status, headers, config) {
                    $scope.job = {};
                    if (success) {
                       $scope.job.label = "Success";
                       $scope.job.message = "Your job was submitted successfully!";
                        if (data.jobInstance) {
                            $scope.job.job_link = getWebApiUrl() + "/job/" + data.jobInstance.instanceId +
                                "/execution/" + data.executionId;
                        }
                    } else {
                        // TODO
                    }
                    $("#jobStatusModal").modal("show");
                }
            });
            angular.bootstrap(document, ['Heracles']);
            require(['cohort-searcher', 'auto-filter-box', 'heracles.main']);
        });
    }
);
