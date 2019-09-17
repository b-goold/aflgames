//Set up svg canvas and axes
//prepare the canvas

//set up the svg dimensions and margins
var margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    },
    //width = "calc(100% -" & (margin.left - margin.right) & "px)",
    width = 1000 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

//add the svg
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Load the data
d3.csv("data/aflgames.csv", function(d) {
        return {
            year: +d.Year,
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

        //set up the axes
        //calculate the max x and y values for the chart
        var xMax = Math.max.apply(Math, data.map(function(i) {
            return i.year
        }));
        var xMin = Math.min.apply(Math, data.map(function(i) {
            return i.year
        }));
        var xScale = d3.scaleLinear()
            .domain([xMin, xMax]) // input
            .range([0, width]); // output

        var yMax;
        if (Math.max.apply(Math, data.map(function(i) {
                return i.elo_1_post
            })) > Math.max.apply(Math, data.map(function(i) {
                return i.elo_2_post
            })))
            yMax = Math.max.apply(Math, data.map(function(i) {
                return i.elo_1_post
            })) * 1.1 //10% headroom
        else
            yMax = Math.max.apply(Math, data.map(function(i) {
                return i.elo_2_post
            })) * 1.1 //10% headroom

        var yMin;
        if (Math.min.apply(Math, data.map(function(i) {
                return i.elo_1_post
            })) > Math.min.apply(Math, data.map(function(i) {
                return i.elo_2_post
            })))
            yMin = Math.min.apply(Math, data.map(function(i) {
                return i.elo_1_post
            })) * 0.9 //10% headroom
        else
            yMin = Math.min.apply(Math, data.map(function(i) {
                return i.elo_2_post
            })) * 0.9 //10% headroom

        var yScale = d3.scaleLinear()
            .domain([yMin, yMax]) // input 
            .range([height, 0]); // output

        //draw the axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft


        //console.log(data);

        const allTeams = ["Adelaide", "Brisbane Bears", "Brisbane Lions", "Carlton", "Collingwood", "Essendon", "Fitzroy", "Footscray", "Fremantle", "Geelong", "Gold Coast",
            "Greater Western Sydney", "Hawthorn", "Melbourne", "North Melbourne", "Port Adelaide", "Richmond", "South Melbourne", "St Kilda", "Sydney", "University", "West Coast", "Western Bulldogs"
        ];

        //Setting up the filters we want to return
        const allowed = ['team_1', 'team_2', 'year', 'round', 'elo_1', 'elo_2'];

        //iterate through each team and return each of their results
        allTeams.forEach(function(team) {
            const filtered = data.filter(info => info.team_1 == team || info.team_2 == team);

            //console.log(filtered);

            //Send filtered data to the chart for initial drawing
            drawLine(team, filtered, xScale, yScale);
        });
    });

function drawLine(team, filteredData, xScale, yScale) {
    var lineData;
    var mergedData = [];

    console.log("Generating line for " + team + "...");

    filteredData.forEach(function(teamData) {
        //if it is a new season, record pre elo
        if (teamData.round == 1) {
            if (teamData.team_1 == team) {
                mergedData.push({
                    'year': teamData.year,
                    'round': 0,
                    'team': teamData.team_1,
                    'elo': teamData.elo_1_pre
                });
            } else
                mergedData.push({
                    'year': teamData.year,
                    'round': 0,
                    'team': teamData.team_2,
                    'elo': teamData.elo_2_pre
                });
        }

        //get post elo for all other rounds
        if (teamData.team_1 == team) {
            mergedData.push({
                'year': teamData.year,
                'round': teamData.round,
                'team': teamData.team_1,
                'elo': teamData.elo_1_post
            });
        } else if (teamData.team_2 == team) {

            mergedData.push({
                'year': teamData.year,
                'round': teamData.round,
                'team': teamData.team_2,
                'elo': teamData.elo_2_post
            });
        }
    });

    //console.log("This is the data for " + team + ":");
    //console.log(mergedData);

    //prepare the team line
    var line = d3.line()
        .x(function(d) {
            return xScale(d.year);
        }) // set the x values for the line generator
        .y(function(d) {
            return yScale(d.elo);
        }) // set the y values for the line generator

    //append the path, bind the data, call the line generator
    svg.append("path")
        .datum(mergedData) // 10. Binds data to the line 
        .attr("class", "line") // Assign a class for styling 
        .attr("d", line); // 11. Calls the line generator
};