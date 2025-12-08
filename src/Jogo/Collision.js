// Gera números pseudo-aleatórios para garantir que ambos jogadores vejam o mesmo cenário
function pseudoRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getRowInfo(index, currentSeed) {
    const effectiveSeed = index + currentSeed;
    const rnd = pseudoRandom(effectiveSeed);
    const typeRnd = pseudoRandom(effectiveSeed + 123.45); // Seed para tipo de objeto
    const ticketRnd = pseudoRandom(effectiveSeed + 999.99); // Seed específica para bilhetes
    
    const obstacles = [];
    const positions = [];
    
    // Distribuição das posições (Esquerda, Direita, Centro)
    if (rnd < 0.20) positions.push(-2);
    else if (rnd < 0.40) positions.push(2);
    else if (rnd < 0.55) positions.push(0);
    else if (rnd < 0.70) positions.push(-2, 2);
    else if (rnd < 0.85) positions.push(-2, 0);
    else positions.push(0, 2);
    
    positions.forEach((x, i) => {
        // === LÓGICA 1: BILHETES COM MENOS FREQUÊNCIA ===
        // 15% de chance de ser Ticket, 85% de chance de ser obstáculo
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

// Retorna um objeto detalhado sobre a colisão
function checkCollision(p, currentSeed, collectedTicketsSet) {
    if (p.y > 1.0) return { hit: false, type: null, id: null };

    const spacing = 8;
    const i = Math.round(p.z / spacing);
    const obstacleZ = i * spacing;
    
    // Zona segura inicial
    if (obstacleZ > -30) return { hit: false, type: null, id: null };
    
    const rowObstacles = getRowInfo(i, currentSeed);
    
    for (const obs of rowObstacles) {
        // Define tamanhos de colisão
        const isTicket = obs.type === 'ticket';
        const obsSize = isTicket ? 0.3 : (obs.type === 'chair' ? 0.4 : 0.9);
        
        const thresholdZ = obsSize + 0.15; 
        const thresholdX = obsSize + 0.3;

        // Checa sobreposição
        if (Math.abs(p.z - obstacleZ) < thresholdZ) {
            if (Math.abs(p.x - obs.x) < thresholdX) {
                
                // Se for Ticket
                if (isTicket) {
                    const tId = `${i}_${obs.x}`; // ID único (linha + posição X)
                    
                    // Se já pegou, ignora (não colide)
                    if (collectedTicketsSet.has(tId)) {
                        return { hit: false, type: 'ticket_collected', id: null };
                    }
                    // Se não pegou, retorna que acertou um ticket
                    return { hit: true, type: 'ticket', id: tId };
                }

                // Se for Obstáculo (Mesa/Cadeira)
                return { hit: true, type: 'obstacle', id: null };
            }
        }
    }
    return { hit: false, type: null, id: null };
}
