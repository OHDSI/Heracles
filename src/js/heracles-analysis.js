// configure angular
require(['angular', 'jquery', 'bootstrap', 'heracles-d3'], function (angular, $, b, HeraclesD3) {
        angular.element().ready(function() {
            // setup angular controller on angular ready
            angular.module('HeraclesAnalysis', []).controller('CohortExplorerCtrl', function($scope, $http) {

                $scope.job = {};
                $scope.message = {};

                $scope.showCohort = function(datum) {
                    $scope.selected = datum;
                    //$http.get('src/data/sample-cohort-explorer.json')
                    $http.get(getWebApiUrl() + "/cohortanalysis/" + datum.cohortDefinitionId + "/summary")
                        .then(function(res){
                            $scope.cohort = res.data;

                            if (res.data.analyses) {
                                var map = {};
                                $.each(res.data.analyses, function() {
                                    var prettifyAnalysisType = this.analysisType.split("_").join(" ");
                                    if (!map[prettifyAnalysisType]) {
                                        map[prettifyAnalysisType] = [];
                                    }
                                    this.class = +this.analysisComplete ? "analysis-complete" : "analysis-open";
                                    map[prettifyAnalysisType].push(this);
                                });
                                $scope.cohort.analysesMap = map;

                            }
                            if ($scope.cohort.meanAge !== null) {
                                $scope.cohort.meanAge = Math.round(+$scope.cohort.meanAge);
                            }
                            if ($scope.cohort.ageDistribution !== null && $scope.cohort.ageDistribution.length > 0) {
                                HeraclesD3.showAgeDistribution($scope.cohort.ageDistribution);
                            }
                            if ($scope.cohort.genderDistribution !== null && $scope.cohort.genderDistribution.length > 0) {
                                HeraclesD3.showGenderDistribution($scope.cohort.genderDistribution);
                            }
                        });
                };

                $scope.refreshCohort = function($event) {
                    var link = $(event.target);
                    if (link.prop('disabled')) {
                        return;
                    }
                    if ($scope.selected) {
                        link.text("Refreshing...");
                        link.prop('disabled', true);
                        $("input:checkbox").prop("checked", false);
                        $(".toggle-filter-input").val("");
                        $("#auto-filter-input").val("");
                        $("#auto-filter-div").find("label").show();
                        $scope.showCohort($scope.selected);
                        setTimeout(function() {
                            link.text("Refresh");
                            link.prop('disabled', false);
                        }, 1500);
                    }
                };

                $scope.submitJob = function($event) {
                    if ($(".toggle-checkbox-item:checked").length === 0) {
                        $scope.message.text = "Please select at least one Analysis to run.";
                        $scope.message.label = "Error submitting Analysis";
                        $("#messageModal").modal('show');
                        return;
                    }
                    // send notice to user
                    var btn = $(event.currentTarget);
                    btn.button('loading');
                    $scope.job.job_link = null;
                    $scope.job.label = "Submitting...";
                    $scope.job.message = "Your job is being submitted. Please wait to receive a status update...";
                    if (!$("#jobStatusModal").is(":visible")) {
                        $("#jobStatusModal").modal("show");
                    }

                    // submit job
                    var cohortJob = {};
                    cohortJob.smallCellCount = "1";
                    cohortJob.cohortDefinitionIds = [];
                    cohortJob.cohortDefinitionIds.push($scope.cohort.cohortDefinition.cohortDefinitionId);
                    cohortJob.analysisIds = [];
                    $(".toggle-checkbox-item:checked").each(function () {
                        cohortJob.analysisIds.push($(this).attr("analysis-id"));
                    });
                    cohortJob.runHeraclesHeel = false;

                    // set concepts
                    cohortJob.conditionConceptIds = [];
                    cohortJob.drugConceptIds = [];
                    cohortJob.procedureConceptIds = [];
                    cohortJob.observationConceptIds = [];
                    cohortJob.measurementConceptIds = [];

                    $(".toggle-filter-input").each(function() {
                        if ($(this).val().trim() !== "") {
                            var key = $(this).attr("toggle-filter");
                            var ary = _.words($(this).val(), /[^, ]+/g);
                            if (ary.length > 0) {
                                cohortJob[(key + "ConceptIds")] = ary;
                            }
                        }
                    })
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
                    if (!$("#jobStatusModal").is(":visible")) {
                        $("#jobStatusModal").modal("show");
                    }

                }

                $scope.parentAnalysesClick = function($event) {
                    var parent = $(event.currentTarget);
                    var key = parent.attr("key");
                    var checked = parent.find("input:checkbox").prop("checked");
                    $("input[parent='" + key + "']:visible").prop("checked", checked);
                };
            });

            // manually boostrap angular since using amd
            angular.bootstrap(document, ['HeraclesAnalysis']);

            // include other scripts
            require(['cohort-searcher', 'auto-filter-box', 'heracles.main', 'heracles-common']);
        });
    }
);
