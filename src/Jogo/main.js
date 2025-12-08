// ================== SETUP ====================
const canvas1 = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const gl1 = canvas1.getContext("webgl");
const gl2 = canvas2.getContext("webgl");

function resize() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight;
    canvas1.width = width; canvas1.height = height;
    gl1.viewport(0, 0, width, height);
    canvas2.width = width; canvas2.height = height;
    gl2.viewport(0, 0, width, height);
}
resize();
window.onresize = resize;

if (!gl1 || !gl2) alert("WebGL não suportado");

// =============== SHADERS (ILUMINAÇÃO PHONG + TEXTURA) =====================
const vsSrc = `
attribute vec3 a_position;
attribute vec3 a_color;
attribute vec3 a_normal;
attribute vec2 a_texcoord;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform vec3 u_lightPosition;
uniform vec3 u_viewPosition;

varying vec3 v_normal;
varying vec2 v_texcoord;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
varying vec3 v_color;

void main() {
    gl_Position = projection * view * model * vec4(a_position, 1.0);
    
    vec3 surfacePosition = (model * vec4(a_position, 1.0)).xyz;
    v_normal = normalize(mat3(model) * a_normal);
    v_texcoord = a_texcoord;
    v_color = a_color;

    v_surfaceToLight = u_lightPosition - surfacePosition;
    v_surfaceToView = u_viewPosition - surfacePosition;
}
`;

const fsSrc = `
precision mediump float;

varying vec3 v_normal;
varying vec2 v_texcoord;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
varying vec3 v_color;

uniform sampler2D u_texture;

void main() {
    // Busca a cor na textura
    vec4 texColor = texture2D(u_texture, v_texcoord);
    
    // Mistura com a cor do objeto (vertex color)
    vec3 baseColor = texColor.rgb * v_color; 

    // Iluminação Phong
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(v_surfaceToLight);
    vec3 viewDir = normalize(v_surfaceToView);
    vec3 halfVec = normalize(lightDir + viewDir);

    float diffuse = max(dot(lightDir, normal), 0.0);
    float specular = 0.0;
    if (diffuse > 0.0) {
        specular = pow(max(dot(normal, halfVec), 0.0), 50.0);
    }

    vec3 ambient = 0.3 * baseColor;
    vec3 diffuseC = 0.7 * diffuse * baseColor;
    vec3 specularC = specular * vec3(1.0, 1.0, 1.0);

    gl_FragColor = vec4(ambient + diffuseC + specularC, 1.0);
}
`;

function compile(src, type, gl) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
}

const vs1 = compile(vsSrc, gl1.VERTEX_SHADER, gl1);
const fs1 = compile(fsSrc, gl1.FRAGMENT_SHADER, gl1);
const program1 = gl1.createProgram();
gl1.attachShader(program1, vs1); gl1.attachShader(program1, fs1); gl1.linkProgram(program1); gl1.useProgram(program1);

const vs2 = compile(vsSrc, gl2.VERTEX_SHADER, gl2);
const fs2 = compile(fsSrc, gl2.FRAGMENT_SHADER, gl2);
const program2 = gl2.createProgram();
gl2.attachShader(program2, vs2); gl2.attachShader(program2, fs2); gl2.linkProgram(program2); gl2.useProgram(program2);

// =============== CARREGAMENTO DE TEXTURA (REAL) =================
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Pixel azul temporário (enquanto carrega)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    const image = new Image();
    image.src = url;
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // CONFIGURAÇÃO PARA REPETIR (GL_REPEAT)
        // A imagem DEVE ser POT (ex: 512x512)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    };
    return texture;
}

// Carrega "textura.jpg" da raiz do projeto
const texture1 = loadTexture(gl1, "textura.jpg");
const texture2 = loadTexture(gl2, "textura.jpg");

// =============== BUFFERS ===============
function setupBuffers(gl, program) {
    const bPos = gl.createBuffer();
    const bCol = gl.createBuffer();
    const bNorm = gl.createBuffer();
    const bTex = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
    const aPos = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    gl.bindBuffer(gl.ARRAY_BUFFER, bCol);
    const aCol = gl.getAttribLocation(program, "a_color");
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aCol);

    gl.bindBuffer(gl.ARRAY_BUFFER, bNorm);
    const aNorm = gl.getAttribLocation(program, "a_normal");
    gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNorm);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, bTex);
    const aTex = gl.getAttribLocation(program, "a_texcoord");
    gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTex);

    return { bPos, bCol, bNorm, bTex };
}

let buffers1 = setupBuffers(gl1, program1);
let buffers2 = setupBuffers(gl2, program2);

// ============== JOGO ==================
let player1 = { x: -1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
let player2 = { x: 1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
let score1 = 0; let score2 = 0;
let penalties1 = 0; let penalties2 = 0;
let gameRunning = true;

function updatePhysics() {
    if (keys['r'] || keys['R']) {
        resetGameSeed();
        player1 = { x: -1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
        player2 = { x: 1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
        penalties1 = 0; penalties2 = 0;
        gameRunning = true;
        document.getElementById('winner-msg').innerText = "GAME OVER";
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('score1').innerText = "P1: 0";
        document.getElementById('score2').innerText = "P2: 0";
    }
    if (!gameRunning) return;

    const speed = 0.1; const autoSpeed = 0.15; const jumpForce = 0.2; const gravity = 0.01;

    // Player 1
    let dx1 = 0;
    if (!checkCollision(player1)) { player1.z -= autoSpeed; } else { penalties1 += 1; }
    if (keys['a'] || keys['A']) { dx1 -= speed; }
    if (keys['d'] || keys['D']) { dx1 += speed; }
    player1.x += dx1;
    player1.rotation = Math.atan2(dx1, autoSpeed);
    player1.walkTime += 0.2;
    if ((keys['w'] || keys['W']) && player1.y === 0) { player1.vy = jumpForce; }
    player1.y += player1.vy; player1.vy -= gravity;
    if (player1.y < 0) { player1.y = 0; player1.vy = 0; }

    // Player 2
    let dx2 = 0;
    if (!checkCollision(player2)) { player2.z -= autoSpeed; } else { penalties2 += 1; }
    if (keys['ArrowLeft']) { dx2 -= speed; }
    if (keys['ArrowRight']) { dx2 += speed; }
    player2.x += dx2;
    player2.rotation = Math.atan2(dx2, autoSpeed);
    player2.walkTime += 0.2;
    if (keys['ArrowUp'] && player2.y === 0) { player2.vy = jumpForce; }
    player2.y += player2.vy; player2.vy -= gravity;
    if (player2.y < 0) { player2.y = 0; player2.vy = 0; }

    player1.x = Math.max(-2.5, Math.min(2.5, player1.x));
    player2.x = Math.max(-2.5, Math.min(2.5, player2.x));

    score1 = Math.floor(-player1.z) - Math.floor(penalties1 / 10);
    score2 = Math.floor(-player2.z) - Math.floor(penalties2 / 10);
    document.getElementById('score1').innerText = "P1: " + score1;
    document.getElementById('score2').innerText = "P2: " + score2;

    if (score1 >= 500 || score2 >= 500) {
        gameRunning = false;
        let msg = score1 >= 500 ? "JOGADOR 1 VENCEU!" : "JOGADOR 2 VENCEU!";
        document.getElementById('winner-msg').innerText = msg;
        document.getElementById('game-over').style.display = 'flex';
    }
}

function generateScene(minZ, maxZ) {
    resetGeometry();
    const viewDist = 150; const backDist = 20;
    const startZ = maxZ + backDist; const endZ = minZ - viewDist;

    addCorridor(startZ, endZ);

    const spacing = 8;
    let firstIndex = Math.floor(startZ / spacing);
    for (let i = firstIndex; i * spacing > endZ; i--) {
        let z = i * spacing;
        if (z > -30) continue;
        const rowObstacles = getRowInfo(i);
        rowObstacles.forEach(obs => {
            if (obs.type === 'chair') addChair(obs.x, z);
            else addTable(obs.x, z);
        });
    }
}

function updateCharacters() {
    const minZ = Math.min(player1.z, player2.z);
    const maxZ = Math.max(player1.z, player2.z);
    generateScene(minZ, maxZ);

    addCharacter(player1.x, player1.z, [0.9, 0.7, 0.6], [0.0, 0.6, 0.7], [0.2, 0.2, 0.7], [0.25, 0.15, 0.1], [0.2, 0.2, 0.8], player1.rotation, player1.walkTime, player1.y);
    addCharacter(player2.x, player2.z, [0.95, 0.8, 0.7], [0.8, 0.1, 0.1], [0.3, 0.3, 0.3], [0.9, 0.8, 0.2], [0.0, 0.6, 0.0], player2.rotation, player2.walkTime, player2.y);
    
    const { vertices: v, colors: c, normals: n, texcoords: t } = getGeometryData();

    function updateBuf(gl, bufs) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufs.bPos); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufs.bCol); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(c), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufs.bNorm); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(n), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufs.bTex); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(t), gl.STATIC_DRAW);
    }
    updateBuf(gl1, buffers1);
    updateBuf(gl2, buffers2);
}

function renderView(gl, program, canvas, playerPos, texture) {
    gl.clearColor(0.1, 0.1, 0.15, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const projection = m4.perspective(degToRad(60), canvas.width/canvas.height, 0.1, 200);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, projection);

    const cameraDistance = 3;
    const cameraHeight = 2.5;
    const cameraPosition = [playerPos.x, cameraHeight, playerPos.z + cameraDistance];
    const target = [playerPos.x, 1.5, playerPos.z - 2];
    const up = [0, 1, 0];
    
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);
    const viewMatrix = m4.inverse(cameraMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, viewMatrix);

    gl.uniform3fv(gl.getUniformLocation(program, "u_lightPosition"), [playerPos.x + 2, 5.0, playerPos.z + 5]);
    gl.uniform3fv(gl.getUniformLocation(program, "u_viewPosition"), cameraPosition);

    const model = m4.identity();
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, model);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}

function draw() {
    updatePhysics();
    updateCharacters();
    renderView(gl1, program1, canvas1, player1, texture1);
    renderView(gl2, program2, canvas2, player2, texture2);
    requestAnimationFrame(draw);
}
draw();
