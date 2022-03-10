const log = msg => (DEBUG ? console.log(msg) : '');
const select = id => document.getElementById(id);


async function loadJSON(path) {
	let response = await fetch(path);
	let dataset = await response.json(); // Now available in global scope
	return dataset;
}

// Global store 
let store = {
	superhost: 1,
	roomtype:"Entire Home/Apt",
	borough: "Brooklyn",
	cap: 2,
	bathrooms: 1.0,
	bedrooms:2
};

let initID = 1;

let airbnbColor = "#FF5660"
let bgcolor = "#f3e3c6"
let light = "#FFF6E6"
let dark = "#774d2c"

function plotMap(area) {
	let mapConfig = {
		backgroundColor:bgcolor,
		shapes: [
			{
				type: 'zingchart.maps',
				options: {
					name: 'usa_ny',
					items: ['BR','NY','QU','KI','RI'],
					zooming: false,
					panning: false,
					scrolling: false,
					style: {
						controls: {
							visible: false
						},
						items: {
							BR:{label:{text:"Bronx"}, backgroundColor:light, tooltip:{text:"Bronx"}},
							NY:{label:{text:"Manhattan"}, backgroundColor:light, tooltip:{text:"Manhattan"}},
							QU:{label:{text:"Queens"}, backgroundColor:light, tooltip:{text:"Queens"}},
							KI:{label:{text:"Brooklyn"}, backgroundColor:light,tooltip:{text:"Brooklyn"}},
							RI:{label:{text:"Staten Island"}, backgroundColor:light, tooltip:{text:"Staten Island"}}
						},
						borderColor: dark
					}
				}
			}
		]
	}
	if (area == 'Brooklyn') {
		mapConfig["shapes"][0]["options"]["style"]["items"]["KI"]["backgroundColor"] = airbnbColor;
	}
	else if (area == 'Manhattan') {
		mapConfig["shapes"][0]["options"]["style"]["items"]["NY"]["backgroundColor"] = airbnbColor;
	}
	else if (area == 'Queens') {
		mapConfig["shapes"][0]["options"]["style"]["items"]["QU"]["backgroundColor"] = airbnbColor;
	}
	else if (area == 'Bronx') {
		mapConfig["shapes"][0]["options"]["style"]["items"]["BR"]["backgroundColor"] = airbnbColor;
	}
	else {
		mapConfig["shapes"][0]["options"]["style"]["items"]["RI"]["backgroundColor"] = airbnbColor;
	}
	
	zingchart.loadModules('maps, maps-usa_ny', function (e) {
		zingchart.render({
			id: 'nyMap',
			data: mapConfig,
			height: 450,
			width: "100%"
		});
	});
}

function getInput(type) {
	if (type == "superhost") {
		val = document.getElementById("superhost").value
		if (val == "Yes"){
			store["superhost"] = 1
		}
		else {
			store["superhost"] = 0
		}
	}
	else if(type == "roomType") {
		val = document.getElementById("roomType").value
		store["roomtype"] = val
	}
	else if (type == "borough") {
		val = document.getElementById("borough").value
		store["borough"] = val
	}

	else if (type == "cap") {
		val = document.getElementById("capacity").value
		store["cap"] = val
	}

	else if (type=="bathroom"){
		val = document.getElementById("bathroom").value
		store["bathrooms"] = val
	}

	else {
		val = document.getElementById("bedroom").value
		store["bedrooms"] = val
	}
}

function updateKey() {
	let keyLst = [
		store["superhost"].toString(), 
		store["roomtype"],
		store['borough'], 
		store["cap"].toString(),
		Number(store['bathrooms']).toFixed(1),
		store["bedrooms"].toString()
	]
	key = keyLst.join(",");
	return key;
}

function getItem(key, data) {
	if (data.hasOwnProperty(key)) {
		return data[key];
	}
}

function createTr(arr) {
	// create new tr 
	let tr = document.createElement('tr');
	
	// loop over each row 
	for (let i = 0; i < arr.length; i++){

		// create td
		let td = document.createElement('td');
		td.appendChild(document.createTextNode(arr[i]));
		tr.appendChild(td);
	}

	return tr

}

function updateTable(arr) {
	let t_body = document.getElementById('t_body');
	let tr = createTr(arr);
	t_body.appendChild(tr);
}

function updateDashboard(lst) {
	select('avgPirce').innerHTML = '$' + lst[0];
	select('avgScore').innerHTML = lst[1];
	select('avgReview').innerHTML = lst[2];
	select('numAirbnb').innerHTML = lst[3]
}

function plotScatter(price, score){
	values = []
	for (let i = 0; i < price.length; i++) {
		values.push([price[i], score[i]])
	}
	var myConfig = {
		"type": "scatter",
		"plot": {
			"tooltip": {
			  "text": "Price: $%kt  Rating: %vt"
			}
		},
		backgroundColor:bgcolor,
		"title": {
			text: 'Relationship Between Price and Rating'
		},
		'scale-x': {
			label: {
				text: 'Price'
			}
		},
		'scale-y': {
			label: {
				text: 'Rate'
			}
		},
		"series": [{
		  "values": values,
		  "marker": {
			'background-color': airbnbColor,
		  }
		}],
		borderColor: light
	};
	   
	zingchart.render({
		id: 'scatterplot',
		data: myConfig,
		height: 400
	 });
}

function searchResult() {
	initID = initID + 1;
	let k = updateKey();
	plotMap(store['borough']);
	airbnbJson = loadJSON('./data/airbnb_js.json');
	airbnbJson.then(function(data){
		let item = getItem(key, data);
		let superhostStr = ""
		if (store["superhost"] == 0) {
			superhostStr = "No"
		}
		else {
			superhostStr = "Yes"
		}
		let arr = [
			initID,
			superhostStr,
			store['roomtype'],
			store['borough'],
			Number(store['cap']),
			Number(store['bathrooms']).toFixed(1),
			Number(store['bedrooms']).toFixed(1),
			Number(item["avg_price"]).toFixed(2),
			Number(item["avg_score"]).toFixed(2),
			Number(item["avg_num_reviews"]).toFixed(2),
			Number(item["num_airbnb"]),
		]
		plotScatter(item['prices'], item['scores'])
		updateTable(arr)
		updateDashboard([
			Number(item["avg_price"]).toFixed(2),
			Number(item["avg_score"]).toFixed(2),
			Number(item["avg_num_reviews"]).toFixed(2),
			Number(item["num_airbnb"])
		])
		
	})
}

window.onload = function() {
	plotMap("Brooklyn")
	plotScatter([95,169,161,100,250,250,300,140,173,129,97,350,189,150,135,153,109,225,225],
		[4.8,4.81,4.86,4.7,4.9,4.96,4.93,4.85,4.92,4.94,4.75,4.85,4.92,4.0,4.91,4.96,5.0,5.0,5.0])
	
}
