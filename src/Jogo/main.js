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

// =============== SHADERS (ORIGINAL - 1 LUZ) =====================
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

// =============== BUFFERS ===============
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

// ============== POSIÇÕES E FÍSICA ==================
let player1 = { x: -1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
let player2 = { x: 1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
let score1 = 0; let score2 = 0;
let penalties1 = 0; let penalties2 = 0;
let isGameOver = false;
const WIN_SCORE = 500; // META PARA VENCER

function updatePhysics() {
    if (isGameOver) {
        if (keys['r'] || keys['R']) {
            resetGameSeed();
            player1 = { x: -1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
            player2 = { x: 1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
            score1 = 0; score2 = 0; penalties1 = 0; penalties2 = 0;
            isGameOver = false;
            document.getElementById('game-over').style.display = 'none';
        }
        return;
    }

    const autoSpeed = 0.15;
    const gravity = 0.01;
    const jumpForce = 0.2;
    const BONUS_VALUE = 50; // Valor do Bilhete (500 pts)

    // --- JOGADOR 1 ---
    if (!checkCollision(player1)) player1.z -= autoSpeed;
    else penalties1 += 1;

    // Se pegar o bilhete, reduz penalidade (ganha ponto)
    if (checkBonusCollision(player1)) penalties1 -= (BONUS_VALUE * 10);

    let dx1 = 0;
    if (keys['a'] || keys['A']) dx1 -= 0.1;
    if (keys['d'] || keys['D']) dx1 += 0.1;
    player1.x += dx1;
    player1.rotation = Math.atan2(dx1, autoSpeed);
    player1.walkTime += 0.2;
    if ((keys['w'] || keys['W']) && player1.y === 0) player1.vy = jumpForce;
    player1.y += player1.vy; player1.vy -= gravity;
    if (player1.y < 0) { player1.y = 0; player1.vy = 0; }

    // --- JOGADOR 2 ---
    if (!checkCollision(player2)) player2.z -= autoSpeed;
    else penalties2 += 1;

    if (checkBonusCollision(player2)) penalties2 -= (BONUS_VALUE * 10);

    let dx2 = 0;
    if (keys['ArrowLeft']) dx2 -= 0.1;
    if (keys['ArrowRight']) dx2 += 0.1;
    player2.x += dx2;
    player2.rotation = Math.atan2(dx2, autoSpeed);
    player2.walkTime += 0.2;
    if (keys['ArrowUp'] && player2.y === 0) player2.vy = jumpForce;
    player2.y += player2.vy; player2.vy -= gravity;
    if (player2.y < 0) { player2.y = 0; player2.vy = 0; }

    player1.x = Math.max(-2.5, Math.min(2.5, player1.x));
    player2.x = Math.max(-2.5, Math.min(2.5, player2.x));

    // SCORE
    score1 = Math.max(0, Math.floor(-player1.z) - Math.floor(penalties1 / 10));
    score2 = Math.max(0, Math.floor(-player2.z) - Math.floor(penalties2 / 10));
    document.getElementById('score1').innerText = "P1: " + score1;
    document.getElementById('score2').innerText = "P2: " + score2;

    // VITORIA AOS 500
    if (score1 >= WIN_SCORE || score2 >= WIN_SCORE) {
        isGameOver = true;
        const winner = (score1 >= WIN_SCORE) ? "Jogador 1" : "Jogador 2";
        const msg = document.getElementById('game-over');
        msg.innerHTML = `<div style="color:#4f4">VENCEDOR: ${winner}!</div><div style="font-size:24px;margin-top:20px">Placar: ${score1} x ${score2}</div><div style="font-size:18px;margin-top:20px">Aperte R para reiniciar</div>`;
        msg.style.display = 'flex';
    }
}

// ============== GERAR CENÁRIO ==================
function generateScene(minZ, maxZ) {
    resetGeometry();
    const viewDist = 150;
    const startZ = maxZ + 20;
    const endZ = minZ - viewDist;

    addCorridor(startZ, endZ);

    const spacing = 8;
    let firstIndex = Math.floor(startZ / spacing);
    
    for (let i = firstIndex; i * spacing > endZ; i--) {
        let z = i * spacing;
        
        // Mantido -30 para ficar "como no início" (sem nascer na cara do player)
        if (z > -30) continue; 

        const rowObstacles = getRowInfo(i);
        rowObstacles.forEach(obs => {
            if (obs.type === 'chair') addChair(obs.x, z);
            else if (obs.type === 'table') addTable(obs.x, z);
            else if (obs.type === 'bonus') addRU(obs.x, z); // DESENHA O BILHETE
        });
    }
}

// ============== RENDERIZAR ==================
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
    
    const viewMatrix = m4.inverse(m4.lookAt(cameraPosition, target, up));
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
