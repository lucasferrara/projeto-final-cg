function addCorridor(startZ, endZ) {
    // Piso
    quad([-3.0,0,startZ],[3.0,0,startZ],[3.0,0,endZ],[-3.0,0,endZ],[0.82,0.82,0.75]);
    // Teto
    quad([-3.0,6,startZ],[3.0,6,startZ],[3.0,6,endZ],[-3.0,6,endZ],[0.9,0.88,0.85]);
    // Paredes
    quad([-3.0,0,startZ],[-3.0,6,startZ],[-3.0,6,endZ],[-3.0,0,endZ],[0.95,0.9,0.85]);
    quad([3.0,0,startZ],[3.0,6,startZ],[3.0,6,endZ],[3.0,0,endZ],[0.95,0.9,0.85]);

    // Start Line at Z = 0
    if (0 <= startZ && 0 >= endZ) {
        // White strip
        quad([-3.0, 0.01, 0.5], [3.0, 0.01, 0.5], [3.0, 0.01, -0.5], [-3.0, 0.01, -0.5], [1, 1, 1]);
    }
}
