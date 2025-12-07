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

// =============== SHADERS (Mantidos iguais) =====================
const vsSrc = `
attribute vec3 position;
attribute vec3 color;
attribute vec3 normal;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform vec3 lightDir;
varying vec3 vColor;
void main() {
    vec3 norm = normalize(mat3(model) * normal);
    float light = max(dot(norm, lightDir), 0.0) * 0.7 + 0.3;
    vColor = color * light;
    gl_Position = projection * view * model * vec4(position, 1.0);
}
`;

const fsSrc = `
precision mediump float;
varying vec3 vColor;
void main() {
    gl_FragColor = vec4(vColor, 1.0);
}
`;

function compile(src,type,gl){
    const s = gl.createShader(type);
    gl.shaderSource(s,src);
    gl.compileShader(s);
    return s;
}

const vs1 = compile(vsSrc,gl1.VERTEX_SHADER, gl1);
const fs1 = compile(fsSrc,gl1.FRAGMENT_SHADER, gl1);
const program1 = gl1.createProgram();
gl1.attachShader(program1,vs1); gl1.attachShader(program1,fs1); gl1.linkProgram(program1); gl1.useProgram(program1);

const vs2 = compile(vsSrc,gl2.VERTEX_SHADER, gl2);
const fs2 = compile(fsSrc,gl2.FRAGMENT_SHADER, gl2);
const program2 = gl2.createProgram();
gl2.attachShader(program2,vs2); gl2.attachShader(program2,fs2); gl2.linkProgram(program2); gl2.useProgram(program2);

// =============== BUFFERS ====================
function setupBuffers(gl, program) {
    const bPos = gl.createBuffer();
    const bCol = gl.createBuffer();
    const bNorm = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
    const aPos = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    gl.bindBuffer(gl.ARRAY_BUFFER, bCol);
    const aCol = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aCol);

    gl.bindBuffer(gl.ARRAY_BUFFER, bNorm);
    const aNorm = gl.getAttribLocation(program, "normal");
    gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNorm);

    return { bPos, bCol, bNorm };
}

let buffers1 = setupBuffers(gl1, program1);
let buffers2 = setupBuffers(gl2, program2);

// ============== ESTADO DO JOGO ==================
let gameSeed = Math.random() * 1000;
let collectedTickets = new Set(); // IDs dos bilhetes coletados

let player1 = { x: -1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
let player2 = { x: 1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };

let score1 = 0;
let score2 = 0;
let penalties1 = 0;
let penalties2 = 0;
let bonus1 = 0;
let bonus2 = 0;
let isGameOver = false;

function resetGame() {
    gameSeed = Math.random() * 1000;
    collectedTickets.clear();
    player1 = { x: -1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
    player2 = { x: 1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
    penalties1 = 0; penalties2 = 0;
    bonus1 = 0; bonus2 = 0;
    isGameOver = false;
    document.getElementById('game-over').style.display = 'none';
}

// ============== FÍSICA E LÓGICA ==================
function updatePhysics() {
    if (isGameOver && (keys['r'] || keys['R'])) {
        resetGame();
    }
    if (isGameOver) return;
    
    const speed = 0.1;
    const autoSpeed = 0.15;
    const jumpForce = 0.2;
    const gravity = 0.01;

    // --- PLAYER 1 ---
    // Verifica colisão usando a função importada de Collision.js
    let col1 = checkCollision(player1, gameSeed, collectedTickets);
    
    if (col1.ticketId) {
        // Logica de pegar bilhete
        collectedTickets.add(col1.ticketId);
        bonus1 += 50;
    }
    
    if (!col1.hit) {
        player1.z -= autoSpeed;
    } else {
        penalties1 += 1;
    }
    
    let dx1 = 0;
    if (keys['a'] || keys['A']) dx1 -= speed;
    if (keys['d'] || keys['D']) dx1 += speed;
    
    player1.x += dx1;
    player1.rotation = Math.atan2(dx1, autoSpeed);
    player1.walkTime += 0.2;
    if ((keys['w'] || keys['W']) && player1.y === 0) player1.vy = jumpForce;
    player1.y += player1.vy;
    player1.vy -= gravity;
    if (player1.y < 0) { player1.y = 0; player1.vy = 0; }

    // --- PLAYER 2 ---
    let col2 = checkCollision(player2, gameSeed, collectedTickets);
    
    if (col2.ticketId) {
        collectedTickets.add(col2.ticketId);
        bonus2 += 50;
    }

    if (!col2.hit) {
        player2.z -= autoSpeed;
    } else {
        penalties2 += 1;
    }

    let dx2 = 0;
    if (keys['ArrowLeft']) dx2 -= speed;
    if (keys['ArrowRight']) dx2 += speed;

    player2.x += dx2;
    player2.rotation = Math.atan2(dx2, autoSpeed);
    player2.walkTime += 0.2;
    if (keys['ArrowUp'] && player2.y === 0) player2.vy = jumpForce;
    player2.y += player2.vy;
    player2.vy -= gravity;
    if (player2.y < 0) { player2.y = 0; player2.vy = 0; }

    // Bounds
    player1.x = Math.max(-2.5, Math.min(2.5, player1.x));
    player2.x = Math.max(-2.5, Math.min(2.5, player2.x));

    // Update Scores
    score1 = Math.floor(-player1.z) - Math.floor(penalties1 / 10) + bonus1;
    score2 = Math.floor(-player2.z) - Math.floor(penalties2 / 10) + bonus2;
    
    document.getElementById('score1').innerText = "P1: " + score1;
    document.getElementById('score2').innerText = "P2: " + score2;

    // Condição de Vitória (500 Pontos)
    if (score1 >= 500 || score2 >= 500) {
        isGameOver = true;
        const winner = score1 >= 500 ? "JOGADOR 1" : "JOGADOR 2";
        const ui = document.getElementById('game-over');
        ui.style.display = 'flex';
        ui.children[0].innerText = `${winner} VENCEU!`;
    }
}

// ============== GERAÇÃO DE CENÁRIO ==================
function generateScene(minZ, maxZ) {
    resetGeometry();

    const viewDist = 150;
    const backDist = 20;
    const startZ = maxZ + backDist;
    const endZ = minZ - viewDist;

    // Ambiente
    quad([-3.0,0,startZ],[3.0,0,startZ],[3.0,0,endZ],[-3.0,0,endZ],[0.82,0.82,0.75]); // Chão
    quad([-3.0,6,startZ],[3.0,6,startZ],[3.0,6,endZ],[-3.0,6,endZ],[0.9,0.88,0.85]); // Teto
    quad([-3.0,0,startZ],[-3.0,6,startZ],[-3.0,6,endZ],[-3.0,0,endZ],[0.95,0.9,0.85]); // Paredes
    quad([3.0,0,startZ],[3.0,6,startZ],[3.0,6,endZ],[3.0,0,endZ],[0.95,0.9,0.85]);

    if (0 <= startZ && 0 >= endZ) {
        quad([-3.0, 0.01, 0.5], [3.0, 0.01, 0.5], [3.0, 0.01, -0.5], [-3.0, 0.01, -0.5], [1, 1, 1]);
    }

    // Objetos
    const spacing = 8;
    let firstIndex = Math.floor(startZ / spacing);
    
    for (let i = firstIndex; i * spacing > endZ; i--) {
        let z = i * spacing;
        if (z > -30) continue;

        // Pega info da linha usando Collision.js
        const rowObstacles = getRowInfo(i, gameSeed);
        
        rowObstacles.forEach(obs => {
            if (obs.type === 'ticket') {
                // Verifica se já foi pego
                const ticketId = `${i}_${obs.x}`;
                if (!collectedTickets.has(ticketId)) {
                    RU(obs.x, z); // Desenha usando RU.js
                }
            } else if (obs.type === 'chair') {
                addChair(obs.x, z);
            } else {
                addTable(obs.x, z);
            }
        });
    }
}

// ============== RENDER LOOP ==================
function updateCharacters() {
    const minZ = Math.min(player1.z, player2.z);
    const maxZ = Math.max(player1.z, player2.z);
    generateScene(minZ, maxZ);

    addCharacter(player1.x, player1.z, [0.9, 0.7, 0.6], [0.0, 0.6, 0.7], [0.2, 0.2, 0.7], [0.25, 0.15, 0.1], [0.2, 0.2, 0.8], player1.rotation, player1.walkTime, player1.y);
    addCharacter(player2.x, player2.z, [0.95, 0.8, 0.7], [0.8, 0.1, 0.1], [0.3, 0.3, 0.3], [0.9, 0.8, 0.2], [0.0, 0.6, 0.0], player2.rotation, player2.walkTime, player2.y);
    
    const vertexData = new Float32Array(vertices);
    const colorData = new Float32Array(colors);
    const normalData = new Float32Array(normals);
    
    gl1.bindBuffer(gl1.ARRAY_BUFFER, buffers1.bPos); gl1.bufferData(gl1.ARRAY_BUFFER, vertexData, gl1.STATIC_DRAW);
    gl1.bindBuffer(gl1.ARRAY_BUFFER, buffers1.bCol); gl1.bufferData(gl1.ARRAY_BUFFER, colorData, gl1.STATIC_DRAW);
    gl1.bindBuffer(gl1.ARRAY_BUFFER, buffers1.bNorm); gl1.bufferData(gl1.ARRAY_BUFFER, normalData, gl1.STATIC_DRAW);
    
    gl2.bindBuffer(gl2.ARRAY_BUFFER, buffers2.bPos); gl2.bufferData(gl2.ARRAY_BUFFER, vertexData, gl2.STATIC_DRAW);
    gl2.bindBuffer(gl2.ARRAY_BUFFER, buffers2.bCol); gl2.bufferData(gl2.ARRAY_BUFFER, colorData, gl2.STATIC_DRAW);
    gl2.bindBuffer(gl2.ARRAY_BUFFER, buffers2.bNorm); gl2.bufferData(gl2.ARRAY_BUFFER, normalData, gl2.STATIC_DRAW);
}

function renderView(gl, program, canvas, playerPos) {
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

    const model = m4.identity();
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, model);
    const lightDir = m4.normalize([0.5, 0.7, 1.0]);
    gl.uniform3fv(gl.getUniformLocation(program, "lightDir"), lightDir);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}

function draw() {
    updatePhysics();
    updateCharacters();
    renderView(gl1, program1, canvas1, player1);
    renderView(gl2, program2, canvas2, player2);
    requestAnimationFrame(draw);
}

draw();
