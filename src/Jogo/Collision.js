let gameSeed = Math.random() * 1000;

function pseudoRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getRowInfo(index) {
    const effectiveSeed = index + gameSeed;
    const rnd = pseudoRandom(effectiveSeed);
    const typeRnd = pseudoRandom(effectiveSeed + 123.45);
    
    const obstacles = [];
    const positions = [];
    
    // Distribuição: Esq(-2), Dir(2), Centro(0)
    if (rnd < 0.20) positions.push(-2);
    else if (rnd < 0.40) positions.push(2);
    else if (rnd < 0.55) positions.push(0);
    else if (rnd < 0.70) positions.push(-2, 2);
    else if (rnd < 0.85) positions.push(-2, 0);
    else positions.push(0, 2);
    
    positions.forEach((x, i) => {
        const tVal = pseudoRandom(typeRnd + i);
        obstacles.push({ x, type: tVal > 0.5 ? 'chair' : 'table' });
    });
    return obstacles;
}

// === 1. Calcula a altura do chão (Assento, Encosto ou Mesa) ===
function getFloorHeight(x, z) {
    const spacing = 8;
    const i = Math.round(z / spacing);
    const obstacleZ = i * spacing;

    if (obstacleZ > -30) return 0.0;

    const rowObstacles = getRowInfo(i);
    let maxH = 0.0;

    for (const obs of rowObstacles) {
        if (obs.type === 'chair') {
            // --- CADEIRA (Dividida em 2 partes) ---
            
            // A. Assento (Altura 0.55)
            // Colisão generosa no Z (raio 0.6) para cobrir a base
            if (Math.abs(z - obstacleZ) < 0.6 && Math.abs(x - obs.x) < 0.7) {
                maxH = Math.max(maxH, 0.55);
            }

            // B. Encosto (Altura 1.25) [NOVO]
            // Fica deslocado para trás (Z - 0.25) e é mais fino (raio Z 0.15)
            let backZ = obstacleZ - 0.25; 
            if (Math.abs(z - backZ) < 0.15 && Math.abs(x - obs.x) < 0.7) {
                maxH = Math.max(maxH, 1.25);
            }

        } else {
            // --- MESA ---
            // Altura 0.95
            if (Math.abs(z - obstacleZ) < 1.0 && Math.abs(x - obs.x) < 1.2) {
                maxH = Math.max(maxH, 0.95);
            }
        }
    }
    return maxH;
}

// === 2. Verifica Colisão de Parede (Bloqueio) ===
function checkCollision(p) {
    const spacing = 8;
    const i = Math.round(p.z / spacing);
    const obstacleZ = i * spacing;
    
    if (obstacleZ > -30) return false;
    
    const rowObstacles = getRowInfo(i);
    
    for (const obs of rowObstacles) {
        if (obs.type === 'chair') {
            // --- CADEIRA ---
            
            // A. Colisão com o Assento (Só bate se o pé estiver abaixo de 0.55)
            if (p.y < 0.55 - 0.1) {
                if (Math.abs(p.z - obstacleZ) < 0.6 && Math.abs(p.x - obs.x) < 0.7) {
                    return true;
                }
            }

            // B. Colisão com o Encosto (Só bate se o pé estiver abaixo de 1.25)
            // Isso impede que você atravesse o encosto ao pular em cima do assento.
            let backZ = obstacleZ - 0.25;
            if (p.y < 1.25 - 0.1) {
                // Usamos 0.15 de raio no Z para dar um pouco de "corpo" ao encosto
                if (Math.abs(p.z - backZ) < 0.15 && Math.abs(p.x - obs.x) < 0.7) {
                    return true;
                }
            }

        } else {
            // --- MESA ---
            // Só bate se estiver abaixo do tampo (0.95)
            if (p.y < 0.95 - 0.1) {
                if (Math.abs(p.z - obstacleZ) < 1.0 && Math.abs(p.x - obs.x) < 1.2) {
                    return true;
                }
            }
        }
    }
    return false;
}

function resetGameSeed() {
    gameSeed = Math.random() * 1000;
}