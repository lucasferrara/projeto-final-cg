// src/Componentes/Cenario/Lampada/Lampada.js

function addLamp(z) {
    
    const lampColor = [1.0, 1.0, 0.8]; 

    addCube(0, 5.95, z, 0.3, 0.05, 0.3, [0.2, 0.2, 0.2]); 
    addCube(0, 5.85, z, 0.15, 0.05, 0.15, lampColor);
}