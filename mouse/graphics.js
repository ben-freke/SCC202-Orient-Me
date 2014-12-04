//left canvas graphics 
var t3DLeft_scene, t3DLeft_camera, t3DLeft_renderer;
var t3DLeft_sphere, t3DLeft_material, t3DLeft_mesh;
var t3DLeft_shape, t3DLeft_marker;
var t3DLQuat;
//right canvas graphics
var t3DRight_scene, t3DRight_camera, t3DRight_renderer;
var t3DRight_sphere, t3DRight_material, t3DRight_mesh;
var t3DRight_shape, t3DRight_marker;
var t3DRQuat;
//common variables
var sphRadius = 75;
var currentPattern ={pattern:67240743, xR:40 , yR:160 , zR:90,  xL:40 , yL:165 , zL:90 };
var showOrigin = true;
var forceUpdate = {right:'hide', left:'hide'};
var currentState = {right:'show', left:'show'};

//need to call this after the body element has been loaded.	
function bodyOnLoad(){
	//we are not going to muck about with viewports... we simply create two separate renderers.
	//left canvas renderer initialization and animation function is below

	t3DLeft_init(); //will load something to setup all	
	t3DLeft_animate();
 
	t3DRight_init(); //will load something to setup all
	t3DRight_animate();
}

//force the left canvas to animate
function t3DLeft_animate() {
	requestAnimationFrame( t3DLeft_animate );
	if(forceUpdate.left!=currentState.left){		//there is a change
		triggerUpdate(currentState,forceUpdate,t3DLeft_scene,t3DLeft_shape,t3DLeft_sphere,t3DLeft_material,t3DLQuat,currentPattern,true);
	}
	t3DLeft_renderer.render( t3DLeft_scene, t3DLeft_camera );
}

//force the Right canvas to animate
function t3DRight_animate() {
	requestAnimationFrame( t3DRight_animate );
	if(forceUpdate.right!=currentState.right){		//there is a change
		triggerUpdate(currentState,forceUpdate,t3DRight_scene,t3DRight_shape,t3DRight_sphere,t3DRight_material,t3DRQuat,currentPattern,false);
	}
	t3DRight_renderer.render( t3DRight_scene, t3DRight_camera );
}

function triggerUpdate(oldState, newState, scene, shape, primitive, material, quaternion, pattern,isLeft){
	//there is a change
	if((isLeft?newState.left:newState.right)=='hide'){
		//first remove the shape object
		var shapeHnd = scene.getObjectByName(shape.name);
		scene.remove(shapeHnd);
		if(isLeft) oldState.left = 'hide';
		else oldState.right = 'hide';
		//console.log('Hiding scene');
	}
	else{//forceUpdate.right =='show'
		//add shape object to scene, currentshape is updated to new values
		if(isLeft){
			//console.log(pattern.xL, pattern.yL, pattern.zL);
			t3DLQuat = getQuaternion(pattern.xL, pattern.yL, pattern.zL);
			oldState.left = 'show';
			t3DLeft_shape = addShapeToScene(primitive, material, pattern, scene, t3DLQuat, isLeft);
		}
		else{
			t3DRQuat = getQuaternion(pattern.xR, pattern.yR, pattern.zR);
			oldState.right = 'show';
			t3DRight_shape = addShapeToScene(primitive, material, pattern, scene, t3DRQuat, isLeft);
		}
	}
}
	
//init the Right canvas
function t3DRight_init() {
	//camera
	t3DRight_camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
	t3DRight_camera.position.z = 1200;
	t3DRight_camera.position.x = 100;
	t3DRight_camera.position.y = 100;
	//scene
	t3DRight_scene = new THREE.Scene();

	//lights
	addLights(t3DRight_scene);
	
	//characters-sprites
	//load the texture...
	var t3DRight_Map = THREE.ImageUtils.loadTexture( './GreenTex.png' );
	t3DRight_Map.wrapS = t3DRight_Map.wrapT = THREE.RepeatWrapping;
	t3DRight_Map.anisotropy = 16;
	t3DRight_material = new THREE.MeshLambertMaterial( { ambient: 0xbbbbbb, map: t3DRight_Map, side: THREE.DoubleSide } );
	
	//default primitive
	t3DRight_sphere = new THREE.SphereGeometry( sphRadius, 32, 32 );
	
	//compute the default shape rotation
	t3DRQuat = getQuaternion(currentPattern.xR, currentPattern.yR, currentPattern.zR);

	//actual shape, gets updated from the trial iterator
	t3DRight_shape = addShapeToScene(t3DRight_sphere, t3DRight_material, currentPattern, t3DRight_scene, t3DRQuat, false);
	
	//origin sphere and axes
	drawAxes(t3DRight_scene, showOrigin);
	
	//render scene call
	t3DRight_renderer = new THREE.WebGLRenderer();

	//add the GL window to the web-page	
	var canvasright = document.getElementById("canvasRight");
	//we need to get the h/w of the div that will host the canvas.
	//this height/width param is not easily accessible... 
	//see http://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively 	
	t3DRight_renderer.setSize(canvasright.clientWidth, canvasright.clientWidth);
	canvasright.appendChild(t3DRight_renderer.domElement);
}
//init the left canvas
function t3DLeft_init() {
	//camera
	t3DLeft_camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
	t3DLeft_camera.position.z = 1200;
	t3DLeft_camera.position.y = 100;
	t3DLeft_camera.position.x = 100;
	
	//scene
	t3DLeft_scene = new THREE.Scene();
	
	//lights
	addLights(t3DLeft_scene);

	//characters-sprites
	//load the texture...
	var t3DLeft_Map = THREE.ImageUtils.loadTexture( './GreenTex.png' );
	t3DLeft_Map.wrapS = t3DLeft_Map.wrapT = THREE.RepeatWrapping;
	t3DLeft_Map.anisotropy = 16;
	t3DLeft_material = new THREE.MeshLambertMaterial( { ambient: 0xbbbbbb, map: t3DLeft_Map, side: THREE.DoubleSide } );;
    
	//default primitive
	t3DLeft_sphere = new THREE.SphereGeometry( sphRadius, 32, 32 );
	
	//rotation
	t3DLQuat = getQuaternion(currentPattern.xL, currentPattern.yL, currentPattern.zL);
	
	//actual shape, gets updated from the trial iterator
	t3DLeft_shape = addShapeToScene(t3DLeft_sphere, t3DLeft_material, currentPattern, t3DLeft_scene, t3DLQuat, true);
	
	//origin sphere and axes
	drawAxes(t3DLeft_scene, showOrigin);

	//render scene call
	t3DLeft_renderer = new THREE.WebGLRenderer();
	
	//attach to HTML Div
	var canvasLeft = document.getElementById("canvasLeft");
	t3DLeft_renderer.setSize(canvasLeft.clientWidth, canvasLeft.clientWidth);
	canvasLeft.appendChild(t3DLeft_renderer.domElement);
}

//individual trial related activities
function addShapeToScene(primitive, material,  pattern, scene, quaternion, isLeft){
	var shape = genShape(primitive, material, pattern.pattern); 
	//
	shape.quaternion.copy(quaternion);
	shape.name = isLeft?"left_shape":"right_shape";
	scene.add(shape); //we will iterate through children of scene and remove all...
	return shape;
}

function drawAxes(scene, show){
	var axisHelper = new THREE.AxisHelper(200);
	if(show)
		scene.add(axisHelper);
}

function addLights(scene){
	var light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( 200, 0, 0 ).normalize();
	scene.add( light );
	
	var light2 = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light2.position.set( 0,200, 200 ).normalize();
	scene.add( light2 );
	
	var ambLight = new THREE.AmbientLight(0x404040);
	scene.add(ambLight);
}

function getQuaternion(xr, yr, zr){
	var q = new THREE.Quaternion;	
	q.setFromAxisAngle(new THREE.Vector3(1,0,0), xr*Math.PI/180.0);
	
	var temp = new THREE.Quaternion;
	temp.setFromAxisAngle(new THREE.Vector3(0,1,0), yr*Math.PI/180.0);
	
	q.multiply(temp);
	temp.setFromAxisAngle(new THREE.Vector3(0,0,1), zr*Math.PI/180.0);
	q.multiply(temp);
	
	return q;
}

function genShape(primitive, material, pattern){
	var LAYERS = 3;
	var ty,tz,tx;
	ty =tz = tx= -0*sphRadius;
	var shape = new  THREE.Object3D();
	for(var y=0;y<LAYERS;y++){
		for(var x=0;x<LAYERS;x++){
			for(var z=0;z<LAYERS;z++){
				if(isSphere(pattern, x,y,z)){ 
					//draw a sphere here...
					var sph = new THREE.Mesh(primitive, material);
					sph.position.set(JMP(x,sphRadius)+tx,JMP(y,sphRadius)+ty,JMP(z,sphRadius)+tz);
					shape.add(sph);
					//intermediates
				
					if(y>0 && isSphere(pattern,x,y-1,z)){//look down
						var sphY = new THREE.Mesh(primitive, material);
						//console.log("Intermediates");
						sphY.position.set(JMP(x,sphRadius),JMPi(y,sphRadius),JMP(z,sphRadius));
						shape.add(sphY);							
					}
					if(x>0 && isSphere(pattern,x-1,y,z)){//look back
						var sphX = new THREE.Mesh(primitive, material);
						sphX.position.set(JMPi(x,sphRadius),JMP(y,sphRadius),JMP(z,sphRadius));
						shape.add(sphX);
					}
					if(z>0 && isSphere(pattern,x,y,z-1)){//look left?
						var sphZ = new THREE.Mesh(primitive, material);
						sphZ.position.set(JMP(x,sphRadius),JMP(y,sphRadius),JMPi(z,sphRadius));
						shape.add(sphZ);
					}
				}
			}
		}
	}//done with the shape
	return shape;
}

function isSphere(pattern, x, y, z){
	var chkPat = (1<<(z*9+8-(y+x*3)));
	return ((chkPat&pattern)!=0);

}

function JMP(step,rad){return 4*step*rad-4*rad;} //the -4*rad positions the sphere wrt origin 
function JMPi(step,rad){return 4*(step-0.5)*rad-4*rad;}
