var currentId=0;
var maxTrials = 6;
var dateStart, dateEnd;
var intervalLoop;
var allowedRefresh = false;

window.onbeforeunload = function() {
    if (!allowedRefresh) return "Woah! Let's not loose the data now. Don't refresh this page unless you've been told to. :)";
};

//user clicks start to begin trial
function clickedStart(){
	//get the current pattern
	parsePattern(trialData[currentId],currentPattern);
	forceUpdate.right='show';
	forceUpdate.left='show';
	document.getElementById('btnStart').disabled = true; //disable start button
	disableButtons(false); //not disable
	timerOperation(true); //start clock
    intervalLoop = setInterval(recordResults,100);
}

function parsePattern(unparsedStr, patSet){
	var spl = unparsedStr.split("-");
	var i=0;
	patSet.pattern = spl[i++];
	patSet.xL = spl[i++];
	patSet.yL = spl[i++];
	patSet.zL = spl[i++];
	patSet.xR = spl[i++];
	patSet.yR = spl[i++];
	patSet.zR = spl[i++];
}

//+/- buttons are enabled
function disableButtons(state){
	document.getElementById('xDn').disabled = state;
	document.getElementById('yDn').disabled = state;
	document.getElementById('zDn').disabled = state;
	document.getElementById('xUp').disabled = state;
	document.getElementById('yUp').disabled = state;
	document.getElementById('zUp').disabled = state;
}

//if +/- buttons are pressed, rotation needs to change
//we apply global rotation and not local rotation
function updateRotation(xRot, yRot,zRot){
//the rotation is in terms of absolute rotation, so note the quaternion rotation order
	var q = getQuaternion(xRot, yRot, zRot);// get rotation provided by current interaction
	
	q.multiply(t3DRQuat); //apply to existing orientation	
	q.normalize();		  //keep the quaternion normalized... accrual of rounding errors causes drift
	t3DRQuat.copy(q);	  //copy the new orientation into t3DRQuat
	
	t3DRight_shape.quaternion.copy(q); 	//apply orientation to shape
	//if there has been one update, then we can enable the end button
	if(document.getElementById('btnEnd').disabled) document.getElementById('btnEnd').disabled = false;
}

function clickedEnd(){//end button was clicked
	recordResults();
    clearInterval(intervalLoop);
	disableButtons(true); //disable then
	advanceTrial();
}

function recordResults(){
	var elapsedTime = timerOperation(false); //stop clock
	var rotationError = computeRotationError();
	console.log(currentId + "," + rotationError + "," + elapsedTime);
}

function computeRotationError(){
	var a = new THREE.Vector3( 1, 0, 0 );
	a.applyQuaternion(t3DRQuat);

	var b = new THREE.Vector3( 1, 0, 0 );
	b.applyQuaternion(t3DLQuat);

	var c = Math.abs(Math.acos(a.dot(b)));

	return c;
}



function advanceTrial(){
	currentId++;
	document.getElementById('btnEnd').disabled = true; //disable end button
	if(maxTrials==currentId){//you are done
        allowedRefresh=true;
        window.location.replace('../next.html');
		document.getElementById('btnStart').disabled = true; //also disable start button
	}
	else{
		document.getElementById('btnStart').disabled = false; //else enable it
	}
	forceUpdate.right='hide';
	forceUpdate.left ='hide';
}

function timerOperation(started){
	if(started)
		dateStart = new Date();
	else{
		dateEnd = new Date();
		var delta = dateEnd.getTime() - dateStart.getTime(); //tells us elapsed time
		return delta;
	}
}

//TRIAL DATA SET
//SETUP:
//each datapoint string consists of <pattern>-<xl>-<yl>-<zl>-<xr>-<yr>-<zr> 
//the xl,yl,zl triplet defines the left object's rotation, while the remaining three define the right object's rotation
//trial data 24 data points, 12 of pattern 1, 12 of pattern 2, out of the 12, there are 6 unique left rotations.
//for each unique left rotation, there are two different right rotation options
//USAGE:
//present 3 of pattern 1 and 3 of pattern 2 per condition for each user
//randomize the order of presentation 
//don't repeat any one single datapoint for a single user (repeats across users are ok as long as the whole data set doesn't repeat)
 var trialData = ['87967744-0-110-70-110-10-120', '87967744-0-110-70-140-120-70',  '87967744-10-210-90-110-10-120', 
				  '87967744-10-210-90-60-60-140', '87967744-110-40-110-20-170-30', '87967744-110-40-110-30-100-140', 
				  '87967744-140-120-70-10-210-90','87967744-140-120-70-90-110-70', '87967744-40-160-70-110-40-110', 
				  '87967744-40-160-70-80-10-150', '87967744-90-110-70-110-10-120', '87967744-90-110-70-140-120-70', 
				  '67240743-0-120-120-20-80-140', '67240743-0-120-120-60-60-150',  '67240743-10-60-180-20-80-140', 
				  '67240743-10-60-180-80-30-160', '67240743-20-60-170-30-120-120', '67240743-20-60-170-90-80-100', 
				  '67240743-30-120-90-20-150-100','67240743-30-120-90-80-30-160',  '67240743-50-130-90-20-0-170', 
				  '67240743-50-130-90-50-80-100', '67240743-60-60-150-20-0-170',   '67240743-60-60-150-50-130-90'];