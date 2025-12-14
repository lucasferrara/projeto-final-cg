// src/Componentes/Cenario/Lampada/Lampada.js

function addLamp(z) {
    // Cor brilhante [R, G, B]. 
    // Como R e G são > 0.90, o Shader vai fazê-la brilhar.
    const lampColor = [1.0, 1.0, 0.8]; 

    // 1. Base no teto (caixa achatada)
    addCube(0, 5.95, z, 0.3, 0.05, 0.3, [0.2, 0.2, 0.2]); // Base cinza escura

    // 2. A "Lâmpada" (parte que brilha)
    // Um cubo menor e mais baixo, simulando o bulbo/vidro
    addCube(0, 5.85, z, 0.15, 0.05, 0.15, lampColor);
}