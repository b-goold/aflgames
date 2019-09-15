//Set up svg canvas and axes


//Load the data
d3.csv("data/aflgames.csv", function(d) {
        return {
            year: d.Year,
            round: d.Round,
            team_1: d.Team_1,
            team_2: d.Team_2,
            elo_1: d.Elo_1_Post,
            elo_2: d.Elo_2_Post
        };
    })
    //Prepare the data to display
    .then(function(data) {
        //Using the processed csv data
        //console.log(data);

        const allTeams = ["Adelaide", "Brisbane Bears", "Brisbane Lions", "Carlton", "Collingwood", "Essendon", "Fitzroy", "Footscray", "Fremantle", "Geelong", "Gold Coast",
            "Greater Western Sydney", "Hawthorn", "Melbourne", "North Melbourne", "Port Adelaide", "Richmond", "South Melbourne", "St Kilda", "Sydney", "University", "West Coast", "Western Bulldogs"
        ];

        //Setting up the filters we want to return
        const allowed = ['team_1', 'team_2', 'year', 'round', 'team_1', 'team_2', 'elo_1', 'elo_2'];

        //iterate through each team and return each of their results
        allTeams.forEach(function(team) {
            const filtered = data.filter(info => info.team_1 == team || info.team_2 == team);

            //console.log(filtered);

            //Send filtered data to the chart for initial drawing
            drawLine(team, filtered);
        });
    });

function drawLine(team, teamData) {
    console.log("Generating line for " + team + "...");

};