// ARQUIVO: src/Jogo/Collision.js

const worldMap = new Map();
let gameSeed = Math.random() * 1000;
const collectedBonuses = new Set(); 

function pseudoRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getRowInfo(index) {
    // 1. OTIMIZAÇÃO: Se já calculamos essa linha antes, devolve a memória salva!
    if (worldMap.has(index)) {
        return worldMap.get(index);
    }

    // Se não calculamos, faz a conta agora:
    const effectiveSeed = index + gameSeed;
    const rnd = pseudoRandom(effectiveSeed);
    const typeRnd = pseudoRandom(effectiveSeed + 123.45);
    
    // --- Lógica de Bônus (5% de chance) ---
    const bonusRnd = pseudoRandom(effectiveSeed + 999);
    if (bonusRnd < 0.05) { 
        const lanes = [-2, 0, 2];
        const laneIdx = Math.floor(pseudoRandom(effectiveSeed + 888) * 3);
        const bonusX = lanes[laneIdx];
        const id = `${index}_${bonusX}`;

        if (!collectedBonuses.has(id)) {
            const result = [{ x: bonusX, type: 'bonus', id: id }];
            worldMap.set(index, result); // SALVA NO CACHE
            return result;
        }
    }

    // --- Lógica de Obstáculos ---
    const obstacles = [];
    const positions = [];
    
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

    worldMap.set(index, obstacles); // SALVA NO CACHE
    return obstacles;
}

function checkCollision(p) {
    if (p.y > 1.0) return false;

    const spacing = 8;
    const i = Math.round(p.z / spacing);
    const obstacleZ = i * spacing;
    
    if (obstacleZ > -30) return false;
    
    const rowObstacles = getRowInfo(i);
    
    for (const obs of rowObstacles) {
        if (obs.type === 'bonus') continue;

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

function checkBonusCollision(p) {
    const spacing = 8;
    const i = Math.round(p.z / spacing);
    const obstacleZ = i * spacing;
    
    const rowObstacles = getRowInfo(i);

    for (const obs of rowObstacles) {
        if (obs.type !== 'bonus') continue;

        if (Math.abs(p.z - obstacleZ) < 0.8) {
            if (Math.abs(p.x - obs.x) < 0.8) {
                collectedBonuses.add(obs.id);
                // Atualiza o cache para remover o bônus visualmente na hora
                // (Opcional, mas bom para garantir que suma)
                return true;
            }
        }
    }
    return false;
}

function resetGameSeed() {
    gameSeed = Math.random() * 1000;
    worldMap.clear(); // Limpa a memória ao reiniciar
    collectedBonuses.clear();
}

setInterval(() => {
    if (worldMap.size > 200) {
        worldMap.clear();
    }
}, 5000);
