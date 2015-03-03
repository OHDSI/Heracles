define(["d3","jnj_chart", "ohdsi_common"], function (d3, jnj_chart, common) {

    function PersonRenderer() {}
    PersonRenderer.prototype = {};
    PersonRenderer.prototype.constructor = PersonRenderer;

    PersonRenderer.render = function(cohort) {
        var id = cohort.cohortDefinitionId;
        this.baseUrl = getWebApiUrl() + '/cohortresults/' + id;


    };

    return PersonRenderer;
});