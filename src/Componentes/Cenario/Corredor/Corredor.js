function addCorridor(startZ, endZ) {
    // Piso -> TRUE (Aplica textura repetida)
    quad([-3.0,0,startZ],[3.0,0,startZ],[3.0,0,endZ],[-3.0,0,endZ],[0.82,0.82,0.75], true);

    // Teto -> FALSE (Cor sólida)
    quad([-3.0,6,startZ],[3.0,6,startZ],[3.0,6,endZ],[-3.0,6,endZ],[0.9,0.88,0.85], false);

    // Paredes -> FALSE (Cor sólida)
    quad([-3.0,0,startZ],[-3.0,6,startZ],[-3.0,6,endZ],[-3.0,0,endZ],[0.95,0.9,0.85], false);
    quad([3.0,0,startZ],[3.0,6,startZ],[3.0,6,endZ],[3.0,0,endZ],[0.95,0.9,0.85], false);

    // Start Line -> FALSE
    if (0 <= startZ && 0 >= endZ) {
        quad([-3.0, 0.01, 0.5], [3.0, 0.01, 0.5], [3.0, 0.01, -0.5], [-3.0, 0.01, -0.5], [1, 1, 1], false);
    }
}
