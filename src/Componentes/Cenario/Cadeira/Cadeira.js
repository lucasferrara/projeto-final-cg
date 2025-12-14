function addChair(x, z) {
    // Mudei de [0.1, 0.1, 0.1] para [0.6, 0.4, 0.2] (Tom de Madeira/Castanho)
    // Assim ela vai brilhar quando o holofote passar por cima.
    const chairColor = [0.6, 0.4, 0.2]; 
    
    // Seat
    addCube(x, 0.5, z, 0.4, 0.05, 0.3, chairColor);
    // Back
    addCube(x, 0.9, z - 0.25, 0.4, 0.35, 0.05, chairColor);
    // Legs
    const h = 0.45, s = 0.04;
    addCube(x - 0.35, h/2, z - 0.25, s, h/2, s, chairColor);
    addCube(x + 0.35, h/2, z - 0.25, s, h/2, s, chairColor);
    addCube(x - 0.35, h/2, z + 0.25, s, h/2, s, chairColor);
    addCube(x + 0.35, h/2, z + 0.25, s, h/2, s, chairColor);
}