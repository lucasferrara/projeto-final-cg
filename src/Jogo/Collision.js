const worldMap = new Map();
const collectedBonuses = new Set(); 

function getRowInfo(rowIndex) {
    if (worldMap.has(rowIndex)) return worldMap.get(rowIndex);

    const items = [];
    const rand = Math.sin(rowIndex * 999); 

    // 1. Obstáculos (Frequentes): Se > 0.6
    if (rand > 0.6) {
        const type = (rand > 0.8) ? 'table' : 'chair';
        const posX = (Math.floor((rand * 100) % 3) - 1) * 1.5; 
        items.push({ type: type, x: posX });
    } 
    // 2. Bônus RU (Raros): Se < -0.7
    else if (rand < -0.7) {
        const posX = (Math.floor((rand * 100) % 3) - 1) * 1.5;
        const id = `${rowIndex}_${posX}`;
        if (!collectedBonuses.has(id)) {
            items.push({ type: 'bonus', x: posX, id: id });
        }
    }

    worldMap.set(rowIndex, items);
    return items;
}

function checkCollision(player) {
    const playerZIndex = Math.floor(player.z / 8);
    for (let i = playerZIndex - 1; i <= playerZIndex + 1; i++) {
        const items = getRowInfo(i);
        const itemZ = i * 8;
        for (const item of items) {
            if (item.type === 'bonus') continue;
            const dx = Math.abs(player.x - item.x);
            const dz = Math.abs(player.z - itemZ);
            if (dx < 0.7 && dz < 0.7) {
                if (item.type === 'chair' && player.y > 0.6) return false;
                return true; 
            }
        }
    }
    return false;
}

function checkBonusCollision(player) {
    const playerZIndex = Math.floor(player.z / 8);
    for (let i = playerZIndex - 1; i <= playerZIndex + 1; i++) {
        const items = getRowInfo(i);
        const itemZ = i * 8;
        for (let k = 0; k < items.length; k++) {
            const item = items[k];
            if (item.type !== 'bonus') continue;

            const dx = Math.abs(player.x - item.x);
            const dz = Math.abs(player.z - itemZ);
            if (dx < 0.8 && dz < 0.8 && player.y < 1.0) {
                collectedBonuses.add(item.id);
                items.splice(k, 1); 
                return true; 
            }
        }
    }
    return false;
}

function resetGameSeed() {
    worldMap.clear();
    collectedBonuses.clear();
}
