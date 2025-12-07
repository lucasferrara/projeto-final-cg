// ============ PERSONAGENS =============
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

    const legAmp = 0.2;
    const legL = Math.sin(walkTime) * legAmp;
    const legR = Math.sin(walkTime + Math.PI) * legAmp;
    const armL = Math.sin(walkTime + Math.PI) * legAmp;
    const armR = Math.sin(walkTime) * legAmp;

    // Head
    drawPart(0, 2.4, 0, 0.4, 0.4, 0.4, skinColor);
    // Hair
    drawPart(0, 2.75, 0, 0.45, 0.1, 0.45, hairColor);
    drawPart(0, 2.5, 0.4, 0.45, 0.3, 0.05, hairColor);
    // Eyes
    drawPart(-0.15, 2.5, -0.4, 0.1, 0.08, 0.02, [1,1,1]);
    drawPart(0.15, 2.5, -0.4, 0.1, 0.08, 0.02, [1,1,1]);
    drawPart(-0.15, 2.5, -0.41, 0.05, 0.05, 0.02, eyeColor);
    drawPart(0.15, 2.5, -0.41, 0.05, 0.05, 0.02, eyeColor);
    // Mouth
    drawPart(0, 2.2, -0.4, 0.15, 0.04, 0.02, [0.4,0.2,0.1]);

    // Body
    drawPart(0, 1.5, 0, 0.4, 0.5, 0.2, shirtColor);

    // Arms
    drawPart(-0.5, 1.5, armL, 0.15, 0.5, 0.15, skinColor);
    drawPart(0.5, 1.5, armR, 0.15, 0.5, 0.15, skinColor);

    // Legs
    drawPart(-0.15, 0.5, legL, 0.15, 0.5, 0.15, pantsColor);
    drawPart(0.15, 0.5, legR, 0.15, 0.5, 0.15, pantsColor);
    
    // Feet
    drawPart(-0.15, 0.1, legL, 0.18, 0.1, 0.18, [0.1,0.1,0.1]);
    drawPart(0.15, 0.1, legR, 0.18, 0.1, 0.18, [0.1,0.1,0.1]);
}
