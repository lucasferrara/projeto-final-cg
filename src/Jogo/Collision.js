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
    
    // 0.0-0.2: Left(-2), 0.2-0.4: Right(2), 0.4-0.55: Center(0)
    // 0.55-0.7: L+R, 0.7-0.85: L+C, 0.85-1.0: R+C
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

function checkCollision(p) {
    if (p.y > 1.0) return false;

    const spacing = 8;
    const i = Math.round(p.z / spacing);
    const obstacleZ = i * spacing;
    
    // Safe Zone: No obstacles before Z = -30
    if (obstacleZ > -30) return false;
    
    const rowObstacles = getRowInfo(i);
    
    for (const obs of rowObstacles) {
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

function resetGameSeed() {
    gameSeed = Math.random() * 1000;
}
