let canvas = document.getElementById("canvas");
let gl = canvas.getContext("experimental-webgl");

let vertices = [
  -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1,
  1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1,
  1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, 1, 1,
  1, 1, 1, 1, 1, -1,
];
let colors = [
  5, 3, 7, 5, 3, 7, 5, 3, 7, 5, 3, 7, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 0, 0,
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
];
let indices = [
  0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
  15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
];

let vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

let color_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

let index_buffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(indices),
  gl.STATIC_DRAW
);

var vertCode =
  "attribute vec3 position;" +
  "uniform mat4 Pmatrix;" +
  "uniform mat4 Vmatrix;" +
  "uniform mat4 Mmatrix;" +
  "attribute vec3 color;" +
  "varying vec3 vColor;" +
  "void main(void) { " +
  "gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);" +
  "vColor = color;" +
  "}";

var fragCode =
  "precision mediump float;" +
  "varying vec3 vColor;" +
  "void main(void) {" +
  "gl_FragColor = vec4(vColor, 1.);" +
  "}";

var vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);

var shaderprogram = gl.createProgram();
gl.attachShader(shaderprogram, vertShader);
gl.attachShader(shaderprogram, fragShader);
gl.linkProgram(shaderprogram);

let _Pmatrix = gl.getUniformLocation(shaderprogram, "Pmatrix");
let _Vmatrix = gl.getUniformLocation(shaderprogram, "Vmatrix");
let _Mmatrix = gl.getUniformLocation(shaderprogram, "Mmatrix");

gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
let _position = gl.getAttribLocation(shaderprogram, "position");
gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(_position);

gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
let _color = gl.getAttribLocation(shaderprogram, "color");
gl.vertexAttribPointer(_color, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(_color);
gl.useProgram(shaderprogram);

// Матрица
let draw_matrix = (angle, a, zMin, zMax) => {
  let ang = Math.tan((angle * 0.5 * Math.PI) / 180);
  return [
    0.5 / ang,
    0,
    0,
    0,
    0,
    (0.5 * a) / ang,
    0,
    0,
    0,
    0,
    -(zMax + zMin) / (zMax - zMin),
    -1,
    0,
    0,
    (-2 * zMax * zMin) / (zMax - zMin),
    0,
  ];
};

let proj_matrix = draw_matrix(40, canvas.width / canvas.height, 1, 100);
let mo_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
let view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

view_matrix[14] = view_matrix[14] - 6;

//  События
let drag = false;
let old_x, old_y;
let dX = 0,
  dY = 0;

canvas.addEventListener(
  "mousedown",
  (mouseDown = (e) => {
    drag = true;
    (old_x = e.pageX), (old_y = e.pageY);
    e.preventDefault();
    return false;
  })
);
canvas.addEventListener(
  "mouseup",
  (mouseUp = (e) => {
    drag = false;
  })
);
canvas.addEventListener(
  "mousemove",
  (mouseMove = (e) => {
    if (!drag) return false;
    (dX = ((e.pageX - old_x) * 2 * Math.PI) / canvas.width),
      (dY = ((e.pageY - old_y) * 2 * Math.PI) / canvas.height);
    THETA += dX;
    PHI += dY;
    (old_x = e.pageX), (old_y = e.pageY);
  })
);

// Поворот
let rotateX = (m, angle) => {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  var mv1 = m[1],
    mv5 = m[5],
    mv9 = m[9];

  m[1] = m[1] * c - m[2] * s;
  m[5] = m[5] * c - m[6] * s;
  m[9] = m[9] * c - m[10] * s;

  m[2] = m[2] * c + mv1 * s;
  m[6] = m[6] * c + mv5 * s;
  m[10] = m[10] * c + mv9 * s;
};

let rotateY = (m, angle) => {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  var mv0 = m[0],
    mv4 = m[4],
    mv8 = m[8];

  m[0] = c * m[0] + s * m[2];
  m[4] = c * m[4] + s * m[6];
  m[8] = c * m[8] + s * m[10];

  m[2] = c * m[2] - s * mv0;
  m[6] = c * m[6] - s * mv4;
  m[10] = c * m[10] - s * mv8;
};

// Отрисовка
let THETA = 0;
let PHI = 0;

let animate = () => {
  (mo_matrix[0] = 1),
    (mo_matrix[1] = 0),
    (mo_matrix[2] = 0),
    (mo_matrix[3] = 0),
    (mo_matrix[4] = 0),
    (mo_matrix[5] = 1),
    (mo_matrix[6] = 0),
    (mo_matrix[7] = 0),
    (mo_matrix[8] = 0),
    (mo_matrix[9] = 0),
    (mo_matrix[10] = 1),
    (mo_matrix[11] = 0),
    (mo_matrix[12] = 0),
    (mo_matrix[13] = 0),
    (mo_matrix[14] = 0),
    (mo_matrix[15] = 1);

  rotateY(mo_matrix, THETA);
  rotateX(mo_matrix, PHI);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.5, 0.5, 0.5, 0.9);
  gl.clearDepth(1.0);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix);
  gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);
  gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  window.requestAnimationFrame(animate);
};
animate();
