/**
 * Created by cahilton on 2/3/15.
 */
require(['domReady!', 'jquery', 'typeahead', 'handlebars', 'angular'], function (domReady, $, t, Handlebars, angular) {
    $(domReady).ready(function () {

        var cohortDefUrl = getWebApiUrl() + '/cohortdefinition';

        // initialize the cohort type ahead, constructs the suggestion engine
        var bloodhoundCohorts = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('COHORT_DEFINITION_NAME'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            limit: 10,
            // if we get to have a lot of cohorts, prefetch may not work, and we'll have to use remote
            prefetch: cohortDefUrl
        });

        bloodhoundCohorts.initialize();


        // typeahead cohort listener
        $('#cohorts-typeahead .typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            name: 'cohorts',
            displayKey: 'value',
            source: bloodhoundCohorts.ttAdapter(),
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'Unable to find any cohorts that match the current query',
                    '</div>'
                ].join('\n'),
                suggestion: Handlebars.compile('<p><strong>{{COHORT_DEFINITION_NAME}}</strong> – {{COHORT_DEFINITION_DESCRIPTION}}</p>')
            }
        });

        // on select a cohort
        $("#cohorts-typeahead").bind('typeahead:selected', function (obj, datum, name) {
            $("#cohorts").val(datum.cohortDefinitionName);

            $(".page-one").slideUp("fast", function () {
                // set page data
                angular.element($('#cohort-explorer-main')).scope().showCohort(datum);


                // show div
                $("#cohort-explorer-main").slideDown("slow");
            });

        });
    });
});