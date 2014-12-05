var currentId=0;
var maxTrials = 6;
var dateStart, dateEnd;
var intervalLoop;
var allowedRefresh = false;
var experimentPlay = false;
var canProceed = true;
var trialData = [];
var numbers1;
var numbers2;
var numbers3;
var numbers4;
var numbers5;
var numbers6;

document.onkeydown=function(e){ 
    if(e.keyCode == 32 && experimentPlay == false)clickedStart();
    else if(e.keyCode == 32 && experimentPlay == true && canProceed == true)clickedEnd();
    
    if(e.keyCode == 38 && experimentPlay == true)updateRotation( 5, 0, 0);;
    if(e.keyCode == 40 && experimentPlay == true)updateRotation( -5, 0, 0);
    
    if(e.keyCode == 37 && experimentPlay == true)updateRotation( 0, -5, 0);
    if(e.keyCode == 39 && experimentPlay == true)updateRotation( 0, 5, 0);
    
    if(e.keyCode == 81 && experimentPlay == true)updateRotation(  0, 0,-5);
    if(e.keyCode == 87 && experimentPlay == true)updateRotation(  0, 0, 5);

};

window.onbeforeunload = function() {
    if (!allowedRefresh) return "Woah! Let's not loose the data now. Don't refresh this page unless you've been told to. :)";
};



function generateTrialData(){
    
    for (var x=0; x<6; x++){
    
    numbers1 = Math.floor((Math.random() * 36) + 0);
    numbers2 = Math.floor((Math.random() * 36) + 0);
    numbers3 = Math.floor((Math.random() * 36) + 0);
    numbers4 = Math.floor((Math.random() * 36) + 0);
    numbers5 = Math.floor((Math.random() * 36) + 0);
    numbers6 = Math.floor((Math.random() * 36) + 0);
   
    if (x<3){
            trialData[x] = "87967744-" + numbers1*10 + "-" +  numbers2*10 + "-" +  numbers3*10 + "-" +  numbers4*10 + "-" +  numbers5*10 + "-" +  numbers6*10
    }
    if (x>3){
        trialData[x] = "67240743-" + numbers1*10 + "-" +  numbers2*10 + "-" +  numbers3*10 + "-" +  numbers4*10 + "-" +  numbers5*10 + "-" +  numbers6*10
    }
   

    
}


for (var y=0; y<6; y++){
    for (var z=0; z<6; z++){
        if (!(y==z)){
            if (trialData[y] == trialData[z]) {
                while (trialData[y] == trialData[z]) {

            numbers1 = Math.floor((Math.random() * 36) + 0);
            numbers2 = Math.floor((Math.random() * 36) + 0);
            numbers3 = Math.floor((Math.random() * 36) + 0);
            numbers4 = Math.floor((Math.random() * 36) + 0);
            numbers5 = Math.floor((Math.random() * 36) + 0);
            numbers6 = Math.floor((Math.random() * 36) + 0);

                var splitTemp = trialData[y].split("-");
                pattern = splitTemp[0];
                    
                    trialData[y] = pattern + "-" + numbers1*10 + "-" +  numbers2*10 + "-" +  numbers3*10 + "-" +  numbers4*10 + "-" +  numbers5*10 + "-" +  numbers6*10
           
                }
                y=0;
                z=0;
            }
        }
    }
}

var m = trialData.length, t, i;

while (m) {
    
    i = Math.floor(Math.random() * m--);
    
    t = trialData[m];
    trialData[m] = trialData[i];
    trialData[i] = t;
    }
}




//user clicks start to begin trial
function clickedStart(){
  
      generateTrialData();
	//get the current pattern
	parsePattern(trialData[currentId],currentPattern);
    experimentPlay = true;
    canProceed = false;
	forceUpdate.right='show';
	forceUpdate.left='show';
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
    canProceed = true;
}

function clickedEnd(){//end button was clicked
    experimentPlay = false;
	recordResults();
    clearInterval(intervalLoop);
	advanceTrial();
}

function recordResults(){
	var elapsedTime = timerOperation(false); //stop clock
	var rotationError = computeRotationError();
    window.parent.document.getElementById('mainLog').value += (currentId + "," + rotationError + "," + elapsedTime + "\n");
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
	if(maxTrials==currentId){//you are done
        allowedRefresh=true;
        window.location.replace('../finish.html');
	}
	else{

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
