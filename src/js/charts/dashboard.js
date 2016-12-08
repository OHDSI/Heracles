define(["d3","jnj_chart", "ohdsi_common"], function (d3, jnj_chart, common) {

    function DashboardRenderer() {}
    DashboardRenderer.prototype = {};
    DashboardRenderer.prototype.constructor = DashboardRenderer;

    var genderDonut;


    DashboardRenderer.render = function(cohort) {
        var id = cohort.id;
        this.baseUrl = getSourceSpecificWebApiUrl() + 'cohortresults/' + id;
        d3.selectAll("svg").remove();
        $('#loading-text').text("Querying Database...");
        $('#spinner-modal').modal('show');
        //$.getJSON(this.baseUrl + '/dashboard', function(data) {
        $.getJSON('http://localhost:8080/WebAPI/lite/cost/averageCostPMPM', function(data) {
        
          BoxPlot(data);

          function BoxPlot(data) {

            var margin = {top: 0, right: 0, bottom: 0, left: 50},
                width = 150,
                height = 700;
                padding = 50;
                midline = padding + 20;

            var yScale = d3.scale.linear()
               .range([height - padding, 0]);  

            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .tickFormat(d3.format("s"));

            //initialize boxplot statistics
            var costData = [];
            for (var i = 0, len = data.length; i < len; i++) {
              //console.log(data[i]);
              costData[len - 1 - i] = data[i].averageCost;
              //console.log(i);
            }

            //console.log(costData);

            var data = [],
                outliers = [],
                minVal = Infinity,
                lowerWhisker = Infinity,
                q1Val = Infinity,
                medianVal = 0,
                q3Val = -Infinity,
                iqr = 0,
                upperWhisker = -Infinity,
                maxVal = -Infinity;



            // y.domain(data.map(function(d) { 
            //     console.log(d.averageCost);
            //     return d.averageCost; }));

            //calculate the boxplot statistics
              minVal = costData[0],
              q1Val = d3.quantile(costData, .25),
              medianVal = d3.quantile(costData, .5),
              q3Val = d3.quantile(costData, .75),
              iqr = q3Val - q1Val,
              maxVal = costData[costData.length - 1];

              console.log("MaxVal=" + maxVal);
              console.log("MinVal=" + minVal);
              console.log("q1Val=" + q1Val);
              console.log("q3Val=" + q3Val);
              console.log("medianVal=" + medianVal);
              console.log("iqr=" + iqr);

              // lowerWhisker = d3.max([minVal, q1Val - iqr])
              // upperWhisker = d3.min([maxVal, q3Val + iqr]);

              var index = 0;
              //console.log(costData.length);
              //search for the lower whisker, the mininmum value within q1Val - 1.5*iqr
              while (index < costData.length && lowerWhisker == Infinity) {
                //console.log(costData.length);
                if (costData[index] >= (q1Val - 1.5*iqr)){
                  lowerWhisker = costData[index];
                }
                else
                  outliers.push(costData[index]);
                index++;
              }

              index = costData.length-1; // reset index to end of array

              //search for the upper whisker, the maximum value within q1Val + 1.5*iqr
              while (index >= 0 && upperWhisker == -Infinity) {

                if (costData[index] <= (q3Val + 1.5*iqr)){
                  upperWhisker = costData[index];
                }
                else
                  outliers.push(costData[index]);
                index--;
              }

              console.log("lowerWhisker=" + lowerWhisker);
              console.log("upperWhisker=" + upperWhisker);
              yScale.domain([0,maxVal*1.10]);

              var svg = d3.select("#boxPlot").append("svg")
                          .attr("width", width)
                          .attr("height", height);

              var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d, i) {
                return "<strong>Count:</strong> <span style='color:#aaaaaa'>" + data[i].averageCost + "</span>";
              })

              svg.call(tip);

              //append the axis
              svg.append("g")
                 .attr("class", "axis")
                 .attr("transform", "translate(" + padding + ", 0)")
                 .call(yAxis);

              

              //draw vertical line for lowerWhisker
              svg.append("line")
                 .attr("class", "whisker")
                 .attr("y1", yScale(lowerWhisker))
                 .attr("y2", yScale(lowerWhisker))
                 .attr("stroke", "#aaaaaa")
                 .attr("stroke-width", 3)
                 .attr("x1", midline - 10)
                 .attr("x2", midline + 10);

              //draw vertical line for upperWhisker
              svg.append("line")  
                 .attr("class", "whisker")
                 .attr("y1", yScale(upperWhisker))
                 .attr("y2", yScale(upperWhisker))
                 .attr("stroke", "#aaaaaa")
                 .attr("stroke-width", 3)
                 .attr("x1", midline - 10)
                 .attr("x2", midline + 10);

              //draw horizontal line from lowerWhisker to upperWhisker
              svg.append("line")
                 .attr("class", "whisker")
                 .attr("y1",  yScale(lowerWhisker))
                 .attr("y2",  yScale(upperWhisker))
                 .attr("stroke", "#aaaaaa")
                 .attr("stroke-width", 3)
                 .attr("x1", midline)
                 .attr("x2", midline);

              //draw rect for iqr
              svg.append("rect")    
                 .attr("class", "box")
                 .attr("stroke", "#aaaaaa")
                 .attr("stroke-width", 3)
                 .attr("fill", "none")
                 .attr("y", yScale(q3Val))
                 .attr("x", midline - 10)
                 .attr("width", 20)
                 .attr("height", yScale(0) - yScale(iqr));

              //draw horizontal line at median
              svg.append("line")
                 .attr("class", "median")
                 .attr("stroke", "#aaaaaa")
                 .attr("stroke-width", 3)
                 .attr("y1", yScale(medianVal))
                 .attr("y2", yScale(medianVal))
                 .attr("x1", midline - 10)
                 .attr("x2", midline + 10);

              //draw data as points
              svg.selectAll("circle")
                 .data(costData)     
                 .enter()
                 .append("circle")
                 .attr("r", 4)
                 .attr("stroke", "black")
                 .attr("fill", "white")
                 .attr("class", function(d) {
                  if (d < lowerWhisker || d > upperWhisker)
                    return "outlier";
                  else 
                    return "point";
                 })     
                 .attr("cx", function(d) {
                  return midline;
                 }) 
                 .attr("cy", function(d) {
                  return yScale(d);   
                 })
                 .on("mousemove", function(d, i) {
                    d3.select(this).attr("r", 7).style("fill", "#47A369");
                        //Get this bar's x/y values, then augment for the tooltip
                        var xPosition = parseFloat(d3.select(this).attr("x"));
                        var yPosition = parseFloat(d3.select(this).attr("y")) + height / 2 -150;

                        //Update the tooltip position and value
                        d3.select("#tooltip")
                            .style("z-index", 1000)
                            .style("left", (d3.event.pageX - 250) + "px")
                            .style("top", (d3.event.pageY - 50) + "px")
                            .select("#value")
                            .text("$" + d);

                        //Show the tooltip
                        d3.select("#tooltip").classed("hidden", false);
                    })                  
                    .on("mouseout", function() {
                    //Hide the tooltip
                    d3.select(this).attr("r", 4).style("fill", "#ffffff");
                    d3.select("#tooltip").classed("hidden", true);
                  });

            // function random_jitter() {
            //   // if (Math.round(Math.random() * 1) == 0)
            //   //   var seed = -5;
            //   // else
            //   //   var seed = 5; 
            //   // return midline + Math.floor((Math.random() * seed) + 1);
            //   return midline;
            // }

            function type(d) {
              d.value = +d.value; // coerce to number
              return d;
            }

          }
          // function BarChart(data) {
           
          //   var svg = d3.select("#detail-container").append("svg"),
          //       margin = {top: 0, right: 0, bottom: 0, left: 50},
          //       width = 500,
          //       height = 250;

          //   var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
          //       y = d3.scale.linear().range([0,250]);
            
          //   var g = svg.append("g")
          //       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          //     x.domain(data.map(function(d) { return d.conceptId; }));
          //     y.domain([d3.max(data, function(d) { return d.totalCost; }) , 0]);
          //     var xAxis = d3.svg.axis()
          //       .scale(x)
          //       .orient("bottom");

          //     g.append("g")
          //         .attr("class", "axis axis--x")
          //         .attr("transform", "translate(0," + height + ")")
          //         .call(xAxis)
          //       .selectAll("text")
          //           .attr("y", 0)
          //           .attr("x", 25)
          //           .attr("dy", ".35em")
          //           .attr("transform", "rotate(90)");

          //     g.append("g")
          //         .attr("class", "axis axis--y")
          //         .call(d3.svg.axis()
          //           .scale(y)
          //           .orient("left")
          //           .ticks(25, "$"))
          //           .append("text")
          //           .attr("transform", "rotate(-90)")
          //           .attr("y", 6)
          //           .attr("dy", "0.71em")
          //           .attr("text-anchor", "end")
          //           .text("Total Cost");

          //     g.selectAll(".bar")
          //       .data(data)
          //       .enter().append("rect")
          //         .attr("class", "bar")
          //         .attr("x", function(d) { return x(d.conceptId); })
          //         .attr("y", function(d) { return y(d.totalCost); })
          //         .attr("width", x.rangeBand())
          //         .attr("height", function(d) { return height - y(d.totalCost); });
            
          // }
          //http://localhost:8080/WebAPI/lite/top20/top20Conditions
          //http://localhost:8080/WebAPI/lite/top20/careSiteDistribution
          //http://localhost:8080/WebAPI/lite/top20/top20HighCostMembers

        $.getJSON('http://localhost:8080/WebAPI/lite/top20/careSiteDistribution', function(data2) {
            //console.log(data2);
            function BarChart(data) {
           
            var svg = d3.select("#hist1").append("svg"),
                margin = {top: 0, right: 0, bottom: 0, left: 50},
                width = 500,
                height = 300;

            var x = d3.scale.ordinal().rangeRoundBands([0, width/3], .05);
                y = d3.scale.linear().range([0, height]);

            var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Count:</strong> <span style='color:#aaaaaa'>" + d.count + "</span>";
              })

            svg.call(tip);
            
            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            x.domain(data.map(function(d) { return d.conceptName; }));
            y.domain([d3.max(data, function(d) { return d.count; }) , 0]);
                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(10)
                    .tickFormat(d3.format("s"));

                g.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                .selectAll("text")
                    .attr("y", 0)
                    .attr("x", 10)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(90)")
                    .style("text-anchor", "start");

              g.append("g")
                  .attr("class", "axis axis--y")
                  .call(yAxis)
                    .selectAll("text")
                    .attr("dy", "0.71em")
                    .attr("y", -5);

              svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0)
                .attr("x", 0-height/2)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Visit Count");

              g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.conceptName); })
                    .attr("y", function(d) { return y(d.count); })
                    .attr("width", x.rangeBand())
                    .attr("height", function(d) { return height - y(d.count); })
                    .on("mousemove", function(d) {
                    d3.select(this).style("fill", "#47A369");
                        //Get this bar's x/y values, then augment for the tooltip
                        var xPosition = parseFloat(d3.select(this).attr("x"));
                        var yPosition = parseFloat(d3.select(this).attr("y")) + height / 2 -150;

                        //Update the tooltip position and value
                        d3.select("#tooltip")
                            .style("z-index", 1000)
                            .style("left", (d3.event.pageX - 275) + "px")
                            .style("top", (d3.event.pageY - 50) + "px")
                            .select("#value")
                            .text(d.count);

                        //Show the tooltip
                        d3.select("#tooltip").classed("hidden", false);
                    })                  
                    .on("mouseout", function() {
                    //Hide the tooltip
                    d3.select(this).style("fill", "#34774D");
                    d3.select("#tooltip").classed("hidden", true);
                  });
          }

            BarChart(data2);
        })
        .fail(function() {
                $('#spinner-modal').modal('hide');
        });

        $.getJSON('http://localhost:8080/WebAPI/lite/top20/top20Conditions', function(data2) {
            
            function BarChart(data) {

            var svg = d3.select("#hist2").append("svg"),
                margin = {top: 0, right: 0, bottom: 0, left: 220},
                width = 450,
                height = 350;

            var y = d3.scale.ordinal().rangeRoundBands([0, height], .05);
                x = d3.scale.linear().range([0, width]);

            var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Count:</strong> <span style='color:#aaaaaa'>" + d.count + "</span>";
              })

            svg.call(tip);
            
            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              y.domain(data.map(function(d) { return d.conceptName; }));
              x.domain([0, d3.max(data, function(d) { return d.count; })]);
              var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(10)
                .tickFormat(d3.format("s"));

              var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

              g.append("g")
                  .attr("class", "axis axis--x")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis)
                .selectAll("text")
                    .attr("y", 0)
                    .attr("x", 10)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(90)")
                    .style("text-anchor", "start");

              svg.append("text")
                .attr("y", height+40)
                .attr("x", width)
                .attr("dy", "1em")
                .style("text-anchor", "end")
                .text("Count");

              g.append("g")
                  .attr("class", "axis axis--y")
                  .call(yAxis)
                    .selectAll("text")
                    .attr("dy", "0.71em")
                    .attr("y", -5);

              // svg.append("text")
              //   .attr("transform", "rotate(-90)")
              //   .attr("y", 0)
              //   .attr("x", 0-height/2)
              //   .attr("dy", "1em")
              //   .style("text-anchor", "middle")
              //   .text("Count");

              g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                  .attr("class", "bar")
                  .attr("x", function(d) { return 0; })
                  .attr("y", function(d) { return y(d.conceptName); })
                  .attr("width", function(d) { return x(d.count); })
                  .attr("height", y.rangeBand())
                  .on("mousemove", function(d) {
                    d3.select(this).style("fill", "#47A369");
                        //Get this bar's x/y values, then augment for the tooltip
                        var xPosition = parseFloat(d3.select(this).attr("x"));
                        var yPosition = parseFloat(d3.select(this).attr("y")) + height / 2 -150;

                        //Update the tooltip position and value
                        d3.select("#tooltip")
                            .style("z-index", 1000)
                            .style("left", (d3.event.pageX - 275) + "px")
                            .style("top", (d3.event.pageY - 50) + "px")
                            .select("#value")
                            .text(d.count);

                        //Show the tooltip
                        d3.select("#tooltip").classed("hidden", false);
                    })                  
                    .on("mouseout", function() {
                        //Hide the tooltip
                        d3.select(this).style("fill", "#34774D");
                        d3.select("#tooltip").classed("hidden", true);
                    });
          }

            BarChart(data2);
        })
        .fail(function() {
                $('#spinner-modal').modal('hide');
        });

        $.getJSON('http://localhost:8080/WebAPI/lite/top20/top20HighCostMembers', function(data2) {
            function BarChart(data) {

            var svg = d3.select("#hist3").append("svg"),
                margin = {top: 0, right: 0, bottom: 0, left: 50},
                width = 450,
                height = 350;

            var y = d3.scale.ordinal().rangeRoundBands([0, height], .05);
                x = d3.scale.linear().range([0, width]);


            
            var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              y.domain(data.map(function(d) { return d.personId; }));
              x.domain([0, d3.max(data, function(d) { return d.totalCost; })]);
              var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(10)
                .tickFormat(d3.format("s"));

              var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

              var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                //console.log(d.totalCost);
                return "<strong>Count:</strong> <span style='color:#aaaaaa'>" + d.totalCost + "</span>";
              })

            svg.call(tip);

              g.append("g")
                  .attr("class", "axis axis--x")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis)
                .selectAll("text")
                    .attr("y", 0)
                    .attr("x", 10)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(90)")
                    .style("text-anchor", "start");

              svg.append("text")
                .attr("y", height+30)
                .attr("x", width/2)
                .attr("dy", "1em")
                .style("text-anchor", "start")
                .text("Total Cost");

              g.append("g")
                  .attr("class", "axis axis--y")
                  .call(yAxis)
                    .selectAll("text")
                    .attr("dy", "0.71em")
                    .attr("y", -5);

              // svg.append("text")
              //   .attr("transform", "rotate(-90)")
              //   .attr("y", 0)
              //   .attr("x", 0-height/2)
              //   .attr("dy", "1em")
              //   .style("text-anchor", "middle")
              //   .text("Count");

              g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return 0; })
                    .attr("y", function(d) { return y(d.personId); })
                    .attr("width", function(d) { return x(d.totalCost); })
                    .attr("height", y.rangeBand())
                    .on("mousemove", function(d) {
                        d3.select(this).style("fill", "#47A369");
                        //Get this bar's x/y values, then augment for the tooltip
                        var xPosition = parseFloat(d3.select(this).attr("x")) + x.width / 2;
                        var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;

                        //Update the tooltip position and value
                        d3.select("#tooltip")
                            .style("z-index", 1000)
                            .style("left", (d3.event.pageX - 275) + "px")
                            .style("top", (d3.event.pageY - 50) + "px")
                            .select("#value")
                            .text("$" + d.totalCost);

                        //Show the tooltip
                        d3.select("#tooltip").classed("hidden", false);
                    })                  
                    .on("mouseout", function() {
                        //Hide the tooltip
                        d3.select(this).style("fill", "#34774D");
                        d3.select("#tooltip").classed("hidden", true);
                    });

              svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0)
                .attr("x", 0-height/2)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Person Id");
          }

            BarChart(data2);
        })
        .fail(function() {
                $('#spinner-modal').modal('hide');
        });
        //   $.getJSON('http://localhost:8080/WebAPI/lite/person/people', function(data2) {
                
        //         GenderPieChart(data2);
        //         AgePieChart(data2);

        //         function GenderPieChart(data2) {
        //             // console.log("Gender");
        //             // console.log(data2);

        //             var genderData = [];
        //             var genderDistr = [0,0];
        //             for (var i = 0, len = data2.length; i < len; i++) {
        //               // console.log(data2[i]);
        //               genderData[len - 1 - i] = data2[i].gender;
        //               // console.log(i);
        //             }

        //             console.log(genderData);

        //             for (var i = 0, len = genderData.length; i < len; i++) {
        //               if (genderData[i] == "MALE"){
        //                 genderDistr[0] += 1;
        //                 console.log("M");
        //               } else if (genderData[i] == "FEMALE"){
        //                 genderDistr[1] += 1;
        //                 console.log("F");
        //               } else {
        //                 console.log(genderData[i]);
        //               }

        //             }
        //             console.log(genderDistr);

        //             var width = 200,
        //                 height = 200,
        //                 radius = Math.min(width, height) / 2;
        //             var donutWidth = 25;

        //             var color = d3.scale.ordinal()
        //                 .range(['#002642', '#3884b7', '#bfd7ea', '#91aec1', '#1d1a31']);

        //             var arc = d3.svg.arc()
        //                 .outerRadius(radius - donutWidth)
        //                 .innerRadius(radius);

        //             var labelArc = d3.svg.arc()
        //                 .outerRadius(radius - 40)
        //                 .innerRadius(radius - 40);

        //             var pie = d3.layout.pie()
        //                 .sort(null)
        //                 .value(function(d) { return d; });

        //             var svg = d3.select("#pie1").append("svg")
        //                 .attr("width", width)
        //                 .attr("height", height)
        //                 .attr("class", "pieChart")
        //               .append("g")
        //                 .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    

        //               var g = svg.selectAll(".arc")
        //                   .data(pie(genderDistr))
        //                 .enter().append("g")
        //                   .attr("class", "arc");

        //               g.append("path")
        //                   .attr("d", arc)
        //                   .style("fill", function(d) { return color(d.value); });

        //               g.append("text")
        //                   .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        //                   .attr("dy", ".35em")
        //                   .text(function(d) { return d.value; });
                    

        //             function type(d) {
        //               d = +d;
        //               return d;
        //             }

        //         }

        //         function AgePieChart(data3) {
        //             // console.log("Age");
        //             // console.log(data2);

        //             var ageData = [];
        //             var ageDistr = [0,0,0,0,0];
        //             for (var i = 0, len = data3.length; i < len; i++) {
        //               // console.log(data2[i]);
        //               ageData[len - 1 - i] = data3[i].age;
        //               // console.log(i);
        //             }

        //             console.log(ageData);

        //             for (var i = 0, len = ageData.length; i < len; i++) {
        //               if (ageData[i] <= 50){
        //                 ageDistr[0] += 1;
        //                 console.log("<30");
        //               } else if (ageData[i] > 50 && ageData[i] <=65){
        //                 ageDistr[1] += 1;
        //                 console.log("30-50");
        //               } else if (ageData[i] > 65 && ageData[i] <=80){
        //                 ageDistr[2] += 1;
        //                 console.log("50-85");
        //               } else if (ageData[i] > 80 && ageData[i] <=95){
        //                 ageDistr[3] += 1;
        //                 console.log("85-100");
        //               } else if (ageData[i] > 95 && ageData[i] <=110){
        //                 ageDistr[4] += 1;
        //                 console.log("100-110");
        //               }else {
        //                 console.log(ageData[i]);
        //               }

        //             }
        //             console.log(ageDistr);

        //             var width = 200,
        //                 height = 200,
        //                 radius = Math.min(width, height) / 2;
        //             var donutWidth = 25;

        //             var color = d3.scale.ordinal()
        //                 .range(['#002642', '#3884b7', '#bfd7ea', '#91aec1', '#1d1a31']);

        //             var arc = d3.svg.arc()
        //                 .outerRadius(radius - donutWidth)
        //                 .innerRadius(radius);

        //             var labelArc = d3.svg.arc()
        //                 .outerRadius(radius - 40)
        //                 .innerRadius(radius - 40);

        //             var pie = d3.layout.pie()
        //                 .sort(null)
        //                 .value(function(d) { return d; });

        //             var svg = d3.select("#pie2").append("svg")
        //                 .attr("width", width)
        //                 .attr("height", height)
        //                 .attr("class", "pieChart")
        //               .append("g")
        //                 .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    

        //               var g = svg.selectAll(".arc")
        //                   .data(pie(ageDistr))
        //                 .enter().append("g")
        //                   .attr("class", "arc");

        //               g.append("path")
        //                   .attr("d", arc)
        //                   .style("fill", function(d) { return color(d.value); });

        //               g.append("text")
        //                   .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        //                   .attr("dy", ".35em")
        //                   .text(function(d) { return d.value; })
        //                   .attr("color", "white");
                    

        //             function type(d) {
        //               d = +d;
        //               return d;
        //             }

        //         }
        // })
        // .fail(function() {
        //         $('#spinner-modal').modal('hide');
        // });

        })
        .fail(function() {
                $('#spinner-modal').modal('hide');
        });

    };

    return DashboardRenderer;
});
