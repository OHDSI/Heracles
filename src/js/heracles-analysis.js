// configure angular
require(['angular', 'jquery', 'bootstrap', 'heracles-d3', 'jasny', 'heracles_common', 'lodash'], function (angular, $, b, HeraclesD3, j, heraclesCommon, _) {
        angular.element().ready(function() {
            // setup angular controller on angular ready
            angular.module('HeraclesAnalysis', []).controller('CohortExplorerCtrl', function($scope, $http) {

                $scope.job = {};
                $scope.message = {};
                $scope.visualizationPacks = {
                    "Default" : [1, 2 ,101, 108, 110],
                    "Drug Exposure" : [700, 701, 706, 715, 705, 704, 116, 702, 117, 717, 716, 1],
                    "Condition" : [116, 117, 400, 401, 402, 404, 405, 406, 1],
                    "Drug Era" : [900, 907, 906, 904, 902, 116, 117, 1],
                    "Condition Era" : [1000, 1007, 1006, 1004, 1002, 116, 117, 1],
                    "Person" : [0, 1, 2, 3, 4, 5]
                };
                $scope.analysisCount = 0;

                $scope.showCohort = function(datum) {
                    $('#spinner-modal').modal('show');
                    $("#run-analysis-container").hide();
                    $scope.analysisCount = 0;
                    $scope.selected = datum;
                    //$http.get('src/data/sample-cohort-explorer.json')
                    $http.get(getWebApiUrl() + "/cohortanalysis/" + datum.id + "/summary")
                        .success(function(data, status, headers, config) {
                            $scope.cohort = data;

                            if (data.analyses) {
                                var map = {};
                                $.each(data.analyses, function() {

                                    var prettifyAnalysisType = _.startCase(this.analysisType.toLowerCase());
                                    if (!$scope.cohort.firstAnalysis) {
                                        $scope.cohort.firstAnalysis = prettifyAnalysisType;
                                    }
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
                            /*
                            if ($scope.cohort.ageDistribution !== null && $scope.cohort.ageDistribution.length > 0) {
                                HeraclesD3.showAgeDistribution($scope.cohort.ageDistribution);
                            }
                            if ($scope.cohort.genderDistribution !== null && $scope.cohort.genderDistribution.length > 0) {
                                HeraclesD3.showGenderDistribution($scope.cohort.genderDistribution);
                            }
                            */
                            $("#run-analysis-container").show();
                            HeraclesD3.renderOHDSIDefaults($scope.cohort);

                            $('#spinner-modal').modal('hide');
                        }).error(function(data, status, headers, config) {
                            console.log("failed to load analyses");
                            $("#run-analysis-container").show();
                            $('#spinner-modal').modal('hide');
                        });
                };

                $scope.scrollAnalysesClick = function($event, k) {

                    $('#auto-filter-div').animate({
                         scrollTop: ($('#auto-filter-div').scrollTop() + $(".toggle-parent-label[key='" + k + "']").position().top - $('#auto-filter-div').height()/2 + $(".toggle-parent-label[key='" + k + "']").height()/2)
                        }, 1000);

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
                        $scope.analysisCount = 0;
                        $scope.showCohort($scope.selected);
                        setTimeout(function() {
                            link.text("Refresh");
                            link.prop('disabled', false);
                        }, 1500);
                    }
                };

                $scope.selectVizPack = function($event, vizType) {
                    var vals = $scope.visualizationPacks[vizType];
                    if (vals) {
                        var first;
                        $.each(vals, function() {
                            if (!first) {
                                first = $(".toggle-checkbox-item[analysis-id=" + this + "]");
                            }
                            if (!$(".toggle-checkbox-item[analysis-id=" + this + "]").prop("checked")) {
                                $(".toggle-checkbox-item[analysis-id=" + this + "]").prop("checked", true);
                                $scope.analysisClick();
                            }
                        });
                        if (first) {
                            $('#auto-filter-div').animate({
                                scrollTop: ($('#auto-filter-div').scrollTop() + first.position().top - $('#auto-filter-div').height()/2 + first.height()/2)
                            }, 1000);
                        }
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
                    cohortJob.cohortDefinitionIds.push($scope.cohort.cohortDefinition.id);
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
                    });
                    console.log("Submitting to cohort analysis service:");

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

                $scope.analysisClick = function() {
                    $scope.analysisCount = $(".toggle-checkbox-item:checked").length;
                };

                $scope.parentAnalysesClick = function($event) {
                    var parent = $(event.currentTarget);
                    var key = parent.attr("key");
                    var checked = parent.find("input:checkbox").prop("checked");
                    $("input[parent='" + key + "']:visible").prop("checked", checked);
                    $scope.analysisClick();
                };

                $(document).ready(function() {
                    var param = $.urlParam('cohortId');
                    if (param && param !== '') {
                        var datum = { id : param };
                        $(".page-one").hide();
                        $scope.showCohort(datum);

                        // show div
                        $("#cohort-explorer-main").show();

                    }
                    else {
                        setTimeout(function () {
                            $("#cohorts").focus();
                        }, 300);
                    }
                });
            });


            // manually boostrap angular since using amd
            angular.bootstrap(document, ['HeraclesAnalysis']);

            // include other scripts
            require(['cohort-searcher', 'auto-filter-box', 'heracles.main']);
        });



    }
);
