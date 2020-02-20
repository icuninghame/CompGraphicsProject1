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
var SCALE_STEP = 0.1;

// Dimensions for the WebGL canvas
const VERTEX_DIMENSIONS = 2; // x, y
const COLOUR_DIMENSIONS = 3; // R, G, B

// Scale of the background dish relative to the canvas
const DISH_SCALE = 0.9; // 90% of canvas width/height

// Global Variable to keep track of player score
var playerScore = 0.0;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('gameCanvas');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
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

    // Current rotation angle
    var currentAngle = 0.0;
    // Model matrix
    var modelMatrix = new Matrix4();

    // Generate initial locations of bacteria along circumference of dish:
    var bacteriaVertices = generateBacteriaStartLocations();
    var bacteriaColors = generateBacteriaColors();

    // Start drawing
    var tick = function() {
        currentAngle = animate(currentAngle);  // Update the rotation angle
        draw(gl, currentAngle, modelMatrix, u_ModelMatrix, bacteriaVertices, bacteriaColors);   // Draw the shapes
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    tick();
}

function generateBacteriaStartLocations(){

    var bacteriaVertices = [
        //x, y
    ];
    for (var i = 0; i < 10; i++){
        var j = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180;
        var centerX = Math.sin(j).toFixed(2) * DISH_SCALE;
        var centerY = Math.cos(j).toFixed(2) * DISH_SCALE;
        bacteriaVertices = bacteriaVertices.concat(centerX);
        bacteriaVertices = bacteriaVertices.concat(centerY);
    }
    console.log("Bacteria vertices: " + bacteriaVertices);

    return bacteriaVertices;

}

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

function generateCircleColors(redIn, greenIn, blueIn){
    var circleColors = [
        // R, G, B
    ];
    // Use a loop to define all the colors in the vertices of the circle:
    for (var i = 0.0; i <= 360; i++){
        // Create a Vertex on Outer Circle Circumference:
        var vert1 =
            [
                redIn,           // R
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
        // Append created vertices to vertex array
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
    // Set the scale matrix
    //modelMatrix.setScale(currentSize, currentSize, 1); // Rotation angle, rotation axis (0, 0, 1)
    // Adjust the scale of the bacteria every time the function is called:
    var scale = currentSize;

    // Pass the rotation matrix to the vertex shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the appropriate shapes
    drawDish(gl);
    //drawTriangle(gl);
    // console.log("Center X = " + bacteriaLocations[bCount] + " Center Y = "+ bacteriaLocations[bCount+1]);
    for (var bCount = 0; bCount < bacteriaLocations.length; bCount+=2){
        drawBacteria(gl, bacteriaLocations[bCount], bacteriaLocations[bCount+1], bacteriaColors[bCount/2], scale);
    }


}

function drawTriangle(gl){

    var triangleVertices = [
        //x, y
        0.5, 1.0,
        0.0, 0.0,
        1.0, 0.0
    ];
    var triangleColors = [
        // R, G, B
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    ];
    let n = initVertexBuffers(gl, triangleVertices, triangleVertices.count / VERTEX_DIMENSIONS);
    let m = initColorBuffers(gl, triangleColors, triangleColors.count / COLOUR_DIMENSIONS);
    if (n < 0 || m < 0) {
        console.log('Failed to set the positions or colors of the vertices for the triangle.');
        return;
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);

}

function drawBacteria(gl, centerX, centerY, colorArray, scale){
    var bVertices = generateBacteriaVertices(centerX, centerY, scale);
    var bColors = colorArray; // Returns an array containing an array for each bacteria
    //console.log ("CircleVertices.count/VERTEX_DIMENSIONS = " + (circleVertices.length / VERTEX_DIMENSIONS));
    let n = initVertexBuffers(gl, bVertices, bVertices.length / VERTEX_DIMENSIONS);
    let m = initColorBuffers(gl, bColors, bColors.length / COLOUR_DIMENSIONS);
    if (n < 0 || m < 0) {
        console.log('Failed to set the positions or colors of the vertices for the circle.');
        return;
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, bVertices.length / VERTEX_DIMENSIONS);

}

function drawDish(gl){

    var circleVertices = generateCircleVertices();
    var circleColors = generateCircleColors(0.2, 0.8, 0.2);
    //console.log ("CircleVertices.count/VERTEX_DIMENSIONS = " + (circleVertices.length / VERTEX_DIMENSIONS));
    let n = initVertexBuffers(gl, circleVertices, circleVertices.length / VERTEX_DIMENSIONS);
    let m = initColorBuffers(gl, circleColors, circleColors.length / COLOUR_DIMENSIONS);
    if (n < 0 || m < 0) {
        console.log('Failed to set the positions or colors of the vertices for the circle.');
        return;
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, circleVertices.length / VERTEX_DIMENSIONS);


}

// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (SCALE_STEP * elapsed) / 1000.0;
    // Update the score:
    playerScore += elapsed / 100;
    document.getElementById("score").innerHTML = (playerScore).toFixed(0);
    return newAngle %= 360;
}

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
    //var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position or a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    return n;
}

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
