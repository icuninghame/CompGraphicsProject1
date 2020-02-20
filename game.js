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

// Rotation angle (degrees/second)
var ANGLE_STEP = 45.0;

// Dimensions for the WebGL canvas
const VERTEX_DIMENSIONS = 2; // x, y
const COLOUR_DIMENSIONS = 3; // R, G, B

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

    // Start drawing
    var tick = function() {
        currentAngle = animate(currentAngle);  // Update the rotation angle
        draw(gl, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
        requestAnimationFrame(tick, canvas); // Request that the browser calls tick
    };
    tick();
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
                Math.sin(j), // x
                Math.cos(j), // y
            ];
        // Create a Vertex on the Center of the Circle:
        var vert2 =
            [
                0.0,        // x
                0.0,        // y
            ];
        // Append created vertices to vertex array
        circleVertices = circleVertices.concat(vert1);
        circleVertices = circleVertices.concat(vert2);
        // Repeat 360 times around the circle
    }
    return circleVertices;
}

function generateCircleColors(){
    var circleColors = [
        // R, G, B
    ];
    // Use a loop to define all the colors in the vertices of the circle:
    for (var i = 0.0; i <= 360; i++){
        var j = i * Math.PI / 180;
        // Create a Vertex on Outer Circle Circumference:
        var vert1 =
            [
                1,           // R
                1,           // G
                0,           // B
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

/**
 * Main Draw Function.
 * @param gl
 * @param currentAngle
 * @param modelMatrix
 * @param u_ModelMatrix
 */
function draw(gl, currentAngle, modelMatrix, u_ModelMatrix) {
    // Set the rotation matrix
    modelMatrix.setRotate(currentAngle, 0, 0, 1); // Rotation angle, rotation axis (0, 0, 1)

    // Pass the rotation matrix to the vertex shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the appropriate shapes
    drawCircle(gl);
    drawTriangle(gl);

}

function drawTriangle(gl){

    var triangleVertices = [
        //x, y
        0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
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

function drawCircle(gl){

    var circleVertices = generateCircleVertices();
    var circleColors = generateCircleColors();
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
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}