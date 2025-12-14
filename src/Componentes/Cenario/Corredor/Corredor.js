function addCorridor(startZ, endZ) {
    
    quad([-3.0,0,startZ],[3.0,0,startZ],[3.0,0,endZ],[-3.0,0,endZ],[0.82,0.82,0.75], true);

    
    quad([-3.0,6,startZ],[3.0,6,startZ],[3.0,6,endZ],[-3.0,6,endZ],[0.3,0.3,0.3], false);

  
    const wallColor = [0.4, 0.45, 0.5]; 

    quad([-3.0,0,startZ],[-3.0,6,startZ],[-3.0,6,endZ],[-3.0,0,endZ], wallColor, false);
    quad([3.0,0,startZ],[3.0,6,startZ],[3.0,6,endZ],[3.0,0,endZ], wallColor, false);

    
    if (0 <= startZ && 0 >= endZ) {
        quad([-3.0, 0.01, 0.5], [3.0, 0.01, 0.5], [3.0, 0.01, -0.5], [-3.0, 0.01, -0.5], [1, 1, 1], false);
    }
}