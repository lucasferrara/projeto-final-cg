function addCorridor(startZ, endZ) {
    // Piso (Mantém igual)
    quad([-3.0,0,startZ],[3.0,0,startZ],[3.0,0,endZ],[-3.0,0,endZ],[0.82,0.82,0.75], true);

    // Teto (Cinza escuro para não distrair)
    quad([-3.0,6,startZ],[3.0,6,startZ],[3.0,6,endZ],[-3.0,6,endZ],[0.3,0.3,0.3], false);

    // === PAREDES ===
    // Cor alterada para: [0.4, 0.45, 0.5] (Um cinza azulado "Concreto")
    // É suave, não cansa a vista e reage bem à pouca luz.
    const wallColor = [0.4, 0.45, 0.5]; 

    quad([-3.0,0,startZ],[-3.0,6,startZ],[-3.0,6,endZ],[-3.0,0,endZ], wallColor, false);
    quad([3.0,0,startZ],[3.0,6,startZ],[3.0,6,endZ],[3.0,0,endZ], wallColor, false);

    // Start Line (Mantém igual)
    if (0 <= startZ && 0 >= endZ) {
        quad([-3.0, 0.01, 0.5], [3.0, 0.01, 0.5], [3.0, 0.01, -0.5], [-3.0, 0.01, -0.5], [1, 1, 1], false);
    }
}