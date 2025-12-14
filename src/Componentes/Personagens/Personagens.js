
function addCharacter(px, pz, skinColor, shirtColor, pantsColor, hairColor, eyeColor, rotation = 0, walkTime = 0, py = 0) {
    const scale = 0.7;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    function drawPart(rx, ry, rz, w, h, d, col) {
        const sRx = rx * scale;
        const sRy = ry * scale;
        const sRz = rz * scale;
        const sW = w * scale;
        const sH = h * scale;
        const sD = d * scale;

        const worldX = px + (sRx * cos - sRz * sin);
        const worldZ = pz + (sRx * sin + sRz * cos);
        const worldY = py + sRy;
        addRotatedCube(worldX, worldY, worldZ, sW, sH, sD, col, rotation);
    }

    const legAmp = 0.25;
    const legL = Math.sin(walkTime) * legAmp;
    const legR = Math.sin(walkTime + Math.PI) * legAmp;
    const armL = Math.sin(walkTime + Math.PI) * legAmp;
    const armR = Math.sin(walkTime) * legAmp;

    // --- CABEÇA ---
    
    drawPart(0, 2.5, 0, 0.38, 0.4, 0.38, skinColor);
    // Pescoço 
    drawPart(0, 2.2, 0, 0.12, 0.1, 0.12, skinColor);
// --- CABELO ---
    
    drawPart(0, 2.75, 0, 0.44, 0.2, 0.44, hairColor);
    
   
    drawPart(0, 2.9, 0, 0.3, 0.15, 0.3, hairColor);

    
    drawPart(0, 2.5, 0.4, 0.44, 0.3, 0.08, hairColor);
    // --- ROSTO ---
    
    drawPart(-0.12, 2.55, -0.38, 0.08, 0.08, 0.02, [1,1,1]);
    drawPart(0.12, 2.55, -0.38, 0.08, 0.08, 0.02, [1,1,1]);
    
    drawPart(-0.12, 2.55, -0.40, 0.04, 0.04, 0.02, eyeColor);
    drawPart(0.12, 2.55, -0.40, 0.04, 0.04, 0.02, eyeColor);
    // Boca 
    drawPart(0, 2.35, -0.38, 0.1, 0.03, 0.01, [0.4,0.1,0.1]);

    // --- CORPO
    
    drawPart(0, 1.8, 0, 0.45, 0.3, 0.25, shirtColor);
    
    drawPart(0, 1.4, 0, 0.38, 0.2, 0.22, shirtColor);

    // --- BRAÇOS 
    
    drawPart(0.5, 1.9, 0, 0.15, 0.15, 0.15, shirtColor);
    drawPart(0.5, 1.5, armR, 0.12, 0.4, 0.12, skinColor);
    
   
    drawPart(-0.5, 1.9, 0, 0.15, 0.15, 0.15, shirtColor);
    drawPart(-0.5, 1.5, armL, 0.12, 0.4, 0.12, skinColor);

    // --- PERNAS E PÉS ---
    
    drawPart(-0.18, 0.8, legL, 0.14, 0.4, 0.14, pantsColor);
    drawPart(0.18, 0.8, legR, 0.14, 0.4, 0.14, pantsColor);
    
   
    drawPart(-0.18, 0.4, legL * 1.1, 0.14, 0.4, 0.14, pantsColor);
    drawPart(0.18, 0.4, legR * 1.1, 0.14, 0.4, 0.14, pantsColor);

    // Pés 
    drawPart(-0.18, 0.1, legL * 1.2 - 0.05, 0.16, 0.12, 0.25, [0.15,0.15,0.15]);
    drawPart(0.18, 0.1, legR * 1.2 - 0.05, 0.16, 0.12, 0.25, [0.15,0.15,0.15]);
}