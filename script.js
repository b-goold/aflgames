//Set up svg canvas and axes


//Load the data
d3.csv("data/aflgames.csv", function(d) {
        return {
            year: +d.Year,
            round: +d.Round,
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
            drawLine(team, filtered);
        });
    });

function drawLine(team, filteredData) {
    var lineData;
    var mergedData = [];

    console.log("Generating line for " + team + "...");

    filteredData.forEach(function(teamData) {
		//if it is a new season, record pre elo
        if (teamData.round == 1) {
			if(teamData.team_1 == team) {
            mergedData.push({
                'year': teamData.year,
                'round': 0,
                'team': teamData.team_1,
				'elo': teamData.elo_1_pre
            });
        }
		else
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

    console.log("This is the data for " + team + ":");
    console.log(mergedData);
};