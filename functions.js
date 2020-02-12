/*
Assuming the data is in a mongodb database similar to:

User collection
{
	participant_id: 42,
	first_name: "John",
	last_name: "Doe",
	date_partipated: 451231
}

Data collection
{
	participant_id: 42,
	fail_time: 3,
	speed: [],
	gas: [],
	LateralData: {
		LateralPos: [],
		MeanLateral: x,
		SDLP: y
	},
	steering: {
		start: index,
		stop: index,
		length: x,
		direction: 0/1,
		data: [],
		cosineApprox = {[],[]}
	},
	posX: [],
	posZ: [],
	intersection: [],
	nodeX: [],
	nodeZ: [],
	nodeAngle: []
},
{

}
*/
module.exports = {



//verified
mean: function(dataArray) {
	let sum = 0;
	for (let i = 0; i < dataArray.length; i++) {
		sum += dataArray[i];
	}
	return sum / dataArray.length;
},

//verified
standardDev: function(dataArray) {
	let dataMean = this.mean(dataArray);
	let sum = 0;
	for (let i = 0; i < dataArray.length; i++) {
		let diff = dataArray[i] - dataMean;
		sum += Math.pow(diff, 2);
	}
	
	averageSum = sum / dataArray.length;
	
	return Math.sqrt(averageSum);
},

//needs tested
rootMeanSquare: function(input, curve) {
	/*
		Assuming input is y data and curve is yhat and that the length of both is the same.
		(Which I can guarantee as it will be the cut out length of data in which the turn curve is created for)
	*/

	let sum = 0;
	for (let i = 0; i < input.length; i++) {
		sum += Math.pow((curve[i] - input[i]), 2);
	}
	sum = sum / input.length;
	return Math.sqrt(sum);

},

processData: function(testData) {

	var splitPoints = [];
	for (var i = 0; i < testData["Speed"].length; i++) {
		if (testData["Speed"][i] == "New Fail") {
			splitPoints.push(i);
		}
	}
	//console.log(splitPoints);

	for (key in testData) {
		var processedData = [];
		firstSplit = testData[key].slice(0, splitPoints[0]);
		processedData.push(firstSplit);
		for (var i = 1; i < splitPoints.length; i++) {
			//first one is 0 - first point
			//last one is last point to 
			split = testData[key].slice(splitPoints[i - 1] + 1, splitPoints[i]);
			processedData.push(split);
		}
		for (var i = 0; i < processedData.length; i++) {
			for (var j = 0; j < processedData[i].length; j++) {
				if (key != "Intersection") {

					processedData[i][j] = parseFloat(processedData[i][j]);
				} else {
					if (processedData[i][j] == "out of intersection") processedData[i][j] = 0;
					else processedData[i][j] = 1;
				}
			}
		}
		testData[key] = processedData;

	}
	var objArray = [];
	for (var i = 0; i < testData["Speed"].length; i++) {
		let obj = {};
		for (key in testData) {
			obj[key] = testData[key].shift();
			if (key == "Fail Time") obj[key] = obj[key][0];
		}
		objArray.push(obj);
	}

	return objArray;
},



calcDecel: function(speed, playerX, playerZ) {
	const DATA_RATE = .15; // 150 ms = .15 seconds
	const MPHtoFTS = 1.4666666667;

	//speed is in mph and measured every 150 ms
	//console.log(speed);
	//first need to find when the driver was decelerating
	var boolSaving = false;
	var startPoint;

	var sections = [];
	var playerXsections = [];
	var playerZsections = [];

	for (var i = 1; i < speed.length - 1; i++) {
		if (speed[i] < speed[i-1] && !boolSaving && speed[i] > 0.25) {
			//decelerating!
			startPoint = i-1;
			boolSaving = true;
		}
		if ((boolSaving && speed[i] < 0.25) || (boolSaving && speed[i] > speed[i-1])) {
			//consider them stopped or || they stopped decelerating and sped up!
			//either way split the array for the first deceleration period
			sections.push(speed.slice(startPoint, i + 1));
			playerXsections.push(playerX.slice(startPoint, i+1));
			playerZsections.push(playerZ.slice(startPoint, i+1));
			boolSaving = false;
		}
		//might consider saving the last deceleration period as well?
	}

	//if sections of deceleration are less than a second throw them out of the calculation
	for (var i = sections.length - 1; i >= 0; i--) {
		if (sections[i].length < 7) {
			sections.splice(i, 1); //splice removes elements from the middle of the array, in this case 1 element
			playerXsections.slice(i, 1);
			playerZsections.slice(i, 1);
		}
	}

	//console.log(sections);
	//new obj to store both decelerations
	var returnDecelObj = {};

	var decelerations = [];
	for (var i = 0; i < sections.length; i++) {
		//find duration period
		var durationSeconds = sections[i].length * DATA_RATE;
		var speedDiffMPH = sections[i][0] - sections[i][sections[i].length - 1];
		var speedDiffFPS = speedDiffMPH * MPHtoFTS;

		var decelFPSPS = speedDiffFPS / durationSeconds;
		decelerations.push(decelFPSPS);
	}

	var meanDecelerations = this.mean(decelerations);
	returnDecelObj["meanDecelSpeedBased"] = meanDecelerations;

	//new method include Dr. Arslanyilmaz's technique
	var decelDistanceBased = [];
	for (var i = 0; i < sections.length; i++) {
		// for each section find distance, use length to find time
		// then calculate based on formula distance / s^2
		var diffX = playerXsections[i][playerXsections[i].length-1] - playerXsections[i][0];
		var diffZ = playerZsections[i][playerZsections[i].length-1] - playerZsections[i][0];
		var distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffZ, 2));

		var time = sections.length * DATA_RATE;
		var decelDistance = distance / (Math.pow(time, 2));
		decelDistanceBased.push(decelDistance);
	}

	var meanDistanceBased = this.mean(decelDistanceBased);
	returnDecelObj["meanDecelDistanceBased"] = meanDistanceBased;

	return returnDecelObj;
},

//takes playerX array, playerZ array, nodeX array, nodeZ array returns an array of lateral distances
lateralPosition: function(playerX_Array, playerZ_Array, nodeX_Array, nodeZ_Array) {

	//return array
	var lateralDistance = [];

	//must have two nodes to find the lateral distance
	//so first find the second ever node
	var firstNodeX = nodeX_Array[0];
	var firstNodeZ = nodeZ_Array[0];

	var previousNodeX = firstNodeX;
	var previousNodeZ = firstNodeZ;

	var currentNodeX = firstNodeX;
	var currentNodeZ = firstNodeZ;

	var lastUnknown = 0;

	//for every player point, using the current node and the previous node to find the closest point on the line between those two points

	for (var i = 0; i < playerX_Array.length; i++) {
		if (nodeX_Array[i] != firstNodeX) { //if past the first node
			if (currentNodeX != nodeX_Array[i] || currentNodeZ != nodeZ_Array[i]) {
				//on a new node so move the nodes forward
				previousNodeX = currentNodeX;
				previousNodeZ = currentNodeZ;

				currentNodeX = nodeX_Array[i];
				currentNodeZ = nodeZ_Array[i];
			}
			
			////console.log("previous pair", previousNodeX, ", " , previousNodeZ);
			////console.log("current pair", currentNodeX, ", " , currentNodeZ);
			////console.log("Car location", playerX_Array[i], ", " , playerZ_Array[i]);
			////console.log("formula slope b", slope, ", " , b);
			//nodes should be properly selected

			//have (x1,y1) (x2,y2) now calculate y = mx+b 
			//var slope = (y1 - y2) / (x1 - x2);
			//var b = y1 - slope * x1;
			var slope = (currentNodeZ - previousNodeZ) / (currentNodeX - previousNodeX);
			var b = currentNodeZ - slope * currentNodeX;
			//formula for the road centerline = y = slope x + b

			//now find perpendicular line in which the location of the car is on
			var inverseSlope = -1 * (1 / slope);
			var carB = playerZ_Array[i] - inverseSlope * playerX_Array[i];
			//formula for the perpendicular line through the car is y = inverseSlope x + carB

			//let y2 = m2 x2 + b2 be y = inverseSlope x + carB
			//let y1 = m1 x1 + b1 be y = slope x + b
			//formula derived from the intersection of two lines
			var intersectionPointX = (carB - b ) / (slope - inverseSlope);

			//plug into either y = mx + b formulas
			var intersectionPointZ = slope * intersectionPointX + b;
			var intersectionPointZTest = inverseSlope * intersectionPointX + carB;
			////console.log("intersection point test", intersectionPointX, intersectionPointZ, intersectionPointZTest);

			//now the distance at the intersectionPoint to the car location is the shortest distance & the lateral position
			//distance formula based on c^2 = a^2 + b^2
			//let (x1,y1) be the location of the car, (x2,y2) be the intersection point
			var distance = Math.sqrt(Math.pow(intersectionPointZ - playerZ_Array[i], 2) + Math.pow(intersectionPointX - playerX_Array[i], 2));
			lateralDistance.push(distance);
			

		} else {
			lastUnknown = i;
			lateralDistance.push(-999999); //flag value for invalid there is not two nodes to find road centerline
		}
	}
	var validArray = lateralDistance.slice(lastUnknown+1, lateralDistance.length);

	var returnObj = {};
	returnObj["LateralPos"] = validArray;
	returnObj["MeanLateral"] = this.mean(validArray);
	returnObj["SDLP"] = this.standardDev(validArray);

	return returnObj;
	////console.log("Lateral position array", validArray);
	//console.log("Mean of lateral position", mean(validArray));
	//console.log("Standard deviation of lateral position", standardDev(validArray));
},

scaleValues: function(minV, maxV, value) {
	var valueRange = maxV - minV
	return value / valueRange
},

cosineInterpolation: function(y1, y2, mu) {
	var mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
	return y1 * (1 - mu2) + y2 * mu2
},

//starting y value then ending value, duration of lenth
buildCosArr: function(y1, y2, length) {
	var returnArr = [];
	var mu;
	for (var i = 0; i < length; i++) {
		if (length != 1) {
			mu = this.scaleValues(0, length - 1, i);
		} else {
			mu = i;
		}
		returnArr.push(this.cosineInterpolation(y1, y2, mu));
	} 
	return returnArr
},

genCurvesAndError: function(steeringData) {
		/*
	build the data obj 
	drivingDataObj = {
		start = index
		stop = index
		length = val
		direction = direction[]
		turnData = []
		cosineApprox = [[],[]]
		error = [] 
	} 
	*/
	var drivingDataObj = this.determineTurns(steeringData);

	drivingDataObj["cosineApprox"] = [];
	drivingDataObj["error"] = [];
	
	for (var i = 0; i < drivingDataObj.start.length; i++) {
		//for every turn in the obj find cosine wave, and error

		var midpoint = Math.floor(drivingDataObj.length[i] / 2);
		var turnData = drivingDataObj["turnData"].slice(drivingDataObj.start[i], drivingDataObj.end[i] + 1);
		var peak = this.max(turnData);

		if (drivingDataObj.direction[i] == -1) {
			peak = this.min(turnData);
		} 

		var leftSide = this.buildCosArr(0, peak, midpoint + 1);
		//console.log("peak", peak)
		//console.log("midpoint", midpoint)
		////console.log("leftSide", leftSide)

		var rightSide = this.buildCosArr(peak, 0, drivingDataObj["length"][i] - midpoint + 2)

		////console.log("actual length", drivingDataObj["length"][i]);
		////console.log("generated length", drivingDataObj["length"][i]);

		var cosineCurve = leftSide.concat(rightSide);
		////console.log("concat length", cosineCurve.length - 2);
		////console.log("turnData length", turnData.length);

		//delete the leading and final 0
		cosineCurve.shift();
		cosineCurve.pop();

		drivingDataObj["cosineApprox"] = cosineCurve;
		var error = this.rootMeanSquare(turnData, cosineCurve);
		drivingDataObj["error"].push(error);
	}

	return drivingDataObj;
},

determineTurns: function(steeringData) {
	var boolStarted = false;
	var start = [];
	var end = [];
	var length = [];
	var direction = []; //1 if left -1 of rit
	var turnCount = 0;
	for (var i = 0; i < steeringData.length; i++) {
		if (steeringData[i] > 0.15 || steeringData < -0.15) {
			if (!boolStarted) {
				start[turnCount] = i;
				boolStarted = true;
				direction[turnCount] = 1;
				if (steeringData[i] < -0.15) direction[turnCount] = -1;
			}
		} else if (boolStarted) {
			//stop
			end[turnCount] = i - 1;
			boolStarted = false;
			length[turnCount] = end[turnCount] - start[turnCount];
			turnCount += 1;
			
		}
	}
	//should it include turning at the end of the simulation?
	if (boolStarted) {
		start.pop();
		direction.pop();
	}
		
	var steeringDataObj = {
		"start": start,
		"end": end,
		"length": length,
		"direction": direction,
		"turnData": steeringData
	};

	return steeringDataObj;

},

max: function(array) {
	var max = array[0];
	for (var i = 1; i < array.length; i++) {
		if (max < array[i]) max = array[i];
	}
	return max;
},

min: function(array) {
	var min = array[0];
	for (var i = 1; i < array.length; i++) {
		if (min > array[i]) min = array[i];
	}
	return min;
}
}
//processData(testData);
//console.log(cleanedData);
//console.log("Mean Deceleration", calcDecel(cleanedData["Speed"][1]));

//lateralPosition(cleanedData["Player PositionX"][1], cleanedData["Player PositionZ"][1], cleanedData["Current/Next-Node-Pos-X"][1], cleanedData["Current/Next-Node-Pos-Z"][1]);

//console.log(genCurvesAndError(determineTurns(cleanedData["Steering"][1])));