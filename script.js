// Build a converter to convert data types 
var rowConverter = function (d) {
    return {
        date: new Date(d.year),
        count: parseFloat(d['count']),
        sentiment: parseFloat(d['sentiment']),
        song: d.song,
        singer: d.singer,
        line: d.line
    };
};

var promises = [

    d3.csv("https://raw.githubusercontent.com/sabrinamochi/candidates_in_hiphop/master/positive_trump_in_hiphop.csv", rowConverter),
    d3.csv("https://raw.githubusercontent.com/sabrinamochi/candidates_in_hiphop/master/positive_clinton_in_hiphop.csv", rowConverter),
    d3.csv("https://raw.githubusercontent.com/sabrinamochi/candidates_in_hiphop/master/negative_trump_in_hiphop.csv", rowConverter),
    d3.csv("https://raw.githubusercontent.com/sabrinamochi/candidates_in_hiphop/master/negative_clinton_in_hiphop.csv", rowConverter)
];




//Read csv file 
Promise.all(promises).then(function (dataset) {

    // Set the width, height and margin
    var w = document.querySelector("#chart").clientWidth;
    var h = document.querySelector("#chart").clientHeight;
    var margin = { top: 10, right: 50, bottom: 50, left: 50 };



    if (window.matchMedia('screen and (max-width: 414px)').matches) {

        w = document.querySelector("#chart").clientWidth;
        h = document.querySelector("#chart").clientHeight - 100;
        margin = { top: 50, right: 10, bottom: 120, left: 40 };

    }

    var svg = d3.select('#chart')
        .append('g')
        .append('svg')
        .attr('width', w)
        .attr('height', h);


    var candidate = ["Donald Trump", "Hillary Clinton"];

    var menuCandidate = d3.select("#candidateDropdown");

    menuCandidate.append("select")
        .attr("id", "menuCandidate")
        .selectAll("option")
        .data(candidate)
        .enter()
        .append("option")
        .attr("value", function (d, i) { return i; })
        .text(function (d) { return d });

    var selectedCandidate = menuCandidate.select("select")
        .property("value");

    var x_domain = d3.extent(dataset[0], function (d) { return d.date; })

    var xScale = d3.scaleTime()
        .domain(x_domain)
        .range([margin.left, w - margin.right]);

    var yScaleTop = d3.scaleLinear()
        .domain([0, d3.max(dataset[0], function (d) { return d.count; })])
        .range([h / 2, margin.top]);

    var yScaleBottom = d3.scaleLinear()
        .domain([0, d3.max(dataset[2], function (d) { return d.count; })])
        .range([h / 2, h-margin.bottom]);

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(31)
        .tickSize(0)
        .tickFormat(d3.timeFormat("%Y"));

    if (window.matchMedia('screen and (max-width: 414px)').matches) {

        xAxis.ticks(6);

    }

    var yAxisTop = d3.axisLeft()
        .scale(yScaleTop);

    var yAxisBottom = d3.axisLeft()
        .scale(yScaleBottom);


    // Set the position of and create xAxis
    var xTicks = svg.append('g')
        .attr('class', 'xticks')
        .attr('transform', `translate(0, ${h / 2 - margin.top})`)
        .call(xAxis);

    if (window.matchMedia('screen and (max-width: 414px)').matches) {

        xTicks.attr('transform', `translate(0, ${h / 2 -10})`)

    }


    d3.select(".xticks .tick").remove();

    var yTicksTop = svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr('class', 'yticks')
        .call(yAxisTop);

    var yTicksBottom = svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr('class', 'yticks')
        .call(yAxisBottom);

    d3.select("#chart").append("div")
        .attr("id", "positiveLegend")
        .html("Positive Sentiment")
        .style("left", (margin.left+40) + "px")
        .style("top", margin.top+10 + "px");

    d3.select("#chart").append("div")
        .attr("id", "negativeLegend")
        .html("Negative Sentiment")
        .style("left", (margin.left+40) + "px")
        .style("top", h-margin.bottom - 40 + "px");

    // Set the position of and create y label
    svg.append('g')
        .attr('class', 'label')
        .attr("id", "yLabel")
        .append('text')
        .attr('transform', 'translate(' + (margin.left / 4) + ',' + (h / 2 - 10) + ')rotate(-90)')
        .style('text-anchor', 'middle')
        .text('Number')

    svg.append("g")
        .attr("class", "source")
        .append("text")
        .attr("transform", `translate(${margin.left}, ${h - margin.bottom/2})`)
        .html('Data Source: FiveThirtyEight')
        .attr("fill", "white");

    if (window.matchMedia('screen and (max-width: 414px)').matches) {

        d3.select(".source")
            .attr("transform", `translate(0, 30)`);

    }

    svg.append("g")
        .attr("class", "creator")
        .append("text")
        .attr("transform", `translate(${margin.left}, ${h - margin.bottom / 2 +20})`)
        .text("Created by Szu Yu Chen")
        .attr("fill", "white");

    if (window.matchMedia('screen and (max-width: 414px)').matches) {

        d3.select(".creator")
            .attr("transform", `translate(0, 25)`);

    }



    var tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "hoverword");


    var bubbleTop = svg
        .selectAll('circle')
        .data(dataset[0], function (d) { return d.date + "," + d.sentiment + ":" + d.singer + "," + d.song;})
        .enter()
        .append('circle')
        .attr("class", "circle")
        .attr("class", "topCircle")
        .attr('cx', function (d) { return xScale(d.date) })
        .attr('cy', function (d) { return yScaleTop(d.count) })
        .attr('r', function (d) {
            if (window.matchMedia('screen and (max-width: 414px)').matches) {

                return 3

            }

            else {
                return 7;
            }
        })
        .attr('fill', function(d){
            if (+d.sentiment == 1) {
                return '#ffb700';
            }

            if (+d.sentiment == 2) {
                return '#E43200';
            }
            else {
                return 'none';
            }
        })
        .on('mouseover', function (d) {


            var cx = +d3.select(this).attr("cx") + 30;
            var cy = +d3.select(this).attr("cy") - 10;

            if (window.matchMedia('screen and (max-width: 414px)').matches) {

                cx = +d3.select(this).attr("cx") + 5;
                cy = +d3.select(this).attr("cy") - 10;
                document.querySelector(".yticks").style.opacity = "0.2"
                document.getElementById("yLabel").style.opacity = "0.2"

            }
            document.querySelector(".xticks").style.opacity = "0.2"

            d3.select(".hoverword").style("visibility", "visible")
                .style("left", cx + "px")
                .style("top", cy + "px")
                .html('<p> Singer: ' + d.singer + '</br> Song: ' + d.song + '</br> Lyric: ' + d.line + '</p>')


            d3.selectAll(".topCircle").style('opacity', '0.2');
            d3.selectAll(".bottomCircle").style('opacity', '0.2');

            d3.select(this).attr('r', function (d) {
                if (window.matchMedia('screen and (max-width: 414px)').matches) {

                    return 5

                }

                else {
                    return 10;
                }
            })
                .style('opacity', '1');

        })
        .on('mouseout', function (d) {


            if (window.matchMedia('screen and (max-width: 414px)').matches) {


                
                document.querySelector(".yticks").style.opacity = "1"
                document.getElementById("yLabel").style.opacity = "1"

            }

            document.querySelector(".xticks").style.opacity = "1"

            d3.select(this).attr('fill', '#ffb700')
                .attr('r', function (d) {
                    if (window.matchMedia('screen and (max-width: 414px)').matches) {

                        return 3

                    }

                    else {
                        return 7;
                    }
                })

            d3.selectAll(".topCircle").style('opacity', '1');
            d3.selectAll(".bottomCircle").style('opacity', '1');

            d3.select('.hoverword')
                .style('visibility', "hidden");
        });


    var bubbleBottom = svg
        .selectAll('circle')
        .data(dataset[2], function (d) { return d.date + "," + d.sentiment + ":" + d.singer + "," + d.song;})
        .enter()
        .append('circle')
        .attr("class", "circle")
        .attr("class", "bottomCircle")
        .attr('cx', function (d) { return xScale(d.date) })
        .attr('cy', function (d) { return yScaleBottom(d.count) })
        .attr('r', function (d) {
            if (window.matchMedia('screen and (max-width: 414px)').matches) {

                return 3

            }

            else {
                return 7;
            }
        })
        .attr('fill', function (d) {
            if (+d.sentiment == 1) {
                return '#ffb700';
            }

            if (+d.sentiment == 2) {
                return '#E43200';
            }
            else {
                return 'none';
            }
        })
        .on('mouseover', function (d) {


            var cx = +d3.select(this).attr("cx") + 30;
            var cy = +d3.select(this).attr("cy") - 10;

            if (window.matchMedia('screen and (max-width: 414px)').matches) {

                cx = +d3.select(this).attr("cx") + 5;
                cy = +d3.select(this).attr("cy") - 10;
                
                document.querySelector(".yticks").style.opacity = "0.2"
                document.getElementById("yLabel").style.opacity = "0.2"

            }

            document.querySelector(".xticks").style.opacity = "0.2"

            d3.select(".hoverword").style("visibility", "visible")
                .style("left", cx + "px")
                .style("top", cy + "px")
                .html('<p> Singer: ' + d.singer + '</br> Song: ' + d.song + '</br> Lyric: ' + d.line + '</p>')


            d3.selectAll(".topCircle").style('opacity', '0.2');
            d3.selectAll(".bottomCircle").style('opacity', '0.2');

            d3.select(this).attr('r', function (d) {
                if (window.matchMedia('screen and (max-width: 414px)').matches) {

                    return 5

                }

                else {
                    return 10;
                }
            })
                .style('opacity', '1');

        })
        .on('mouseout', function (d) {


            if (window.matchMedia('screen and (max-width: 414px)').matches) {


                
                document.querySelector(".yticks").style.opacity = "1"
                document.getElementById("yLabel").style.opacity = "1"

            }

            document.querySelector(".xticks").style.opacity = "1"

            d3.select(this).attr('fill', '#E43200')
                .attr('r', function (d) {
                    if (window.matchMedia('screen and (max-width: 414px)').matches) {

                        return 3

                    }

                    else {
                        return 7;
                    }
                })

            d3.selectAll(".topCircle").style('opacity', '1');
            d3.selectAll(".bottomCircle").style('opacity', '1');

            d3.select('.hoverword')
                .style('visibility', "hidden");
        });




    menuCandidate.on("change", function () {

        selectedCandidate = d3.select(this)
            .select("select")
            .property("value");

        if (candidate[selectedCandidate] === "Donald Trump") {
            return updateCandidate(dataset[0], dataset[2]);
        }

        else if (candidate[selectedCandidate] === "Hillary Clinton") {
            return updateCandidate(dataset[1], dataset[3]);
        };

    })


    function updateCandidate(data1, data2) {

        // Set the Xaxis domain based on the date column
        x_domain = d3.extent(data1, function (d) { return d.date; })

        // Create scales and axises
        xScale
            .domain(x_domain)
            .range([margin.left, w - margin.right]);

        yScaleTop
            .domain([0, 20])
            .range([h / 2, margin.top]);

        yScaleBottom 
            .domain([0, 16])
            .range([h / 2, h - margin.bottom]);


        xAxis
            .scale(xScale);

        yAxisTop
            .scale(yScaleTop);

        yAxisBottom
            .scale(yScaleBottom);

        xTicks
            .call(xAxis);

        d3.select(".xticks .tick").remove();


        yTicksTop
            .call(yAxisTop);

        yTicksBottom
            .call(yAxisBottom);

        

        var bBottom = svg.selectAll('.bottomCircle')
            .data(data2, function (d) { return d.date + "," + d.sentiment + ":" + d.singer + "," + d.song; })

        bBottom.enter()
            .append('circle')
            .attr("class", "circle")
            .attr("class", "bottomCircle")
            .attr('cx', function (d) { return xScale(d.date) })
            .attr('cy', function (d) { return yScaleBottom(d.count) })
            .attr('r', function (d) {
                if (window.matchMedia('screen and (max-width: 414px)').matches) {

                    return 3

                }

                else {
                    return 7;
                }
            })
            .attr('fill', function (d) {

                if (+d.sentiment == 2) {
                    return '#E43200';
                }
                else {
                    return 'none';
                }
            })
            .merge(bBottom)
            .attr("class", "circle")
            .attr("class", "bottomCircle")
            .attr('cx', function (d) { return xScale(d.date) })
            .attr('cy', function (d) { return yScaleBottom(d.count) })
            .attr('r', function (d) {
                if (window.matchMedia('screen and (max-width: 414px)').matches) {

                    return 3

                }

                else {
                    return 7;
                }
            })
            .attr('fill', function (d) {
                if (+d.sentiment == 2) {
                    return '#E43200';
                }
                else {
                    return 'none';
                }
            })
            .on('mouseover', function (d) {

                var cx = +d3.select(this).attr("cx") + 30;
                var cy = +d3.select(this).attr("cy") - 10;

                if (window.matchMedia('screen and (max-width: 414px)').matches) {

                    cx = +d3.select(this).attr("cx") + 5;
                    cy = +d3.select(this).attr("cy") - 5;

                }

                document.querySelector(".xticks").style.opacity = "0.2"

                d3.select(".hoverword").style("visibility", "visible")
                    .style("left", cx + "px")
                    .style("top", cy + "px")
                    .html('<p> Singer: ' + d.singer + '</br> Song: ' + d.song + '</br> Lyric: ' + d.line + '</p>')


                d3.selectAll(".topCircle").style('opacity', '0.2');
                d3.selectAll(".bottomCircle").style('opacity', '0.2');

                d3.select(this).attr('r', function (d) {
                    if (window.matchMedia('screen and (max-width: 414px)').matches) {

                        return 5;

                    }

                    else {
                        return 10;
                    }
                })
                    .style('opacity', '1');

            })
            .on('mouseout', function (d) {

                document.querySelector(".xticks").style.opacity = "1"

                d3.select(this).attr('fill', function (d) {
                    if (+d.sentiment == 2) {
                        return '#E43200';
                    }
                    else {
                        return 'none';
                    }
                })
                    .attr('r', function (d) {
                        if (window.matchMedia('screen and (max-width: 414px)').matches) {

                            return 3

                        }

                        else {
                            return 7;
                        }
                    })

                d3.selectAll(".topCircle").style('opacity', '1');
                d3.selectAll(".bottomCircle").style('opacity', '1');
                d3.select('.hoverword')
                    .style('visibility', "hidden");
            });

        bBottom.exit().remove();

        var bTop = svg.selectAll('.topCircle')
            .data(data1, function (d) { return d.date + "," + d.sentiment + ":" + d.singer + "," + d.song; })

        bTop.enter()
            .append('circle')
            .attr("class", "circle")
            .attr("class", "topCircle")
            .attr('cx', function (d) { return xScale(d.date) })
            .attr('cy', function (d) { return yScaleTop(d.count) })
            .attr('r', function (d) {
                if (window.matchMedia('screen and (max-width: 414px)').matches) {

                    return 3

                }

                else {
                    return 7;
                }
            })
            .attr('fill', function (d) {

                if (+d.sentiment == 1) {
                    return '#ffb700';
                }

                else {
                    return 'none';
                }
            })
            .merge(bTop)
            .attr("class", "circle")
            .attr("class", "topCircle")
            .attr('cx', function (d) { return xScale(d.date) })
            .attr('cy', function (d) { return yScaleTop(d.count) })
            .attr('r', function (d) {
                if (window.matchMedia('screen and (max-width: 414px)').matches) {

                    return 3

                }

                else {
                    return 7;
                }
            })
            .attr('fill', function (d) {
                if (+d.sentiment == 1) {
                    return '#ffb700';
                }

                else {
                    return 'none';
                }
            })
            .on('mouseover', function (d) {

                var cx = +d3.select(this).attr("cx") + 30;
                var cy = +d3.select(this).attr("cy") - 10;

                if (window.matchMedia('screen and (max-width: 414px)').matches) {

                    cx = +d3.select(this).attr("cx") + 5;
                    cy = +d3.select(this).attr("cy") - 5;

                }

                document.querySelector(".xticks").style.opacity = "0.2"

                d3.select(".hoverword").style("visibility", "visible")
                    .style("left", cx + "px")
                    .style("top", cy + "px")
                    .html('<p> Singer: ' + d.singer + '</br> Song: ' + d.song + '</br> Lyric: ' + d.line + '</p>')


                d3.selectAll(".topCircle").style('opacity', '0.2');
                d3.selectAll(".bottomCircle").style('opacity', '0.2');

                d3.select(this).attr('r', function (d) {
                    if (window.matchMedia('screen and (max-width: 414px)').matches) {

                        return 5;

                    }

                    else {
                        return 10;
                    }
                })
                    .style('opacity', '1');

            })
            .on('mouseout', function (d) {

                document.querySelector(".xticks").style.opacity = "1"

                d3.select(this).attr('fill', function (d) {
                    if (+d.sentiment == 1) {
                        return '#ffb700';
                    }

                    else {
                        return 'none';
                    }
                })
                    .attr('r', function (d) {
                        if (window.matchMedia('screen and (max-width: 414px)').matches) {

                            return 3

                        }

                        else {
                            return 7;
                        }
                    })

                d3.selectAll(".topCircle").style('opacity', '1');
                d3.selectAll(".bottomCircle").style('opacity', '1');

                d3.select('.hoverword')
                    .style('visibility', "hidden");
            });

        bTop.exit().remove();
    }

});





