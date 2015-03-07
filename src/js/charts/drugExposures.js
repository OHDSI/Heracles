define(["jquery", "bootstrap", "d3","jnj_chart", "ohdsi_common", "datatables", "datatables-colvis", "colorbrewer"],
    function ($, bootstrap, d3, jnj_chart, common, DataTables, DataTablesColvis, colorbrewer) {

        function DrugExposureRenderer() {}
        DrugExposureRenderer.prototype = {};
        DrugExposureRenderer.prototype.constructor = DrugExposureRenderer;

        DrugExposureRenderer.render = function(cohort) {
            d3.selectAll("svg").remove();

            var id = cohort.id;
            this.baseUrl = getWebApiUrl() + '/cohortresults/' + id;

            var drug_exposure = {};
            var threshold;
            var datatable;

            // bind to all matching elements upon creation

            $(document).on('click', '#drug_table tbody tr', function () {
                $('#drug_table tbody tr.selected').removeClass('selected');
                $(this).addClass('selected');
                id = datatable.data()[datatable.row(this)[0]].concept_id;
                concept_name = datatable.data()[datatable.row(this)[0]].ingredient;
                drug_exposure.drilldown(id, concept_name);
            });

            $('#myTab a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
                $(window).trigger("resize");
            });

            function boxplot_helper(data, target, xlabel, ylabel, width, height) {
                var boxplot = new jnj_chart.boxplot();
                var yMax = 0;
                bpseries = [];
                var normalized = common.normalizeArray(data, true);
                if (!normalized.empty) {
                    bpdata = (common.normalizeDataframe(normalized));

                    for (i = 0; i < bpdata.CATEGORY.length; i++) {
                        bpseries.push({
                            Category: bpdata.CATEGORY[i],
                            min: bpdata.MIN_VALUE[i],
                            max: bpdata.MAX_VALUE[i],
                            median: bpdata.MEDIAN_VALUE[i],
                            LIF: bpdata.P10_VALUE[i],
                            q1: bpdata.P25_VALUE[i],
                            q3: bpdata.P75_VALUE[i],
                            UIF: bpdata.P90_VALUE[i]
                        });
                        yMax = Math.max(yMax, bpdata.P90_VALUE[i]);
                    }


                    boxplot.render(bpseries, target, width, height, {
                        yMax: yMax,
                        xLabel: xlabel,
                        yLabel: ylabel
                    });
                }
            }

            drug_exposure.drilldown = function (concept_id, concept_name) {

                $('#spinner-modal').modal('show');

                $('.drilldown svg').remove();
                $('#drugDrilldownTitle').text(concept_name);
                $('#reportDrugExposuresDrilldown').removeClass('hidden');

                $.ajax({
                    type: "GET",
                    url: DrugExposureRenderer.baseUrl + '/drug/' + concept_id,
                    success: function (data) {

                        // boxplots
                        boxplot_helper(data.ageAtFirstExposure, '#ageAtFirstExposure', 'Gender', 'Age at First Exposure', 360,300);
                        boxplot_helper(data.daysSupplyDistribution, '#daysSupplyDistribution', 'Days Supply', 'Days', 360,300);
                        boxplot_helper(data.quantityDistribution, '#quantityDistribution', 'Quantity', 'Quantity', 360,300);
                        boxplot_helper(data.refillsDistribution, '#refillsDistribution', 'Refills', 'Refills', 360,300);

                        // drug  type visualization
                        var donut = new jnj_chart.donut();
                        var drugsByType = common.mapConceptData(data.drugsByType);
                        donut.render(drugsByType, "#drugsByType", 300, 200, {
                            margin: {
                                top: 5,
                                left: 5,
                                right: 200,
                                bottom: 5
                            },
                            colors : d3.scale.ordinal()
                                .domain(drugsByType)
                                .range(colorbrewer.Paired[10])
                        });

                        // prevalence by month
                        var prevByMonth = common.normalizeArray(data.prevalenceByMonth, true);
                        if (!prevByMonth.empty) {
                            var byMonthSeries = common.mapMonthYearDataToSeries(prevByMonth, {
                                dateField: 'X_CALENDAR_MONTH',
                                yValue: 'Y_PREVALENCE_1000PP',
                                yPercent: 'Y_PREVALENCE_1000PP'
                            });

                            d3.selectAll("#drugPrevalenceByMonth svg").remove();
                            var prevalenceByMonth = new jnj_chart.line();
                            prevalenceByMonth.render(byMonthSeries, "#drugPrevalenceByMonth", 900, 250, {
                                xScale: d3.time.scale().domain(d3.extent(byMonthSeries[0].values, function (d) {
                                    return d.xValue;
                                })),
                                xFormat: d3.time.format("%m/%Y"),
                                tickFormat: d3.time.format("%Y"),
                                xLabel: "Date",
                                yLabel: "Prevalence per 1000 People"
                            });
                        }

                        // render trellis
                        var trellisData = common.normalizeArray(data.prevalenceByGenderAgeYear, true);

                        if (!trellisData.empty) {

                            var allDeciles = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-99"];
                            var allSeries = ["MALE", "FEMALE"];
                            var minYear = d3.min(trellisData.X_CALENDAR_YEAR),
                                maxYear = d3.max(trellisData.X_CALENDAR_YEAR);

                            var seriesInitializer = function (tName, sName, x, y) {
                                return {
                                    TRELLIS_NAME: tName,
                                    SERIES_NAME: sName,
                                    X_CALENDAR_YEAR: x,
                                    Y_PREVALENCE_1000PP: y
                                };
                            }

                            var nestByDecile = d3.nest()
                                .key(function (d) {
                                    return d.TRELLIS_NAME;
                                })
                                .key(function (d) {
                                    return d.SERIES_NAME;
                                })
                                .sortValues(function (a, b) {
                                    return a.X_CALENDAR_YEAR - b.X_CALENDAR_YEAR;
                                });

                            // map data into chartable form
                            var normalizedSeries = trellisData.TRELLIS_NAME.map(function (d, i) {
                                var item = {};
                                var container = this;
                                d3.keys(container).forEach(function (p) {
                                    item[p] = container[p][i];
                                });
                                return item;
                            }, trellisData);

                            var dataByDecile = nestByDecile.entries(normalizedSeries);
                            // fill in gaps
                            var yearRange = d3.range(minYear, maxYear, 1);

                            dataByDecile.forEach(function (trellis) {
                                trellis.values.forEach(function (series) {
                                    series.values = yearRange.map(function (year) {
                                        yearData = series.values.filter(function (f) {
                                            return f.X_CALENDAR_YEAR == year;
                                        })[0] || seriesInitializer(trellis.key, series.key, year, 0);
                                        yearData.date = new Date(year, 0, 1);
                                        return yearData;
                                    })
                                })
                            });

                            // create svg with range bands based on the trellis names
                            var chart = new jnj_chart.trellisline();
                            chart.render(dataByDecile, "#trellisLinePlot", 1000, 300, {
                                trellisSet: allDeciles,
                                trellisLabel: "Age Decile",
                                seriesLabel: "Year of Observation",
                                yLabel: "Prevalence Per 1000 People",
                                xFormat: d3.time.format("%Y"),
                                yFormat: d3.format("0.2f"),
                                tickPadding: 20,
                                colors: d3.scale.ordinal()
                                    .domain(["MALE", "FEMALE", "UNKNOWN",])
                                    .range(["#1F78B4", "#FB9A99", "#33A02C"])
                            });
                        }

                        $('#spinner-modal').modal('hide');
                    }, error : function(data) {
                        $('#spinner-modal').modal('hide');
                    }
                });
            };

            drug_exposure.render = function (path) {
                $('#spinner-modal').modal('show');

                format_pct = d3.format('.2%');
                format_fixed = d3.format('.2f');
                format_comma = d3.format(',');

                width = 1000;
                height = 250;
                minimum_area = 50;
                threshold = minimum_area / (width * height);
                $.ajax({
                    type: "GET",
                    url: path,
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        var normalizedData = common.normalizeDataframe(common.normalizeArray(data, true));
                        data = normalizedData;
                        if (!data.empty) {
                            var table_data = normalizedData.CONCEPT_PATH.map(function (d, i) {
                                conceptDetails = this.CONCEPT_PATH[i].split('||');
                                return {
                                    concept_id: this.CONCEPT_ID[i],
                                    atc1: conceptDetails[0],
                                    atc3: conceptDetails[1],
                                    atc5: conceptDetails[2],
                                    ingredient: conceptDetails[3],
                                    rxnorm: conceptDetails[4],
                                    num_persons: format_comma(this.NUM_PERSONS[i]),
                                    percent_persons: format_pct(this.PERCENT_PERSONS[i]),
                                    records_per_person: format_fixed(this.RECORDS_PER_PERSON[i])
                                };
                            }, data);

                            datatable = $('#drug_table').DataTable({
                                order: [ 6, 'desc' ],
                                dom: 'Clfrtip',
                                data: table_data,
                                columns: [
                                    {
                                        data: 'concept_id',
                                        visible: false
                                    },
                                    {
                                        data: 'atc1'
                                    },
                                    {
                                        data: 'atc3',
                                        visible: false
                                    },
                                    {
                                        data: 'atc5'
                                    },
                                    {
                                        data: 'ingredient',
                                        visible: false
                                    },
                                    {
                                        data: 'rxnorm'
                                    },
                                    {
                                        data: 'num_persons',
                                        className: 'numeric'
                                    },
                                    {
                                        data: 'percent_persons',
                                        className: 'numeric'
                                    },
                                    {
                                        data: 'records_per_person',
                                        className: 'numeric'
                                    }
                                ],
                                pageLength: 5,
                                lengthChange: false,
                                deferRender: true,
                                destroy: true
                            });

                            tree = buildHierarchyFromJSON(data, threshold);
                            var treemap = new jnj_chart.treemap();
                            treemap.render(tree, '#treemap_container', width, height, {
                                onclick: function (node) {
                                    drug_exposure.drilldown(node.id, node.name);
                                },
                                getsizevalue: function (node) {
                                    return node.num_persons;
                                },
                                getcolorvalue: function (node) {
                                    return node.records_per_person;
                                },
                                getcolorrange: function() {
                                    return colorbrewer.Paired[3];
                                },
                                getcontent: function (node) {
                                    var result = '',
                                        steps = node.path.split('||'),
                                        i = steps.length - 1;
                                    result += '<div class="pathleaf">' + steps[i] + '</div>';
                                    result += '<div class="pathleafstat">Prevalence: ' + format_pct(node.pct_persons) + '</div>';
                                    result += '<div class="pathleafstat">Number of People: ' + format_comma(node.num_persons) + '</div>';
                                    result += '<div class="pathleafstat">Records per Person: ' + format_fixed(node.records_per_person) + '</div>';
                                    return result;
                                },
                                gettitle: function (node) {
                                    var title = '',
                                        steps = node.path.split('||');
                                    for (i = 0; i < steps.length - 1; i++) {
                                        title += ' <div class="pathstep">' + Array(i + 1).join('&nbsp;&nbsp') + steps[i] + ' </div>';
                                    }
                                    return title;
                                }
                            });
                            $('[data-toggle="popover"]').popover();

                        }
                        $('#spinner-modal').modal('hide');
                    }, error: function() {
                        $('#spinner-modal').modal('hide');
                    }
                });
            };

            function buildHierarchyFromJSON(data, threshold) {
                var total = 0;

                var root = {
                    "name": "root",
                    "children": []
                };

                for (i = 0; i < data.PERCENT_PERSONS.length; i++) {
                    total += data.PERCENT_PERSONS[i];
                }

                for (var i = 0; i < data.CONCEPT_PATH.length; i++) {
                    var parts = data.CONCEPT_PATH[i].split("||");
                    var currentNode = root;
                    for (var j = 0; j < parts.length; j++) {
                        var children = currentNode.children;
                        var nodeName = parts[j];
                        var childNode;
                        if (j + 1 < parts.length) {
                            // Not yet at the end of the path; move down the tree.
                            var foundChild = false;
                            for (var k = 0; k < children.length; k++) {
                                if (children[k].name === nodeName) {
                                    childNode = children[k];
                                    foundChild = true;
                                    break;
                                }
                            }
                            // If we don't already have a child node for this branch, create it.
                            if (!foundChild) {
                                childNode = {
                                    "name": nodeName,
                                    "children": []
                                };
                                children.push(childNode);
                            }
                            currentNode = childNode;
                        } else {
                            // Reached the end of the path; create a leaf node.
                            childNode = {
                                "name": nodeName,
                                "num_persons": data.NUM_PERSONS[i],
                                "id": data.CONCEPT_ID[i],
                                "path": data.CONCEPT_PATH[i],
                                "pct_persons": data.PERCENT_PERSONS[i],
                                "records_per_person": data.RECORDS_PER_PERSON[i]
                            };

                            // we only include nodes with sufficient size in the treemap display
                            // sufficient size is configurable in the calculation of threshold
                            // which is a function of the number of pixels in the treemap display
                            if ((data.PERCENT_PERSONS[i] / total) > threshold) {
                                children.push(childNode);
                            }
                        }
                    }
                }
                return root;
            }

            // show the treemap
            drug_exposure.render(DrugExposureRenderer.baseUrl + '/raw/drug/sqlDrugTreemap');

            return drug_exposure;
        };

    return DrugExposureRenderer;
});