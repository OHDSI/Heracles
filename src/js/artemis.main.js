// configure angular
require(['angular', 'jquery', 'bootstrap', 'heracles-d3', 'jasny', 'heracles_common', 'monster', 'bootstrap-select', 'ohdsi_common',
        '../js/charts/dashboard'],
	function (angular, $, b, HeraclesD3, j, heraclesCommon, monster, SelectPicker, OHDSICommon,
		DashboardRenderer, SimpleGraph) {
		var renderers = {
			'dashboard': DashboardRenderer,
		};
		angular.element().ready(function () {
			// setup angular controller on angular ready
			var app = angular.module('HeraclesResults', []);
			app.service('CohortService', function () {
				this.cohort = {};

				this.setCohort = function (c) {
					this.cohort = c;
				};
				this.getCohort = function () {
					return this.cohort;
				};
			});

			app.controller('ACohortViewerCtrl', function ($scope, $http, CohortService) {

                $scope.sources = {};
                $scope.selectedSource = {};
                $scope.selectedSourceString = "";
                $scope.template = 'src/templates/empty.html';

				$scope.summary = undefined;

				$scope.refreshCommonData = function () {
					if ($scope.active === "dashboard") {
						$.getJSON(getWebApiUrl($scope.selectedSource) + "cohortresults/" + 3 + "/raw/person/population", function (data) {
							if (data === undefined) {
                                return;
                            }
							var summary = {};
							$.each(data, function () {
                                if (this.ATTRIBUTE_NAME) {
                                    if (this.ATTRIBUTE_NAME.toLowerCase() === "source name") {
                                        summary.sourceName = this.ATTRIBUTE_VALUE;
                                    } else if (this.ATTRIBUTE_NAME.toLowerCase() === "number of persons") {
                                        summary.numPersons = (this.ATTRIBUTE_VALUE).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                    }
                                }
							});
							$scope.summary = summary;
							$scope.$apply();
						});
					} else {
						$scope.summary = $scope.defaultSummary;
						$scope.$apply();
					}
				};

				$scope.refreshCohortVisualization = function (evt) {
					// TODO
				};

				$scope.goBack = function (evt) {
                    $("#chart-wrapper").empty();
                    $('li.active').removeClass('active');
                    $scope.template = 'src/templates/empty.html';
					$("#viewer-container").slideUp("fast", function () {
						$("#searcher-container").slideDown('fast', function () {
							$("#cohorts")
								.val("")
								.focus();
						});
					});
				};

                $scope.hasOneSource = function () {
                    var keys = _.keys($scope.sources);
                    return keys.length <= 1;
                };

				$scope.setupAndDisplayCohort = function (datum, animate, sources) {

                    $('.viz-complete').detach();

                    $scope.sources = {};
                    $.each(sources, function() {
                        $scope.sources[this.sourceKey] = this;
                    });
                    $scope.selectedSource = sources[0];
                    $scope.selectedSourceString = OHDSICommon.generateSourceString($scope.selectedSource);
                    $scope.$apply();

					$("#cohorts").val(datum.name);
					$scope.cohort = datum;
					//console.log(datum);
					CohortService.setCohort(datum);

					if (animate) {
						$("#searcher-container").slideUp("fast", function () {
							$("#viewer-container").slideDown("slow", function() {
                                setTimeout(function() {
                                    $('.selectpicker').selectpicker('refresh');
                                    $('.selectpicker').selectpicker('render');
                                }, 500);
                            });
						});
					} else {
						$("#searcher-container").hide();
						$("#viewer-container").show('fast', function() {
                            setTimeout(function() {
                                $('.selectpicker').selectpicker('refresh');
                                $('.selectpicker').selectpicker('render');
                            }, 500);
                        });

					}

                    $http.get(getWebApiUrl($scope.selectedSource) + 'cohortresults/' + $scope.cohort.id + '/completed').
                        success(function (data, status, headers, config) {
                            if (data) {
                                $('.chartTypes').each(function(){
                                    var a = $(this);
                                    var vizType = a.attr('vizkey');
                                    if (data.indexOf(vizType) >= 0) {
                                        a.append('<span class="viz-complete badge">' +
                                        '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span>');
                                    }
                                });
                            }
                        }).
                        error(function (data, status, headers, config) {
                            console.log("unable to retrieve completed");

                        });

				};

				$scope.renderVisualizationSection = function (id) {
					//$("#chart-container").hide();
                    //$("#chart-wrapper").empty();
					$scope.active = id;

                    $('#loading-text').text("Loading Files...");
                    $('#spinner-modal').modal('show');

                    setTimeout(function() {

                        var newTemplate = 'src/templates/' + id + '.html';
                        if (newTemplate !== $scope.template) {
                            $scope.template = newTemplate;
                            $scope.$apply();
                        }

                        setTimeout(function() {
                            $scope.refreshCommonData();

                            var renderer = renderers[id];
                            if (renderer) {
                                renderer.render(CohortService.getCohort());
                            }
                        }, 25);

                    }, 200);

					//$("#chart-container").show();
				};

				// include other scripts
				require(['cohort-searcher']);

				$(".chartTypes").click(function () {

                    $scope.template = 'src/templates/loading.html';
                    $scope.$apply();

					var self = $(this);
					$(".active").removeClass("active");
					self.parent("li").addClass("active");

					var id = $(this).attr("id");
					$scope.renderVisualizationSection(id);

				});

				$("#cohorts-viewer-typeahead").bind('typeahead:selected', function (obj, datum, name) {
                    getSources(true, function(sources) {
                        $scope.setupAndDisplayCohort(datum, true, sources);
                    });

				});

				$(document).ready(function () {
                    $('.selectpicker').selectpicker({
                        width: '170px'
                    });

                    $('#sourcepicker').on('change', function(){
                        var sel = $(this).find("option:selected");
                        $scope.selectedSource = ($scope.sources[$(sel).val()]);

                        $scope.selectedSourceString = OHDSICommon.generateSourceString($scope.selectedSource);
                        $scope.$apply();

                        $('#sourcepicker').selectpicker('refresh');
                        $('#' + $scope.active).trigger('click');
                    });

					function doDefault() {
						setTimeout(function () {
							$("#cohorts").focus();
						}, 300);
					}

					var param = urlParam('cohortId');
					if (param && param !== '') {
						var lastWebApi = monster.get('last-webapi');
						if (lastWebApi) {
							setSelectedWebApiUrl(+lastWebApi);
						}
						$http.get(getWebApiUrl() + 'cohortdefinition/' + param).
						success(function (data, status, headers, config) {
							if (data) {
                                getSources(true, function(sources) {
                                    $scope.setupAndDisplayCohort(data, true, sources);

                                });
							}
						}).
						error(function (data, status, headers, config) {
							console.log("unable to retrieve cohort");
							doDefault();
						});
					} else {
						doDefault();
					}

				});
			});

			// manually boostrap angular since using amd
			angular.bootstrap(document, ['HeraclesResults']);

		});


	}
);
