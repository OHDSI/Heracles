define(["d3","jnj_chart", "ohdsi_common"], function (d3, jnj_chart, common) {

    function CohortSpecificRenderer() {}
    CohortSpecificRenderer.prototype = {};
    CohortSpecificRenderer.prototype.constructor = CohortSpecificRenderer;

    var genderDonut;


    CohortSpecificRenderer.render = function(cohort) {
        var id = cohort.id;
        this.baseUrl = getWebApiUrl() + '/cohortresults/' + id;
        d3.selectAll("svg").remove();

        $('#spinner-modal').modal('show');
        $.getJSON(this.baseUrl + '/cohortspecific', function(data) {

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

            $('#spinner-modal').modal('hide');
        })
        .fail(function() {
            $('#spinner-modal').modal('hide');
        });

    };

    return CohortSpecificRenderer;
});