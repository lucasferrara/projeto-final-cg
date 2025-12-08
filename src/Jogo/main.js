// ... (Mantenha todo o código de SETUP WEBGL e SHADERS igual ao original) ...

// ================== ESTADO DO JOGO ==================
let gameSeed = Math.random() * 1000;
let collectedTickets = new Set(); // Guarda IDs dos bilhetes já coletados

let player1 = { x: -1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };
let player2 = { x: 1, y: 0, z: 0, vy: 0, rotation: 0, walkTime: 0 };

let score1 = 0;
let score2 = 0;
let penalties1 = 0;
let penalties2 = 0;
let bonus1 = 0; // Pontos extras dos bilhetes
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

// ================== FÍSICA ==================
function updatePhysics() {
    // Resetar
    if (isGameOver && (keys['r'] || keys['R'])) {
        resetGame();
    }
    
    // Se o jogo acabou, para tudo
    if (isGameOver) return;
    
    const speed = 0.1;
    const autoSpeed = 0.15;
    const jumpForce = 0.2;
    const gravity = 0.01;

    // --- PLAYER 1 ---
    let col1 = checkCollision(player1, gameSeed, collectedTickets);
    
    // Tratamento de colisão P1
    if (col1.hit) {
        if (col1.type === 'ticket') {
            // === LÓGICA 2: GANHA 50 PONTOS ===
            collectedTickets.add(col1.id);
            bonus1 += 50;
            // Não impede movimento ao pegar bilhete
            player1.z -= autoSpeed; 
        } else {
            // É obstáculo
            penalties1 += 1;
        }
    } else {
        // Caminho livre
        player1.z -= autoSpeed;
    }
    
    // Movimento Lateral/Pulo P1
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
    
    // Tratamento de colisão P2
    if (col2.hit) {
        if (col2.type === 'ticket') {
            collectedTickets.add(col2.id);
            bonus2 += 50;
            player2.z -= autoSpeed;
        } else {
            penalties2 += 1;
        }
    } else {
        player2.z -= autoSpeed;
    }

    // Movimento Lateral/Pulo P2
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

    // Limites Laterais
    player1.x = Math.max(-2.5, Math.min(2.5, player1.x));
    player2.x = Math.max(-2.5, Math.min(2.5, player2.x));

    // --- ATUALIZAÇÃO DE PLACAR ---
    // Score = Distância percorrida + Bônus de Tickets - Penalidades
    score1 = Math.floor(-player1.z) - Math.floor(penalties1 / 10) + bonus1;
    score2 = Math.floor(-player2.z) - Math.floor(penalties2 / 10) + bonus2;
    
    document.getElementById('score1').innerText = "P1: " + score1;
    document.getElementById('score2').innerText = "P2: " + score2;

    // === LÓGICA 3: FIM DE JOGO AOS 500 PONTOS ===
    if (score1 >= 500 || score2 >= 500) {
        isGameOver = true;
        const winner = score1 >= 500 ? "JOGADOR 1" : "JOGADOR 2";
        const ui = document.getElementById('game-over');
        ui.style.display = 'flex';
        ui.children[0].innerText = `${winner} VENCEU!`;
    }
}

// ================== GERAÇÃO DE CENÁRIO ==================
function generateScene(minZ, maxZ) {
    resetGeometry();

    const viewDist = 150;
    const backDist = 20;
    const startZ = maxZ + backDist;
    const endZ = minZ - viewDist;

    // ... (Mantenha o código de Piso/Teto/Paredes e Linha de Chegada igual) ...
    // Piso
    quad([-3.0,0,startZ],[3.0,0,startZ],[3.0,0,endZ],[-3.0,0,endZ],[0.82,0.82,0.75]);
    // Teto
    quad([-3.0,6,startZ],[3.0,6,startZ],[3.0,6,endZ],[-3.0,6,endZ],[0.9,0.88,0.85]);
    // Paredes
    quad([-3.0,0,startZ],[-3.0,6,startZ],[-3.0,6,endZ],[-3.0,0,endZ],[0.95,0.9,0.85]);
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
                // Verifica se JÁ foi pego (se não foi pego, desenha)
                const ticketId = `${i}_${obs.x}`;
                if (!collectedTickets.has(ticketId)) {
                    RU(obs.x, z); // Chama a função do RU.js
                }
            } else if (obs.type === 'chair') {
                addChair(obs.x, z);
            } else {
                addTable(obs.x, z);
            }
        });
    }
}

// ... (Mantenha updateCharacters, renderView e draw iguais ao original) ...
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
