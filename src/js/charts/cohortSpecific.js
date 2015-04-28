define(["jquery", "bootstrap", "d3","jnj_chart", "ohdsi_common", "datatables", "datatables-colvis", "colorbrewer", "tabletools"],
    function ($, bootstrap, d3, jnj_chart, common, DataTables, DataTablesColvis, colorbrewer, TableTools) {

    function CohortSpecificRenderer() {}
    CohortSpecificRenderer.prototype = {};
    CohortSpecificRenderer.prototype.constructor = CohortSpecificRenderer;

    $(document).on( 'shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
        $(window).trigger("resize");

        // Version 1.
        $('table:visible').each(function()
        {
            var oTableTools = TableTools.fnGetInstance(this);

            if (oTableTools && oTableTools.fnResizeRequired())
            {
                oTableTools.fnResizeButtons();
            }
        });
    });

    CohortSpecificRenderer.render = function(cohort) {
        var stillLoadingDefaults = true, stillLoadingTreemaps = true;
        var id = cohort.id;
        this.baseUrl = getWebApiUrl() + 'cohortresults/' + id;
        d3.selectAll("svg").remove();

        $('#loading-text').text("Querying Database...");
        $('#spinner-modal').modal('show');

        $.getJSON(this.baseUrl + '/cohortspecific', function(data) {
            $('#loading-text').text("Rendering Visualizations...");
            // Persons By Duration From Start To End
            var result = common.normalizeArray(data.personsByDurationFromStartToEnd, false);
            if (!result.empty) {
                var personsByDurationData = common.normalizeDataframe(result).duration
                    .map(function (d, i) {
                        var item = {
                            xValue: this.duration[i],
                            yValue: this.pctPersons[i]
                        };
                        return item;
                    }, result);

                var personsByDurationSingle = new jnj_chart.line();
                personsByDurationSingle.render(personsByDurationData, "#personsByDurationFromStartToEnd", 550, 300, {
                    yFormat: d3.format('0%'),
                    xLabel: 'Day',
                    yLabel: 'Percent of Population',
                    labelIndexDate: true,
                    colorBasedOnIndex : true
                });
            }
            common.generateCSVDownload($("#personsByDurationFromStartToEnd"), data.personsByDurationFromStartToEnd, "personsByDurationFromStartToEnd");

            // prevalence by month
            d3.selectAll("#prevalenceByMonth svg").remove();
            var byMonthData = common.normalizeArray(data.prevalenceByMonth, true);
            if (!byMonthData.empty) {
                var byMonthSeries = common.mapMonthYearDataToSeries(byMonthData, {

                    dateField: 'xCalendarMonth',
                    yValue: 'yPrevalence1000Pp',
                    yPercent: 'yPrevalence1000Pp'
                });


                var prevalenceByMonth = new jnj_chart.line();
                prevalenceByMonth.render(byMonthSeries, "#prevalenceByMonth", 1000, 300, {
                    xScale: d3.time.scale().domain(d3.extent(byMonthSeries[0].values, function (d) {
                        return d.xValue;
                    })),
                    xFormat: d3.time.format("%m/%Y"),
                    tickFormat: d3.time.format("%Y"),
                    xLabel: "Date",
                    yLabel: "Prevalence per 1000 People"
                });
            }
            common.generateCSVDownload($("#prevalenceByMonth"), data.prevalenceByMonth, "prevalenceByMonth");

            // age at index
            var ageAtIndexDistribution = common.normalizeArray(data.ageAtIndexDistribution);
            if (!ageAtIndexDistribution.empty) {
                var boxplot = new jnj_chart.boxplot();
                var agData = ageAtIndexDistribution.category
                    .map(function (d, i) {
                        var item = {
                            Category: ageAtIndexDistribution.category[i],
                            min: ageAtIndexDistribution.minValue[i],
                            LIF: ageAtIndexDistribution.p10Value[i],
                            q1: ageAtIndexDistribution.p25Value[i],
                            median: ageAtIndexDistribution.medianValue[i],
                            q3: ageAtIndexDistribution.p75Value[i],
                            UIF: ageAtIndexDistribution.p90Value[i],
                            max: ageAtIndexDistribution.maxValue[i]
                        };
                        return item;
                    }, ageAtIndexDistribution);
                boxplot.render(agData, "#ageAtIndex", 235, 210, {
                    xLabel: "Gender",
                    yLabel: "Age"
                });
            }
            common.generateCSVDownload($("#ageAtIndex"), data.ageAtIndexDistribution, "ageAtIndexDistribution");

            // distributionAgeCohortStartByCohortStartYear
            var distributionAgeCohortStartByCohortStartYear = common.normalizeArray(data.distributionAgeCohortStartByCohortStartYear);
            if (!distributionAgeCohortStartByCohortStartYear.empty) {
                var boxplotCsy = new jnj_chart.boxplot();
                var csyData = distributionAgeCohortStartByCohortStartYear.category
                    .map(function (d, i) {
                        var item = {
                            Category: this.category[i],
                            min: this.minValue[i],
                            LIF: this.p10Value[i],
                            q1: this.p25Value[i],
                            median: this.medianValue[i],
                            q3: this.p75Value[i],
                            UIF: this.p90Value[i],
                            max: this.maxValue[i]
                        };
                        return item;
                    }, distributionAgeCohortStartByCohortStartYear);
                boxplotCsy.render(csyData, "#distributionAgeCohortStartByCohortStartYear", 235, 210, {
                    xLabel: "Cohort Start Year",
                    yLabel: "Age"
                });
            }
            common.generateCSVDownload($("#distributionAgeCohortStartByCohortStartYear"), data.distributionAgeCohortStartByCohortStartYear, "distributionAgeCohortStartByCohortStartYear");

            // distributionAgeCohortStartByGender
            var distributionAgeCohortStartByGender = common.normalizeArray(data.distributionAgeCohortStartByGender);
            if (!distributionAgeCohortStartByGender.empty) {
                var boxplotBg = new jnj_chart.boxplot();
                var bgData = distributionAgeCohortStartByGender.category
                    .map(function (d, i) {
                        var item = {
                            Category: this.category[i],
                            min: this.minValue[i],
                            LIF: this.p10Value[i],
                            q1: this.p25Value[i],
                            median: this.medianValue[i],
                            q3: this.p75Value[i],
                            UIF: this.p90Value[i],
                            max: this.maxValue[i]
                        };
                        return item;
                    }, distributionAgeCohortStartByGender);
                boxplotBg.render(bgData, "#distributionAgeCohortStartByGender", 235, 210, {
                    xLabel: "Gender",
                    yLabel: "Age"
                });
            }
            common.generateCSVDownload($("#distributionAgeCohortStartByGender"), data.distributionAgeCohortStartByGender, "distributionAgeCohortStartByGender");

            // persons in cohort from start to end
            var personsInCohortFromCohortStartToEnd = common.normalizeArray(data.personsInCohortFromCohortStartToEnd);
            if (!personsInCohortFromCohortStartToEnd.empty) {
                var personsInCohortFromCohortStartToEndSeries = common.map30DayDataToSeries(personsInCohortFromCohortStartToEnd, {
                    dateField: 'monthYear',
                    yValue: 'countValue',
                    yPercent: 'percentValue'
                });
                d3.selectAll("#personinCohortFromStartToEnd svg").remove();
                var observationByMonthSingle = new jnj_chart.line();
                observationByMonthSingle.render(personsInCohortFromCohortStartToEndSeries, "#personinCohortFromStartToEnd", 900, 250, {
                    xScale: d3.time.scale().domain(d3.extent(personsInCohortFromCohortStartToEndSeries[0].values, function (d) {
                        return d.xValue;
                    })),
                    xLabel: "30 Day Increments",
                    yLabel: "People"
                });
            }
            common.generateCSVDownload($("#personinCohortFromStartToEnd"), data.personsInCohortFromCohortStartToEnd, "personsInCohortFromCohortStartToEnd");

            // render trellis
            d3.selectAll("#trellisLinePlot svg").remove();
            var trellisData = common.normalizeArray(data.numPersonsByCohortStartByGenderByAge, true);

            if (!trellisData.empty) {
                var allDeciles = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-99"];
                var minYear = d3.min(trellisData.xCalendarYear),
                    maxYear = d3.max(trellisData.xCalendarYear);

                var seriesInitializer = function (tName, sName, x, y) {
                    return {
                        trellisName: tName,
                        seriesName: sName,
                        xCalendarYear: x,
                        yPrevalence1000Pp: y
                    };
                };

                var nestByDecile = d3.nest()
                    .key(function (d) {
                        return d.trellisName;
                    })
                    .key(function (d) {
                        return d.seriesName;
                    })
                    .sortValues(function (a, b) {
                        return a.xCalendarYear - b.xCalendarYear;
                    });

                // map data into chartable form
                var normalizedSeries = trellisData.trellisName.map(function (d, i) {
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
                            var yearData = series.values.filter(function (f) {
                                    return f.xCalendarYear === year;
                                })[0] || seriesInitializer(trellis.key, series.key, year, 0);
                            yearData.date = new Date(year, 0, 1);
                            return yearData;
                        });
                    });
                });

                // create svg with range bands based on the trellis names
                var chart = new jnj_chart.trellisline();
                chart.render(dataByDecile, "#trellisLinePlot", 1000, 300, {
                    trellisSet: allDeciles,
                    trellisLabel: "Age Decile",
                    seriesLabel: "Year",
                    yLabel: "Prevalence Per 1000 People",
                    xFormat: d3.time.format("%Y"),
                    yFormat: d3.format("0.2f"),
                    tickPadding: 20,
                    colors: d3.scale.ordinal()
                        .domain(["MALE", "FEMALE", "UNKNOWN"])
                        .range(["#1F78B4", "#FB9A99", "#33A02C"])

                });
            }
            common.generateCSVDownload($("#trellisLinePlot"), data.numPersonsByCohortStartByGenderByAge, "numPersonsByCohortStartByGenderByAge");

            if (!stillLoadingTreemaps) {
                $('#spinner-modal').modal('hide');
            }
            stillLoadingDefaults = false;
        })
        .fail(function() {
            if (!stillLoadingTreemaps) {
                $('#spinner-modal').modal('hide');
            }
            stillLoadingDefaults = false;
        });

        function buildHierarchyFromJSON(data, threshold) {
            var total = 0;

            var root = {
                "name": "root",
                "children": []
            };

            for (i = 0; i < data.percentPersons.length; i++) {
                total += data.percentPersons[i];
            }

            for (var i = 0; i < data.conceptPath.length; i++) {
                var parts = data.conceptPath[i].split("||");
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
                            "num_persons": data.numPersons[i],
                            "id": data.conceptId[i],
                            "path": data.conceptPath[i],
                            "pct_persons": data.percentPersons[i],
                            "records_per_person": data.recordsPerPerson[i],
                            "relative_risk" : data.logRRAfterBefore[i],
                            "pct_persons_after": data.percentPersonsAfter[i],
                            "pct_persons_before": data.percentPersonsBefore[i],
                            "risk_difference": data.riskDiffAfterBefore[i]
                        };

                        // we only include nodes with sufficient size in the treemap display
                        // sufficient size is configurable in the calculation of threshold
                        // which is a function of the number of pixels in the treemap display
                        if ((data.percentPersons[i] / total) > threshold) {
                            children.push(childNode);
                        }
                    }
                }
            }
            return root;
        }

        function buildEraHierarchyFromJSON(data, threshold) {
            var total = 0;

            var root = {
                "name": "root",
                "children": []
            };

            for (i = 0; i < data.percentPersons.length; i++) {
                total += data.percentPersons[i];
            }

            for (var i = 0; i < data.conceptPath.length; i++) {
                var parts = data.conceptPath[i].split("||");
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
                            "num_persons": data.numPersons[i],
                            "id": data.conceptId[i],
                            "path": data.conceptPath[i],
                            "pct_persons": data.percentPersons[i],
                            "length_of_era" : data.lengthOfEra[i],
                            "relative_risk" : data.logRRAfterBefore[i],
                            "pct_persons_after": data.percentPersonsAfter[i],
                            "pct_persons_before": data.percentPersonsBefore[i],
                            "risk_difference": data.riskDiffAfterBefore[i]
                        };

                        // we only include nodes with sufficient size in the treemap display
                        // sufficient size is configurable in the calculation of threshold
                        // which is a function of the number of pixels in the treemap display
                        if ((data.percentPersons[i] / total) > threshold) {
                            children.push(childNode);
                        }
                    }
                }
            }
            return root;
        }

        // show the treemap
        $('#loading-text').text("Querying Database...");
        $('#spinner-modal').modal('show');
        var format_pct = d3.format('.2%');
        var format_fixed = d3.format('.2f');
        var format_comma = d3.format(',');

        var width = 1000;
        var height = 250;
        var minimum_area = 50;
        var threshold = minimum_area / (width * height);


        $.getJSON(this.baseUrl + '/cohortspecifictreemap', function(data) {
            $('#loading-text').text("Rendering Visualizations...");

            // condition prevalence
            if (data.conditionOccurrencePrevalence) {
                var normalizedData = common.normalizeDataframe(common.normalizeArray(data.conditionOccurrencePrevalence, true));
                var conditionOccurrencePrevalence = normalizedData;
                if (!conditionOccurrencePrevalence.empty) {
                    var table_data = normalizedData.conceptPath.map(function (d, i) {
                        conceptDetails = this.conceptPath[i].split('||');
                        return {
                            concept_id: this.conceptId[i],
                            soc: conceptDetails[0],
                            hlgt: conceptDetails[1],
                            hlt: conceptDetails[2],
                            pt: conceptDetails[3],
                            snomed: conceptDetails[4],
                            num_persons: format_comma(this.numPersons[i]),
                            percent_persons: format_pct(this.percentPersons[i]),
                            relative_risk: format_fixed(this.logRRAfterBefore[i]),
                            percent_persons_before: format_pct(this.percentPersons[i]),
                            percent_persons_after: format_pct(this.percentPersons[i]),
                            risk_difference: format_fixed(this.riskDiffAfterBefore[i])
                        };
                    }, conditionOccurrencePrevalence);

                    var datatable = $('#condition_table').DataTable({
                        order: [6, 'desc'],
                        dom: 'T<"clear">lfrtip',
                        data: table_data,
                        columns: [
                            {
                                data: 'concept_id',
                                visible: false
                            },
                            {
                                data: 'soc'
                            },
                            {
                                data: 'hlgt',
                                visible: false
                            },
                            {
                                data: 'hlt'
                            },
                            {
                                data: 'pt',
                                visible: false
                            },
                            {
                                data: 'snomed'
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
                                data: 'relative_risk',
                                className: 'numeric'
                            }
                        ],
                        pageLength: 5,
                        lengthChange: false,
                        deferRender: true,
                        destroy: true
                    });

                    $('#reportConditionOccurrences').show();

                    var tree = buildHierarchyFromJSON(conditionOccurrencePrevalence, threshold);
                    var treemap = new jnj_chart.treemap();
                    treemap.render(tree, '#treemap_container', width, height, {
                        onclick: function (node) {
                            console.log('no drilldown for ');
                            console.log(node);
                        },
                        getsizevalue: function (node) {
                            return node.num_persons;
                        },
                        getcolorvalue: function (node) {
                            return node.relative_risk;
                        },
                        getcolorrange: function () {
                            return colorbrewer.RR[3];
                        },
                        getcolorscale : function() {
                            return [-6, 0, 5];
                        },
                        getcontent: function (node) {
                            var result = '',
                                steps = node.path.split('||'),
                                i = steps.length - 1;
                            result += '<div class="pathleaf">' + steps[i] + '</div>';
                            result += '<div class="pathleafstat">Prevalence: ' + format_pct(node.pct_persons) + '</div>';
                            result += '<div class="pathleafstat">% Persons Before: ' + format_pct(node.pct_persons_before) + '</div>';
                            result += '<div class="pathleafstat">% Persons After: ' + format_pct(node.pct_persons_after) + '</div>';
                            result += '<div class="pathleafstat">Number of People: ' + format_comma(node.num_persons) + '</div>';
                            result += '<div class="pathleafstat">Log of Relative Risk per Person: ' + format_fixed(node.relative_risk) + '</div>';
                            result += '<div class="pathleafstat">Difference in Risk: ' + format_fixed(node.risk_difference) + '</div>';
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
                }
            }



            if (data.procedureOccurrencePrevalence) {
                var procedureOccurrencePrevalence = common.normalizeArray(data.procedureOccurrencePrevalence);
                if (!procedureOccurrencePrevalence.empty) {
                    var table_data = procedureOccurrencePrevalence.conceptPath.map(function (d, i) {
                        var conceptDetails = this.conceptPath[i].split('||');
                        return {
                            concept_id: this.conceptId[i],
                            level_4: conceptDetails[0],
                            level_3: conceptDetails[1],
                            level_2: conceptDetails[2],
                            procedure_name: conceptDetails[3],
                            num_persons: format_comma(this.numPersons[i]),
                            percent_persons: format_pct(this.percentPersons[i]),
                            relative_risk: format_fixed(this.logRRAfterBefore[i]),
                            percent_persons_before: format_pct(this.percentPersons[i]),
                            percent_persons_after: format_pct(this.percentPersons[i]),
                            risk_difference: format_fixed(this.riskDiffAfterBefore[i])
                        };
                    }, procedureOccurrencePrevalence);

                    datatable = $('#procedure_table').DataTable({
                        order: [5, 'desc'],
                        dom: 'T<"clear">lfrtip',
                        data: table_data,
                        columns: [
                            {
                                data: 'concept_id',
                                visible: false
                            },
                            {
                                data: 'level_4'
                            },
                            {
                                data: 'level_3',
                                visible: false
                            },
                            {
                                data: 'level_2'
                            },
                            {
                                data: 'procedure_name'
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
                                data: 'relative_risk',
                                className: 'numeric'
                            }
                        ],
                        pageLength: 5,
                        lengthChange: false,
                        deferRender: true,
                        destroy: true
                    });

                    $('#reportProcedureOccurrences').show();

                    var tree = buildHierarchyFromJSON(procedureOccurrencePrevalence, threshold);
                    var treemap = new jnj_chart.treemap();
                    treemap.render(tree, '#proc_treemap_container', width, height, {
                        onclick: function (node) {
                            console.log('no drilldown for ');
                            console.log(node);
                        },
                        getsizevalue: function (node) {
                            return node.num_persons;
                        },
                        getcolorvalue: function (node) {
                            return node.relative_risk;
                        },
                        getcolorrange: function() {
                            return colorbrewer.RR[3];
                        },
                        getcolorscale : function() {
                            return [-6, 0, 5];
                        },
                        getcontent: function (node) {
                            var result = '',
                                steps = node.path.split('||'),
                                i = steps.length - 1;
                            result += '<div class="pathleaf">' + steps[i] + '</div>';
                            result += '<div class="pathleafstat">Prevalence: ' + format_pct(node.pct_persons) + '</div>';
                            result += '<div class="pathleafstat">% Persons Before: ' + format_pct(node.pct_persons_before) + '</div>';
                            result += '<div class="pathleafstat">% Persons After: ' + format_pct(node.pct_persons_after) + '</div>';
                            result += '<div class="pathleafstat">Number of People: ' + format_comma(node.num_persons) + '</div>';
                            result += '<div class="pathleafstat">Log of Relative Risk per Person: ' + format_fixed(node.relative_risk) + '</div>';
                            result += '<div class="pathleafstat">Difference in Risk: ' + format_fixed(node.risk_difference) + '</div>';
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

                }
            }

            if (data.drugEraPrevalence) {
                var drugEraPrevalence = common.normalizeDataframe(common.normalizeArray(data.drugEraPrevalence, true));
                var drugEraPrevalenceData = drugEraPrevalence;
                if (!drugEraPrevalenceData.empty) {
                    var table_data = drugEraPrevalence.conceptPath.map(function (d, i) {
                        var conceptDetails = this.conceptPath[i].split('||');
                        return {
                            concept_id: this.conceptId[i],
                            atc1: conceptDetails[0],
                            atc3: conceptDetails[1],
                            atc5: conceptDetails[2],
                            ingredient: conceptDetails[3],
                            num_persons: format_comma(this.numPersons[i]),
                            percent_persons: format_pct(this.percentPersons[i]),
                            relative_risk: format_fixed(this.logRRAfterBefore[i]),
                            percent_persons_before: format_pct(this.percentPersons[i]),
                            percent_persons_after: format_pct(this.percentPersons[i]),
                            risk_difference: format_fixed(this.riskDiffAfterBefore[i])
                        };
                    }, drugEraPrevalenceData);

                    datatable = $('#drugera_table').DataTable({
                        order: [ 5, 'desc' ],
                        dom: 'T<"clear">lfrtip',
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
                                data: 'ingredient'
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
                                data: 'relative_risk',
                                className: 'numeric'
                            }
                        ],
                        pageLength: 5,
                        lengthChange: false,
                        deferRender: true,
                        destroy: true
                    });

                    $('#reportDrugEras').show();

                    var tree = buildEraHierarchyFromJSON(drugEraPrevalenceData, threshold);
                    var treemap = new jnj_chart.treemap();
                    treemap.render(tree, '#drug_treemap_container', width, height, {
                        onclick: function (node) {
                            console.log('no drilldown for ');
                            console.log(node);
                        },
                        getsizevalue: function (node) {
                            return node.num_persons;
                        },
                        getcolorvalue: function (node) {
                            return node.relative_risk;
                        },
                        getcolorrange: function() {
                            return colorbrewer.RR[3];
                        },
                        getcolorscale : function() {
                            return [-6, 0, 5];
                        },
                        getcontent: function (node) {
                            var result = '',
                                steps = node.path.split('||'),
                                i = steps.length - 1;
                            result += '<div class="pathleaf">' + steps[i] + '</div>';
                            result += '<div class="pathleafstat">Prevalence: ' + format_pct(node.pct_persons) + '</div>';
                            result += '<div class="pathleafstat">% Persons Before: ' + format_pct(node.pct_persons_before) + '</div>';
                            result += '<div class="pathleafstat">% Persons After: ' + format_pct(node.pct_persons_after) + '</div>';
                            result += '<div class="pathleafstat">Number of People: ' + format_comma(node.num_persons) + '</div>';
                            result += '<div class="pathleafstat">Log of Relative Risk per Person: ' + format_fixed(node.relative_risk) + '</div>';
                            result += '<div class="pathleafstat">Difference in Risk: ' + format_fixed(node.risk_difference) + '</div>';
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
                }
            }


            $('[data-toggle="popover"]').popover();
            if (!stillLoadingDefaults) {
                $('#spinner-modal').modal('hide');
            }
            stillLoadingTreemaps = false;
        })
        .fail(function() {
            if (!stillLoadingDefaults) {
                $('#spinner-modal').modal('hide');
            }
            stillLoadingTreemaps = false;
        });

    };

    return CohortSpecificRenderer;
});