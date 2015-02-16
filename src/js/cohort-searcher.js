/**
 * Created by cahilton on 2/3/15.
 */
require(['domReady!', 'jquery', 'typeahead', 'handlebars', 'angular', 'monster', 'lodash'], function (domReady, $, t, Handlebars, angular, monster, _) {
    $(domReady).ready(function () {

        var lastRefreshed = monster.get('last-refreshed');
        var refresh = true;
        if (lastRefreshed) {
            var now = _.now();
            // don't refresh more than once every 5 mins
            if (+lastRefreshed + 300000 >= now) {
                refresh = false;
            }
        }

        var cohortDefUrl = getWebApiUrl() + '/cohortdefinition';
        //var cohortDefUrl = 'src/data/sample-cohorts.json';

        // initialize the cohort type ahead, constructs the suggestion engine
        var bloodhoundCohorts = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('cohortDefinitionName'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            limit: 10,
            // if we get to have a lot of cohorts, prefetch may not work, and we'll have to use remote
            prefetch: cohortDefUrl
        });



        if (refresh) {
            bloodhoundCohorts.clearPrefetchCache();
            bloodhoundCohorts.initialize(true);
            monster.set('last-refreshed', _.now());
        } else {
            bloodhoundCohorts.initialize();
        }


        // typeahead cohort listener
        $('.heracles-typeahead .typeahead').typeahead({
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
                suggestion: Handlebars.compile('<p><strong>{{cohortDefinitionName}}</strong> – {{cohortDefinitionDescription}}</p>')
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