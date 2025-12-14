function addTable(x,z){
    // Mudei de [1.0, 1.0, 1.0] para [0.85, 0.85, 0.85]
    // Isso é "Branco Suficiente" para os olhos, mas baixo o suficiente 
    // para não ativar o brilho automático das lâmpadas (que é > 0.90).
    const tableColor = [0.85, 0.85, 0.85];
    
    const legColor = [0.4,0.25,0.15];
    addCube(x, 0.85, z, 0.9, 0.1, 0.7, tableColor);
    const h = 0.8, s = 0.05;
    addCube(x-0.75, h/2, z-0.55, s, h/2, s, legColor);
    addCube(x+0.75, h/2, z-0.55, s, h/2, s, legColor);
    addCube(x-0.75, h/2, z+0.55, s, h/2, s, legColor);
    addCube(x+0.75, h/2, z+0.55, s, h/2, s, legColor);
}