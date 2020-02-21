// Vertex Shader written in GLSL:
const VSHADER_SOURCE = [
    'precision mediump float;',
    'attribute vec4 a_Position;',
    'attribute vec3 a_Color;',
    'uniform mat4 u_ModelMatrix;',
    'varying vec3 fragmentColor;',
    '',
    'void main()',
    '{',
    '   fragmentColor = a_Color;',
    '   gl_Position = u_ModelMatrix * a_Position;',
    '}'
].join('\n');

// Fragment Shader written in GLSL:
const FSHADER_SOURCE = [
    'precision mediump float;',
    'varying vec3 fragmentColor;',
    'void main()',
    '{',
    '   gl_FragColor = vec4(fragmentColor, 1.0);',
    '}'
].join('\n');

// Scale Step (factor per second bacteria will grow: currentSizeOfCircle * (1 + SCALE_STEP)
var SCALE_STEP = 0.01;

// Dimensions for the shapes drawn on the WebGL canvas
const VERTEX_DIMENSIONS = 2; // x, y
const COLOUR_DIMENSIONS = 3; // R, G, B

// Scale of the background dish relative to the canvas
const DISH_SCALE = 0.90; // 90% of canvas width/height

// Global Variables to keep track of player score & game state
var playerScore = 0.0;
var gamePaused = false;
var gameLost = false;
var bacteriaCenters = [];
var currentBacteriaSize = 0.0; //Distance from center of bacteria to edge (ie. the radius)
// Set the current starting scale factor for the bacteria
var currentScale = 0.05;


function main() {
    // Retrieve <canvas> element
    let canvas = document.getElementById('gameCanvas');

    // Get the rendering context for WebGL
    let gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Specify the background color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Initialize shaders + WebGL program
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get storage location of u_ModelMatrix
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Model matrix
    var modelMatrix = new Matrix4();

    // Generate initial locations of bacteria along circumference of dish:
    bacteriaCenters = generateBacteriaStartLocations();
    var bacteriaColors = generateBacteriaColors();

    // Define the Main Game Loop:
    function tick() {
        if(!gamePaused){
            currentScale = animate(currentScale);  // Update the bacteria scale
            draw(gl, currentScale, modelMatrix, u_ModelMatrix, bacteriaCenters, bacteriaColors);   // Draw the shapes
        }
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    }
    //Start drawing
    tick();

}


/**
 * Utility function to determine the start locations for the bacteria.
 * @returns {[]}        An array of vertices in the form x1, y1, x2, y2, ... xn, yn where each x and y are along the
 *                      circumference of the back dish.
 */
function generateBacteriaStartLocations(){

    var bacteriaCenters = [
        //x, y
    ];
    for (var i = 0; i < 10; i++){
        var j = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180;
        var centerX = Math.sin(j).toFixed(2) * DISH_SCALE;
        var centerY = Math.cos(j).toFixed(2) * DISH_SCALE;
        bacteriaCenters = bacteriaCenters.concat(centerX);
        bacteriaCenters = bacteriaCenters.concat(centerY);
    }
    console.log("Bacteria center vertices: " + bacteriaCenters);

    return bacteriaCenters;

}

/**
 * Utility function to generate the vertex locations for a bacteria.
 * @param centerX       The center X position of the bacteria. This should be somewhere on the dish circumference.
 * @param centerY       The center y position of the bacteria. This should also be on the dish circumference.
 * @param scale         The current scale of the bacteria; the factor to multiply the points by.
 * @returns {[]}
 */
function generateBacteriaVertices(centerX, centerY, scale){
    var bVertices = [
        // x, y
    ];
    // Use a loop to define all the vertices of the circle:
    for (var i = 0.0; i <= 360; i++){
        var j = i * Math.PI / 180;
        // Create a Vertex on Outer Circle Circumference:
        var vert1 =
            [
                Math.sin(j) * scale + centerX, // x
                Math.cos(j) * scale + centerY, // y
            ];
        // Create a Vertex on the Center of the Circle:
        var vert2 =
            [
                centerX,        // x
                centerY,        // y
            ];
        // Append created vertices to vertex array
        bVertices = bVertices.concat(vert1);
        bVertices = bVertices.concat(vert2);
        // Repeat 360 times to form a circle
    }
    // Calculate and keep track of the current radius of the bacteria (important for click testing):
    currentBacteriaSize = Math.abs(centerY - bVertices[1]);
    //console.log("Current bacteria radius = "  + currentBacteriaSize);

    return bVertices;
}

function generateBacteriaColors(){

    var bacteriaColors = [];
    var max = 1.0, min = 0.1;

    for (var i = 0; i < 10; i++) {
        var redIn = Math.random() * (max - 0.5) + 0.5;
        var greenIn = Math.random() * (max - min) + min;
        var blueIn = Math.random() * (max - min) + min;
        bacteriaColors[i] = generateCircleColors(redIn, greenIn, blueIn);
    }

    return bacteriaColors;
}


/**
 * Utility function to generate the all vertices of a circle. The circle will be drawn using TRIANGLE_STRIP, and so many
 * triangle vertices are required to form a circle. (We use 360 individual triangles)
 * @returns {[]}
 */
function generateCircleVertices(){
    var circleVertices = [
        // x, y
    ];
    // Use a loop to define all the vertices of the circle:
    for (var i = 0.0; i <= 360; i++){
        var j = i * Math.PI / 180;
        // Create a Vertex on Outer Circle Circumference:
        var vert1 =
            [
                Math.sin(j) * 0.9, // x
                Math.cos(j) * 0.9, // y
            ];
        // Create a Vertex on the Center of the Circle:
        var vert2 =
            [
                Math.sin(j) * 0.1,        // x
                Math.cos(j) * 0.1,        // y
            ];
        // Append created vertices to vertex array
        circleVertices = circleVertices.concat(vert1);
        circleVertices = circleVertices.concat(vert2);
        // Repeat 360 times around the circle
    }
    return circleVertices;
}

/**
 * Utility function to generate colours for a circle's vertices to be used in the fragment shader
 * @param redIn         The Red value of the input colour [0.0 - 1.0]
 * @param greenIn       The Green value of the input colour [0.0 - 1.0]
 * @param blueIn        The Blue value of the input colour [0.0 - 1.0]
 * @returns {[]}        An array of colours in the form R1, G1, B1, R2, G2, B2, ... Rn, Gn, Bn
 */
function generateCircleColors(redIn, greenIn, blueIn){
    var circleColors = [
        // R, G, B
    ];
    // Use a loop to define all the colors in the vertices of the circle:
    for (var i = 0.0; i <= 360; i++){
        // Create a Vertex on Outer Circle Circumference:
        var vert1 =
            [
                redIn,              // R
                greenIn,           // G
                blueIn,           // B
            ];
        // Create a Vertex on the Center of the Circle:
        var vert2 =
            [
                0.0,        // R
                0.0,        // G
                0.0,        // B
            ];
        // Append created colour vertices to colour vertex array
        circleColors = circleColors.concat(vert1);
        circleColors = circleColors.concat(vert2);
        // Repeat 360 times around the circle
    }
    return circleColors;
}

/**
 * Main Draw Function.
 * @param gl
 * @param currentSize
 * @param modelMatrix
 * @param u_ModelMatrix
 * @param bacteriaLocations
 * @param bacteriaColors
 */
function draw(gl, currentSize, modelMatrix, u_ModelMatrix, bacteriaLocations, bacteriaColors) {
    // Adjust the scale of the bacteria every time the function is called:
    var scale = currentSize;

    // Pass the rotation matrix to the vertex shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the appropriate shapes
    drawDish(gl);
    for (var bCount = 0; bCount < bacteriaLocations.length; bCount+=2){
        drawBacteria(gl, bacteriaLocations[bCount], bacteriaLocations[bCount+1], bacteriaColors[bCount/2], scale);
    }


}

/**
 * Function for the drawing of bacteria.
 * @param gl            The WebGL context
 * @param centerX       The center X position of the bacteria being drawn (this should be on the circumference of the back dish)
 * @param centerY       The center y position of the bacteria being drawn (this should also be on the circumference of the dish)
 * @param colorArray    The array of colours
 * @param scale
 */
function drawBacteria(gl, centerX, centerY, colorArray, scale){
    // Generate colours from the input and vertex locations from generateBacteriaVertices():
    var bVertices = generateBacteriaVertices(centerX, centerY, scale);
    var bColors = colorArray; // An array of nested arrays storing colours for each bacteria
    //console.log ("CircleVertices.count/VERTEX_DIMENSIONS = " + (circleVertices.length / VERTEX_DIMENSIONS));

    // Initialize the buffers to prepare for drawing:
    let n = initVertexBuffers(gl, bVertices, bVertices.length / VERTEX_DIMENSIONS);
    let m = initColorBuffers(gl, bColors, bColors.length / COLOUR_DIMENSIONS);
    if (n < 0 || m < 0) {
        console.log('Failed to set the positions or colors of the vertices for the circle.');
        return;
    }

    // Draw the bacteria to the screen:
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, bVertices.length / VERTEX_DIMENSIONS);

}

function drawDish(gl){
    // Generate colours and vertices from the generateCircle*() utility functions:
    var circleVertices = generateCircleVertices();
    var circleColors = generateCircleColors(0.2, 0.8, 0.2);
    //console.log ("CircleVertices.count/VERTEX_DIMENSIONS = " + (circleVertices.length / VERTEX_DIMENSIONS));
    let n = initVertexBuffers(gl, circleVertices, circleVertices.length / VERTEX_DIMENSIONS);
    let m = initColorBuffers(gl, circleColors, circleColors.length / COLOUR_DIMENSIONS);
    if (n < 0 || m < 0) {
        console.log('Failed to set the positions or colors of the vertices for the circle.');
        return;
    }

    // Draw the dish to the screen:
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, circleVertices.length / VERTEX_DIMENSIONS);


}

// Last time that this function was called
var g_last = Date.now();

/**
 * Utility function which is called each tick to animate the growth of the bacteria.
 * @param size          The current size of the bacteria
 * @returns {number}
 */
function animate(size) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    // Update the current scale of the bacteria (adjusted by the elapsed time)
    var newSize = size + (SCALE_STEP * elapsed) / 1000.0;
    // Update the score (adjusted by the elapsed time):
    playerScore += newSize;
    document.getElementById("score").innerHTML = (playerScore).toFixed(0);
    return (newSize %= 360);

}

/**
 * Utility function to initialize th vertex buffers needed to draw any shapes.
 * @param gl            The WebGL context
 * @param vertexArray   The array of vertices to be fed into the buffer
 * @param numVertices   The total number of vertices being fed into the buffer
 * @returns {number|*}
 */

function initVertexBuffers(gl, vertexArray, numVertices) {
    var vertices = new Float32Array(vertexArray);
    var n = numVertices;   // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Assign the buffer object to a_Position variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //var a_Color = gl.getAttribLocation(gl.program, 'a_Color');f
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position or a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    return n;
}

/**
 * Utility function to initialize the colour buffers needed to define colours for vertices of shapes.
 * @param gl            The WebGL context
 * @param colorArray    The array of colours in the form R1, G1, B1, R2, G2, B2, ..., Rn, Gn, Bn.
 * @param numVertices   The total number of colour vertices being fed into the buffer
 * @returns {number|*}
 */

function initColorBuffers(gl, colorArray, numVertices){
    var colors = new Float32Array(colorArray);
    var n = numVertices;   // The number of vertices

    // Create a buffer object
    var colorBuffer = gl.createBuffer();
    if (!colorBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // Assign the buffer object to a_Color variable
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Position or a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Color);

    return n;
}
/**
 * Function to change the game state: whether the game is paused or not.
 */
function togglePause(){
    if (gamePaused){
        gamePaused = false;
        document.getElementById("pauseBtn").innerHTML = "Pause";
    }else{
        gamePaused = true;
        document.getElementById("pauseBtn").innerHTML = "Play";
    }
    console.log("Game Pause Toggled.");
}

/**
 * Function for handling mouse clicks by the player.
 * @param e     The MouseEvent that stores data about where the user has clicked among other things
 */
function clickHandler(e){
    let canvas = document.getElementById('gameCanvas');
    let rect = canvas.getBoundingClientRect();
    // Scale the mouse event (which gives raw pixel count depending on canvas size) to the [-1, 1] coordinate space of the webgl context:
    var cx = (e.clientX - rect.left) / canvas.clientWidth * 2 - 1;
    var cy = (e.clientY - rect.top) / canvas.clientHeight * (-2) + 1;
    console.log("Canvas was clicked. X = " + cx.toFixed(2) + " Y = " + cy.toFixed(2));

    // Loop through all bacteria centers' X values:
    for (var i = 0; i < 20; i+=2){

        // If clicked in center of a bacteria:
        if (bacteriaCenters[i].toFixed(1) === cx.toFixed(1)){
            if (bacteriaCenters[i+1].toFixed(1) === cy.toFixed(1)){
                console.log("Bacteria Center Hit!");
            }
        }

        // If clicked within the circle of the bacteria:
        // (Uses formula for checking whether a point lies within a circle: https://math.stackexchange.com/questions/198764/how-to-know-if-a-point-is-inside-a-circle
        if(Math.sqrt(Math.pow(Math.abs(cx - bacteriaCenters[i]), 2) + Math.pow(Math.abs(cy - bacteriaCenters[i+1]), 2)) < currentBacteriaSize){
            console.log("Bacteria Hit!");
        }

    }

}