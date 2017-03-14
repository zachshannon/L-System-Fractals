// //Canvas set up
var CANVAS_WIDTH = window.innerWidth,
    CANVAS_HEIGHT = window.innerHeight;

var timestep = 1000 / 60, //For game loop timing.
    updateSteps = 0,
    lastFrameTime = 0,
    delta = 0,
    fps = 60, //For fps calculation
    framesThisSecond = 0,
    lastFpsUpdate = 0,
    cameraStep = 20, //For camera stuff
    cameraX = 0,
    cameraY = 0,
    scaleFactor = 0.05;
    scale = 1;

//Add canvas to body.
var canvasElement = $("<canvas width='" + CANVAS_WIDTH +
                      "' height='" + CANVAS_HEIGHT + "'></canvas>");

var ctx = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');

window.addEventListener('keydown', this.doKeyDown, false);
function doKeyDown(e){
  switch (e.keyCode) {
    case 37:
      //Left arrow key
      cameraX += cameraStep;
      break;
    case 38:
      //Up arrow key
      cameraY += cameraStep;
      break;
    case 39:
      //Right arrow key
      cameraX -= cameraStep;
      break;
    case 40:
      //Down arrow key
      cameraY -= cameraStep;
      break;
    case 33:
      //Page up key
      scale += scaleFactor;
      break;
    case 34:
      //Page down key
      scale -= scaleFactor;
      break;
    default: break;
  }
}

//Rules for l system
// Sierpinski Triangle
var rules = {};
var start = "F-G-G"
var rotateBy = 2.0944;
var iterations = 8;
var pathLen = 10;
rules["F"] = "F-G+F+G-F";
rules["G"] = "GG"
//Constants
rules["-"] = "-"
rules["+"] = "+"

// //Koch Curve
// var rules = {};
// var rotateBy = 1.5708;
// var start = "F"
// var iterations = 6;
// var pathLen = 10;
// rules["F"] = "F+F-F-F+F";
// //Constants
// rules["-"] = "-"
// rules["+"] = "+"

// //Dragon curve
// var rules = {};
// var start = "FX"
// var rotateBy = Math.PI/2;
// var iterations = 10;
// var pathLen = 10;
// rules["X"] = "X+YF+";
// rules["Y"] = "-FX-Y"
// //Constants
// rules["-"] = "-"
// rules["+"] = "+"
// rules["F"] = "F"

//Run multiple iterations of rules on a string.
function runIterations(it, axiom){
  var endString = axiom;
  for(var i = 0; i < it; i++){
    endString = runIteration(endString);
  }
  return endString;
}

//Applies rules once to a string
function runIteration(startString){
  var endString = "";
  for(var i = 0, len = startString.length; i < len; i++){
    endString = endString + rules[startString[i]];
  }
  return endString;
}

function drawLSystem(lString, start){
  ctx.beginPath();

  var angle = -Math.PI/2;
  var pos = start;

  this.rotate = function(rotateAngle){
    angle = angle + rotateAngle;
  };

  this.forward = function(units){
    newPos = [(pos[0] + (units * Math.sin(angle))),
              (pos[1] + (units * Math.cos(angle)))];

    ctx.moveTo(pos[0], pos[1]);
    ctx.lineTo(newPos[0], newPos[1]);

    pos = newPos;
  };

  for(var i = 0, len = lString.length; i < len; i++){
    if(lString[i] == "F" || lString[i] == "G"){
      this.forward(pathLen);
    } else if(lString[i] == "B") {
      this.forward(-pathLen);
    } else if(lString[i] == "+") {
      this.rotate(rotateBy);
    } else if(lString[i] == "-") {
      this.rotate(-rotateBy);
    }
  }
  ctx.lineWidth = 1; //<1 controls transparency...
  ctx.stroke();
}

//Like to make a note of performance
var t0 = performance.now();
var myString = runIterations(iterations, start);
var t1 = performance.now();
console.log("Generated l system in " + (t1-t0) + " milliseconds.");

/*
I used
'http://www.isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loo
ps-and-timing'
to learn how to make game loops :)
*/

function update(delta){
//Delta parameter to make velocity time sensitive.
//I've not used this as I am not too bothered right now.
}

function draw(){
  //Clear the screen....
  ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height)
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  //Draw fractal
  ctx.save();
  ctx.fillStyle = "black";
  ctx.scale(scale, scale);
  ctx.translate(cameraX, cameraY);

  drawLSystem(myString, [200,200]);
  ctx.restore();

  //Draw framerate.
  ctx.font = '20px Calibri';
  ctx.fillStyle = 'red';
  ctx.fillText(fps.toFixed(2) + 'fps', 5, 20);
}

function catchUp(){
  delta = 0; //Get rid of the time we've missed.
}

function mainLoop(timestamp){
  //See how much time has passed that needs to be simulated.
  delta += timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  //Compute framerate
  if (timestamp > lastFpsUpdate + 1000) {
      //New framerate - weighted average, use decay parameter.
      decay = 0.25;
      fps = decay * framesThisSecond + (1 - decay) * fps;
      //Record when we updated framerate so we can run again, and reset.
      lastFpsUpdate = timestamp;
      framesThisSecond = 0;
  }
  framesThisSecond++;

  //Run updates until all simulated time required has been carried out.
  while (delta >= timestep) {
    update(timestep);
    delta -= timestep;

    //If we have been behind for 240 of these update steps, we should catch up.
    updateSteps++;
    if(updateSteps >= 240){
      catchUp();
      break;
    }
  }
  update(delta);
  draw();
  requestAnimationFrame(mainLoop);
}

//Start running
//This callback is initiated every time the browser says
//it can change the way the page looks.
requestAnimationFrame(mainLoop)
