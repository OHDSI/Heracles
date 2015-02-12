define(['jquery', 'd3', 'angular'], function (jquery, d3, angular) {
    var COLOR_RANGE = ["#AF0C3C", "#290F2E", "#0E7184", "#F0D31A", "#FE7D0D"];
    var HIDDEN_DIV_HEIGHT = 250;


    function HeraclesD3() {}
    HeraclesD3.prototype = {};
    HeraclesD3.prototype.constructor = HeraclesD3;


    function translateGenderData(dataIn) {
        var data = {};
        data.array = [];
        data.keys = [];
        data.total_size = 0;
        $.each(dataIn, function () {

            data.total_size += (+this.NUM_PERSONS);

            var obj = {};
            data.keys.push(this.CONCEPT_NAME);
            obj.label = this.CONCEPT_NAME;
            obj.value = this.NUM_PERSONS;

            data.array.push(obj);
        });

        // reset averages
        $.each(data.array, function () {
            this.average_value = Math.round((+this.value / data.total_size) * 100);
        });

        return data;
    }

    function translateAgeData(dataIn) {
        var data = {};
        data.array = [];
        data.total_size = 0;
        data.keys = ["<18 yrs", "18-34 yrs", "35-49 yrs", "50-64 yrs", ">= 65 yrs"];
        $.each(data.keys, function() {
            var obj = {};
            obj.label = (this);
            obj.value = 0;
            data.array.push(obj);
        });

        $.each(dataIn, function() {
            var age = +this.AGE_AT_INDEX;
            var persons = +this.NUM_PERSONS;
            data.total_size += (+this.NUM_PERSONS);

            if (age < 18) {
                data.array[0].value += persons;
            } else if (age >= 18 && age < 35) {
                data.array[1].value += persons;
            } else if (age >= 35 && age < 50) {
                data.array[2].value += persons;
            } else if (age >= 50 && age < 65) {
                data.array[3].value += persons;
            } else {
                data.array[4].value += persons;
            }
        });

        // reset averages
        $.each(data.array, function () {
            this.average_value = Math.round((+this.value / data.total_size) * 100);
        });

        return data;
    }

    function getCurrentMaxHeight() {
        return (($("#cohort-explorer-summary").height() + HIDDEN_DIV_HEIGHT) / 2) - 50;

    }

    HeraclesD3.showAgeDistribution = function(ageData) {
        var data = translateAgeData(ageData);

        $("#age_dist").empty();

        var w = 200; //Math.min(getCurrentMaxHeight(), 200);
        var r = w / 2;
        /*
            var color = d3.scale.ordinal()

            .domain(data.keys)
            .range(COLOR_RANGE);
         */

        var color = d3.scale.category10();


        var vis = d3.select('#age_dist')
            .append("svg:svg")
            .data([data.array])
            .attr("width", w)
            .attr("height", w)
            .append("svg:g")
            .attr("transform", "translate(" + r + "," + r + ")");
        var pie = d3.layout.pie().value(function (d) {
            return d.average_value;
        });

        // declare an arc generator function
        var arc = d3.svg.arc().outerRadius(r);

        // select paths, use arc generator to draw
        var arcs = vis
            .selectAll("g.slice")
            .data(pie)
            .enter()
            .append("svg:g")
            .attr("class", "slice");
        arcs.append("svg:path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", function (d) {
                return arc(d);
            });

        // add the text
        arcs.append("svg:text").attr("transform", function (d) {
            d.innerRadius = 0;
            d.outerRadius = r;
            return "translate(" + arc.centroid(d) + ")";
        })
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "10px")
            .text(function (d, i) {
                return data.array[i].label;
            }
        );

        arcs.append("svg:text").attr("transform", function (d) {
            d.innerRadius = 0;
            d.outerRadius = r;
            var centroid = (arc.centroid(d));
            centroid[1] += 20;
            //console.log(centroid);
            return "translate(" + centroid + ")";
        })
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .style("font-size", "10px")
            .text(function (d, i) {
                return data.array[i].average_value + "%";
            }
        );

    };

    HeraclesD3.showGenderDistribution = function(genderData) {

        var transData = translateGenderData(genderData);
        var data = transData.array;
        /*
        var color = d3.scale.ordinal()
            .domain(transData.keys)
            .range(COLOR_RANGE);
            */
        var color = d3.scale.category10();

        $("#gender_dist").empty();

        var barWidth = 60;
        var width = (barWidth + 10) * data.length;
        var height = 200; //Math.min(getCurrentMaxHeight(), 200);

        var x = d3.scale.linear().domain([0, data.length]).range([0, width]);
        var y = d3.scale.linear().domain([0, d3.max(data, function (datum) {
            return datum.average_value;
        })]).
            rangeRound([0, height]);

        // add the canvas to the DOM
        var barChart = d3.select("#gender_dist").
            append("svg:svg").
            attr("width", width).
            attr("height", height);

        barChart.selectAll("rect").
            data(data).
            enter().
            append("svg:rect").
            attr("x", function (datum, index) {
                return x(index);
            }).
            attr("y", function (datum) {
                return height - y(datum.average_value);
            }).
            attr("height", function (datum) {
                return y(datum.average_value);
            }).
            attr("width", barWidth).
            attr("fill", function (d, i) {
                return color(i);
            });

        barChart.selectAll("text").
            data(data).
            enter().
            append("svg:text").
            attr("x", function (datum, index) {
                return x(index) + barWidth;
            }).
            attr("y", function (datum) {
                return height - y(datum.average_value);
            }).
            attr("dx", -barWidth / 2).
            attr("dy", "1.2em").
            attr("text-anchor", "middle").
            attr("font-weight", "bold").
            text(function (datum) {
                return datum.average_value + "%";
            }).
            attr("fill", "white").
            attr("style", "font-size: 10; font-family: Helvetica, sans-serif");

        barChart.selectAll("text.yAxis").
            data(data).
            enter().append("svg:text").
            attr("x", function (datum, index) {
                return x(index) + barWidth;
            }).
            attr("y", height).
            attr("dx", -barWidth / 2).
            attr("text-anchor", "middle").
            attr("style", "font-size: 10; font-family: Helvetica, sans-serif").
            attr("fill", "white").
            text(function (datum) {
                return datum.label;
            }).
            attr("transform", "translate(0, -4)").
            attr("class", "yAxis");

    };



    return HeraclesD3;
});