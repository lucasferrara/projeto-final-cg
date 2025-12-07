let gameSeed = Math.random() * 1000;
const collectedBonuses = new Set(); // Guarda quais bilhetes já foram pegos

function pseudoRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Função que decide o que aparece em cada linha
function getRowInfo(index) {
    const effectiveSeed = index + gameSeed;
    const rnd = pseudoRandom(effectiveSeed);
    const typeRnd = pseudoRandom(effectiveSeed + 123.45);
    
    // --- LÓGICA DE BÔNUS (RU) ---
    // Chance rara (5%) de aparecer um bônus.
    const bonusRnd = pseudoRandom(effectiveSeed + 999);
    
    if (bonusRnd < 0.05) { // 5% de chance
        const lanes = [-2, 0, 2];
        const laneIdx = Math.floor(pseudoRandom(effectiveSeed + 888) * 3);
        const bonusX = lanes[laneIdx];
        const id = `${index}_${bonusX}`;

        // Se ainda não pegou, retorna o bônus
        if (!collectedBonuses.has(id)) {
            return [{ x: bonusX, type: 'bonus', id: id }];
        }
    }

    // --- LÓGICA DE OBSTÁCULOS (Mesa/Cadeira) ---
    // Mantendo a lógica original do seu projeto
    const obstacles = [];
    const positions = [];
    
    // Distribuição das posições (Esquerda, Direita, Centro ou Combinações)
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

// Verifica colisão com obstáculos físicos
function checkCollision(p) {
    if (p.y > 1.0) return false; // Se pular alto, não bate

    const spacing = 8;
    const i = Math.round(p.z / spacing);
    const obstacleZ = i * spacing;
    
    // Zona Segura no início
    if (obstacleZ > -30) return false;
    
    const rowObstacles = getRowInfo(i);
    
    for (const obs of rowObstacles) {
        if (obs.type === 'bonus') continue; // Bônus não tem colisão física

        const isChair = obs.type === 'chair';
        const obsSize = isChair ? 0.4 : 0.9;
        const thresholdZ = obsSize + 0.15; 
        const thresholdX = obsSize + 0.3;

        if (Math.abs(p.z - obstacleZ) < thresholdZ) {
            if (Math.abs(p.x - obs.x) < thresholdX) {
                return true;
            }
        }
    }
    return false;
}

// Verifica colisão com o Bilhete do RU
function checkBonusCollision(p) {
    const spacing = 8;
    const i = Math.round(p.z / spacing);
    const obstacleZ = i * spacing;
    
    const rowObstacles = getRowInfo(i);

    for (const obs of rowObstacles) {
        if (obs.type !== 'bonus') continue;

        // Raio de coleta do bônus
        if (Math.abs(p.z - obstacleZ) < 0.8) {
            if (Math.abs(p.x - obs.x) < 0.8) {
                collectedBonuses.add(obs.id); // Marca como pego
                return true;
            }
        }
    }
    return false;
}

function resetGameSeed() {
    gameSeed = Math.random() * 1000;
    collectedBonuses.clear();
}
