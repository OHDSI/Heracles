define(["d3","jnj_chart", "ohdsi_common"], function (d3, jnj_chart, common) {

    function DashboardRenderer() {}
    DashboardRenderer.prototype = {};
    DashboardRenderer.prototype.constructor = DashboardRenderer;

    var genderDonut;


    DashboardRenderer.render = function(cohort) {
        var id = cohort.id;
        this.baseUrl = getWebApiUrl() + '/cohortresults/' + id;


        // gender
        $.getJSON(this.baseUrl + '/raw/person/gender', function(data) {
            d3.selectAll("#genderPie svg").remove();
            genderDonut = new jnj_chart.donut();
            genderDonut.render(common.mapConceptData(data), "#genderPie", 260, 100, {
                colors: d3.scale.ordinal()
                    .domain([8507, 8551, 8532])
                    .range(["#1f77b4", " #CCC", "#ff7f0e"]),
                margin: {
                    top: 5,
                    bottom: 10,
                    right: 150,
                    left: 10
                }
            });
        });

        // age at first obs histogram
        $.getJSON(this.baseUrl + '/raw/observationperiod/ageatfirst', function(data) {

            var histData = {};
            histData.INTERVAL_SIZE = 1;
            histData.MIN = 0;
            histData.MAX = 100;
            histData.INTERVALS = 100;
            histData.DATA = {
                COUNT_VALUE : [], INTERVAL_INDEX : [], PERCENT_VALUE : []
            };
            $.each(data, function () {
                histData.DATA.COUNT_VALUE.push(+this.COUNT_VALUE);
                histData.DATA.INTERVAL_INDEX.push(+this.INTERVAL_INDEX);
                histData.DATA.PERCENT_VALUE.push(+this.PERCENT_VALUE);
            });
            d3.selectAll("#ageatfirstobservation svg").remove();
            var ageAtFirstObservationData = common.mapHistogram(histData);
            var ageAtFirstObservationHistogram = new jnj_chart.histogram();
            ageAtFirstObservationHistogram.render(ageAtFirstObservationData, "#ageatfirstobservation", 460, 195, {
                xFormat: d3.format('d'),
                xLabel: 'Age',
                yLabel: 'People'
            });
        });

        // cumulative observation
        $.getJSON(this.baseUrl + '/raw/observationperiod/cumulativeduration', function(data) {
            var result = {};
            result.SERIES_NAME = [];
            result.X_LENGTH_OF_OBSERVATION = [];
            result.Y_PERCENT_PERSONS = [];
            $.each(data, function() {
                result.SERIES_NAME.push(this.SERIES_NAME);
                result.X_LENGTH_OF_OBSERVATION.push(this.X_LENGTH_OF_OBSERVATION);
                result.Y_PERCENT_PERSONS.push(this.Y_PERCENT_PERSONS);
            });
            d3.selectAll("#cumulativeobservation svg").remove();
            var cumulativeObservationLine = new jnj_chart.line();
            var cumulativeData = common.normalizeDataframe(result).X_LENGTH_OF_OBSERVATION
                .map(function (d, i) {
                    var item = {
                        xValue: this.X_LENGTH_OF_OBSERVATION[i],
                        yValue: this.Y_PERCENT_PERSONS[i]
                    };
                    return item;
                }, result);

            var cumulativeObservationXLabel = 'Days';
            if (cumulativeData.length > 0) {
                if (cumulativeData.slice(-1)[0].xValue - cumulativeData[0].xValue > 1000) {
                    // convert x data to years
                    cumulativeData.forEach(function (d) {
                        d.xValue = d.xValue / 365.25;
                    });
                    cumulativeObservationXLabel = 'Years';
                }
            }

            cumulativeObservationLine.render(cumulativeData, "#cumulativeobservation", 450, 260, {
                yFormat: d3.format('0%'),
                interpolate: "step-before",
                xLabel: cumulativeObservationXLabel,
                yLabel: 'Percent of Population'
            });
        });

        $.getJSON(this.baseUrl + '/raw/observationperiod/observedbymonth', function(data) {

            var result = {
                MONTH_YEAR : [], COUNT_VALUE : [], PERCENT_VALUE : []
            };
            $.each(data, function() {
                result.MONTH_YEAR.push(this.MONTH_YEAR);
                result.COUNT_VALUE.push(this.COUNT_VALUE);
                result.PERCENT_VALUE.push(this.PERCENT_VALUE);
            });

            var byMonthSeries = common.mapMonthYearDataToSeries(result, {
                dateField: 'MONTH_YEAR',
                yValue: 'COUNT_VALUE',
                yPercent: 'PERCENT_VALUE'
            });

            d3.selectAll("#oppeoplebymonthsingle svg").remove();
            var observationByMonthSingle = new jnj_chart.line();
            observationByMonthSingle.render(byMonthSeries, "#oppeoplebymonthsingle", 550, 300, {
                xScale: d3.time.scale().domain(d3.extent(byMonthSeries[0].values, function (d) {
                    return d.xValue;
                })),
                xFormat: d3.time.format("%m/%Y"),
                tickFormat: d3.time.format("%Y"),
                tickPadding: 10,
                xLabel: "Date",
                yLabel: "People"
            });
        });

    };

    return DashboardRenderer;
});