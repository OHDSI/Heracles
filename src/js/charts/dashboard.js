define(["d3","jnj_chart", "ohdsi_common"], function (d3, jnj_chart, common) {

    function DashboardRenderer() {}
    DashboardRenderer.prototype = {};
    DashboardRenderer.prototype.constructor = DashboardRenderer;

    var genderDonut;


    DashboardRenderer.render = function(cohort) {
        var id = cohort.cohortDefinitionId;
        this.baseUrl = getWebApiUrl() + '/cohortresults/' + id;


        // gender
        $.getJSON(this.baseUrl + '/person/gender', function(data) {
            d3.selectAll("#genderPie svg").remove();
            genderDonut = new jnj_chart.donut();
            genderDonut.render(common.mapConceptData(data), "#reportDashboard #genderPie", 260, 100, {
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
        //$.getJSON(this.baseUrl + '/person/gender', function(data) {
        //    d3.selectAll("#ageatfirstobservation svg").remove();
        //    var ageAtFirstObservationData = common.mapHistogram(data)
        //    var ageAtFirstObservationHistogram = new jnj_chart.histogram();
        //    ageAtFirstObservationHistogram.render(ageAtFirstObservationData, "#reportDashboard #ageatfirstobservation", 460, 195, {
        //        xFormat: d3.format('d'),
        //        xLabel: 'Age',
        //        yLabel: 'People'
        //    });
        //});

    };

    return DashboardRenderer;
});