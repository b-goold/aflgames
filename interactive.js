const $chart = d3.select('.graphic');
const $chartInner = d3.select('.graphic__inner');
const $svg = $chart.select('.graphic__one');
const $selector = document.getElementById('selector');


// A function that set idleTimeOut to null
var idleTimeout

function idled() {
    idleTimeout = null;
}


// const MARGIN = { top: 50, right: 200, bottom: 50, left: 200 };
const MARGIN = {
    top: 10,
    bottom: 30,
    left: 10,
    right: 10
};


function select(selector) {
    d3.selectAll(".line")
        .classed("active", false)
        .classed("inactive", true); //reset any active lines

    var selectedTeam = selector.options[selector.selectedIndex].innerHTML;
    var teamColour = selector.options[selector.selectedIndex].dataset.colour;

    //find the line for the selected team and applying active selection styling
    var activeLine = document.getElementById(selectedTeam);
    activeLine.classList.remove("inactive");
    activeLine.classList.add("active");
    d3.select(activeLine)
        .attr("stroke", teamColour);
}

function resize() {

    const w = $chart.node().offsetWidth - MARGIN.left - MARGIN.right;
    const h = $chart.node().offsetHeight - MARGIN.top - MARGIN.bottom;

    drawChart(w, h);
}


function drawChart(width, height) {

    $svg.selectAll("*").remove();

    //define new svg height and width
    $svg
        .attr('width', width) // + MARGIN.left + MARGIN.right)
        .attr('height', height) // + MARGIN.top + MARGIN.bottom)
        .append('g')
        .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")



    // x axis
    const x = d3.scaleTime()
        .domain([new Date(1897, 0, 1), new Date(2020, 0, 1)])
        .range([50, width - 50]);

    var xAxis = $svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height*1.03})`) //40, height*1.0515
        .call(d3.axisBottom(x)
            .ticks(d3.timeYear.every(10))
            .tickSizeInner(-height * 1.1)
            .tickSizeOuter(0)
            .tickFormat(d3.timeFormat("%Y")))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line"))



    // Y axis
    const y = d3.scaleLinear()
        .domain([1000, 2000])
        .range([height, 0])


    $svg
        .append('g')
        .attr('class', 'y axis')
        .attr("transform", `translate(${0},0)`)
        .call(d3.axisRight(y).ticks(8).tickFormat(d3.format("d"))
            .tickSize(width))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-dasharray", "2,5"))
        .call(g => g.selectAll(".tick text")
            .attr("x", 4)
            .attr("dy", -4))


    // define brushing
    var brush = d3.brushX() // Add the brush feature using the d3.brush function
        .extent([
            [0, 0],
            [width, height]
        ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function




    //--------------- ADD CODE BELOW ------------------ //
    //Load the data
    d3.csv("data/aflgames.csv", function(d) {
            return {
                year: +d.Year,
                date: d.Date,
                round: d.Round,
                team_1: d.Team_1,
                team_2: d.Team_2,
                elo_1_pre: +d.Elo_1_Pre,
                elo_2_pre: +d.Elo_2_Pre,
                elo_1_post: +d.Elo_1_Post,
                elo_2_post: +d.Elo_2_Post
            };
        })
        //Prepare the data to display
        .then(function(data) {
            //Using the processed csv data

            const allTeams = ["Adelaide", "Brisbane Bears", "Brisbane Lions", "Carlton", "Collingwood", "Essendon", "Fitzroy", "Footscray", "Fremantle", "Geelong", "Gold Coast",
                "Greater Western Sydney", "Hawthorn", "Melbourne", "North Melbourne", "Port Adelaide", "Richmond", "South Melbourne", "St Kilda", "Sydney", "University", "West Coast", "Western Bulldogs"
            ];

            //Setting up the filters we want to return
            const allowed = ['team_1', 'team_2', 'year', 'date', 'round', 'elo_1', 'elo_2'];

            //iterate through each team and return each of their results
            allTeams.forEach(function(team) {
                const filtered = data.filter(info => info.team_1 == team || info.team_2 == team);

                //console.log(filtered);

                //Send filtered data to the chart for initial drawing
                drawLine(team, filtered, x, y);
            });

            select($selector); //load the default selected team

            // Add the brushing
            $svg.append("g")
                .attr("class", "brush")
                .call(brush);
        });


    // A function that update the chart for given boundaries
    function updateChart() {

        extent = d3.event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([new Date(1897, 0, 1), new Date(2020, 0, 1)])
        } else {
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            $svg.select(".brush")
                .style("z-index", "999")
                .call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and circle position
        xAxis.transition().duration(1000).call(d3.axisBottom(x))
        $svg
            .selectAll(".line")
            .transition().duration(1000)
            .attr("d", d3.line()
                .x(function(d) {
                    return x(d.date)
                })
                .y(function(d) {
                    return y(d.elo)
                })
            )

    }


    function drawLine(team, filteredData, xScale, yScale) {
        var lineData;
        var mergedData = [];

        console.log("Generating line for " + team + "...");
        var i = 0;

        filteredData.forEach(function(teamData) {
            var date = new Date(teamData.date);
            //if it is a new season, record pre elo
            if (teamData.round == 1) {
                if (teamData.team_1 == team) {
                    mergedData.push({
                        'date': new Date(date.getYear() + 1900, 00, 01),
                        'round': 0,
                        'team': teamData.team_1,
                        'elo': teamData.elo_1_pre
                    });
                } else
                    mergedData.push({
                        'date': new Date(date.getYear() + 1900, 00, 01),
                        'round': 0,
                        'team': teamData.team_2,
                        'elo': teamData.elo_2_pre
                    });
            }

            //get post elo for all other rounds
            if (teamData.team_1 == team) {
                mergedData.push({
                    'date': new Date(teamData.date),
                    'round': teamData.round,
                    'team': teamData.team_1,
                    'elo': teamData.elo_1_post
                });
            } else if (teamData.team_2 == team) {

                mergedData.push({
                    'date': new Date(teamData.date),
                    'round': teamData.round,
                    'team': teamData.team_2,
                    'elo': teamData.elo_2_post
                });
            }
        });

        //console.log("This is the data for " + team + ":");
        //console.log(mergedData);

        //prepare the team line
        var line = d3.line() //translate the line!
            .x(function(d) {
                return xScale(d.date);
            }) // set the x values for the line generator
            .y(function(d) {
                return yScale(d.elo);
            }) // set the y values for the line generator

        //append the path, bind the data, call the line generator
        $svg.append("path")
            .attr("clip-path", "url(#clip)") //this enables brushing
            .datum(mergedData) // 10. Binds data to the line 
            .attr("class", "line inactive") // Assign a class for styling 
            .attr('id', team) //Assign team name for dynamic selection and styling
            .attr("d", line); // 11. Calls the line generator
    };



}




function init() {

    $svg
        .selectAll('graphic')
        .append('graphic');

    window.addEventListener('resize', resize);
    resize();



}

init();