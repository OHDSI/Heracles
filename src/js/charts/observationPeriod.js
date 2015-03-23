define(["jquery", "bootstrap", "d3","jnj_chart", "ohdsi_common", "datatables", "datatables-colvis", "colorbrewer"],
    function ($, bootstrap, d3, jnj_chart, common, DataTables, DataTablesColvis, colorbrewer) {

        function ObservationPeriodRenderer() {}
        ObservationPeriodRenderer.prototype = {};
        ObservationPeriodRenderer.prototype.constructor = ObservationPeriodRenderer;

        ObservationPeriodRenderer.render = function(cohort) {
            d3.selectAll("svg").remove();

            var id = cohort.id;
            this.baseUrl = getWebApiUrl() + '/cohortresults/' + id;
            $('#spinner-modal').modal('show');

            $.ajax({
                type: "GET",
                url: ObservationPeriodRenderer.baseUrl + "/observationperiod",
                contentType: "application/json; charset=utf-8"
            }).done(function (result) {

                $('#spinner-modal').modal('hide');
            }).error(function (result) {
                $('#spinner-modal').modal('hide');
            });

        };

        return ObservationPeriodRenderer;
    });