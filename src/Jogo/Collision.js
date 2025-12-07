function pseudoRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Gera a linha baseada no índice e na semente do jogo
function getRowInfo(index, currentSeed) {
    const effectiveSeed = index + currentSeed;
    const rnd = pseudoRandom(effectiveSeed);
    const typeRnd = pseudoRandom(effectiveSeed + 123.45);
    const ticketRnd = pseudoRandom(effectiveSeed + 999.99); // Seed específica para bilhetes
    
    const obstacles = [];
    const positions = [];
    
    // Distribuição de Posições
    // 0.0-0.2: Esq(-2) | 0.2-0.4: Dir(2) | 0.4-0.55: Centro(0)
    // 0.55-0.7: E+D | 0.7-0.85: E+C | 0.85-1.0: D+C
    if (rnd < 0.20) positions.push(-2);
    else if (rnd < 0.40) positions.push(2);
    else if (rnd < 0.55) positions.push(0);
    else if (rnd < 0.70) positions.push(-2, 2);
    else if (rnd < 0.85) positions.push(-2, 0);
    else positions.push(0, 2);
    
    positions.forEach((x, i) => {
        // Lógica de raridade do Bilhete (15% de chance)
        let type;
        if (pseudoRandom(ticketRnd + i) < 0.15) {
            type = 'ticket';
        } else {
            type = (pseudoRandom(typeRnd + i) > 0.5) ? 'chair' : 'table';
        }

        obstacles.push({ x, type: type });
    });
    return obstacles;
}

// Retorna um objeto indicando o que aconteceu: { hit: boolean, ticketId: string|null }
function checkCollision(p, currentSeed, collectedTicketsSet) {
    if (p.y > 1.0) return { hit: false, ticketId: null };

    const spacing = 8;
    const i = Math.round(p.z / spacing);
    const obstacleZ = i * spacing;
    
    // Zona Segura
    if (obstacleZ > -30) return { hit: false, ticketId: null };
    
    const rowObstacles = getRowInfo(i, currentSeed);
    
    for (const obs of rowObstacles) {
        const isTicket = obs.type === 'ticket';
        // Tamanhos de colisão
        const obsSize = isTicket ? 0.3 : (obs.type === 'chair' ? 0.4 : 0.9);
        const thresholdZ = obsSize + 0.15; 
        const thresholdX = obsSize + 0.3;

        // Verifica sobreposição
        if (Math.abs(p.z - obstacleZ) < thresholdZ) {
            if (Math.abs(p.x - obs.x) < thresholdX) {
                
                if (isTicket) {
                    const tId = `${i}_${obs.x}`; // ID único do bilhete
                    // Se ainda não pegou, retorna o ID para processar na main
                    if (!collectedTicketsSet.has(tId)) {
                        return { hit: false, ticketId: tId };
                    }
                    // Se já pegou, não colide
                    return { hit: false, ticketId: null };
                }

                // Colisão com mesa ou cadeira
                return { hit: true, ticketId: null };
            }
        }
    }
    return { hit: false, ticketId: null };
}
