// Vertex shader: Recebe Normais e calcula a iluminação
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec3 a_normal;

    uniform mat4 u_matrix;       
    uniform mat4 u_normalMatrix; 

    uniform vec3 u_lightWorldDirection; 
    
    varying vec3 v_normal;

    void main() {
        gl_Position = u_matrix * a_position;
        v_normal = mat3(u_normalMatrix) * a_normal;
    }
`;

// Fragment shader
const fragmentShaderSource = `
    precision mediump float;

    varying vec3 v_normal;
    
    uniform vec4 u_color;
    uniform vec3 u_lightWorldDirection;

    void main() {
        vec3 normal = normalize(v_normal);
        vec3 lightDir = normalize(u_lightWorldDirection);

        float light = dot(normal, lightDir);
        float brightness = max(light, 0.0) * 0.7 + 0.3;

        gl_FragColor = vec4(u_color.rgb * brightness, u_color.a);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Erro shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Erro programa:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function setCubeVertices() {
    return new Float32Array([
        // Frente (Z+)
        -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,
        -0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
        // Trás (Z-)
        -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,
        -0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
        // Topo (Y+)
        -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,
        -0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,
        // Fundo (Y-)
        -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,
        -0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,
        // Direita (X+)
         0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,
         0.5, -0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,
        // Esquerda (X-)
        -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,
        -0.5, -0.5, -0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5,
    ]);
}

function setCubeNormals() {
    return new Float32Array([
        // Frente
         0,  0,  1,   0,  0,  1,   0,  0,  1,
         0,  0,  1,   0,  0,  1,   0,  0,  1,
        // Trás
         0,  0, -1,   0,  0, -1,   0,  0, -1,
         0,  0, -1,   0,  0, -1,   0,  0, -1,
        // Topo
         0,  1,  0,   0,  1,  0,   0,  1,  0,
         0,  1,  0,   0,  1,  0,   0,  1,  0,
        // Fundo
         0, -1,  0,   0, -1,  0,   0, -1,  0,
         0, -1,  0,   0, -1,  0,   0, -1,  0,
        // Direita
         1,  0,  0,   1,  0,  0,   1,  0,  0,
         1,  0,  0,   1,  0,  0,   1,  0,  0,
        // Esquerda
        -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
        -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
    ]);
}

function resizeCanvasToDisplaySize(canvas) {
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;
    if (needResize) {
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
    return needResize;
}

function main() {
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const normalLocation = gl.getAttribLocation(program, 'a_normal');
    
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const lightDirectionLocation = gl.getUniformLocation(program, 'u_lightWorldDirection');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, setCubeVertices(), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, setCubeNormals(), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalLocation);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.8, 0.9, 1.0, 1.0); 

    let cameraAngleY = 0;
    let cameraAngleX = 0;
    let cameraRadius = 10;
    let fieldOfView = 60;

    window.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft': cameraAngleY += 5; break;
            case 'ArrowRight': cameraAngleY -= 5; break;
            case 'ArrowUp': cameraAngleX = Math.max(-89, cameraAngleX - 5); break;
            case 'ArrowDown': cameraAngleX = Math.min(89, cameraAngleX + 5); break;
            case 'w': case 'W': cameraRadius = Math.max(2, cameraRadius - 0.5); break;
            case 's': case 'S': cameraRadius = Math.min(20, cameraRadius + 0.5); break;
        }
    });

    function drawPart(viewProjectionMatrix, translation, scale, color) {
        let worldMatrix = m4.identity();
        worldMatrix = m4.translate(worldMatrix, translation[0], translation[1], translation[2]);
        worldMatrix = m4.scale(worldMatrix, scale[0], scale[1], scale[2]);

        let finalMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
        let normalMatrix = m4.transpose(m4.inverse(worldMatrix));

        gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);
        gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
        gl.uniform4fv(colorLocation, color);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    function render(time) {
        time *= 0.001; 

        if (resizeCanvasToDisplaySize(gl.canvas)) {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const lightDir = m4.normalize([0.5, 0.7, 1.0]);
        gl.uniform3fv(lightDirectionLocation, lightDir);

        const aspect = gl.canvas.width / gl.canvas.height;
        const projectionMatrix = m4.perspective(degToRad(fieldOfView), aspect, 1, 2000);

        let y = Math.sin(degToRad(cameraAngleX)) * cameraRadius;
        let r = Math.cos(degToRad(cameraAngleX)) * cameraRadius;
        let x = Math.sin(degToRad(cameraAngleY)) * r;
        let z = Math.cos(degToRad(cameraAngleY)) * r;

        const cameraPosition = [x, y + 2, z];
        const target = [0, 2, 0];
        const up = [0, 1, 0];
        
        const cameraMatrix = m4.lookAt(cameraPosition, target, up);
        const viewMatrix = m4.inverse(cameraMatrix);
        const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        const skinColor = [0.9, 0.7, 0.6, 1.0]; 
        const shirtColor = [0.0, 0.6, 0.7, 1.0]; 
        const pantsColor = [0.2, 0.2, 0.7, 1.0]; 
        const hairColor = [0.25, 0.15, 0.1, 1.0]; 
        const eyeWhiteColor = [1.0, 1.0, 1.0, 1.0];
        const eyePupilColor = [0.2, 0.2, 0.8, 1.0];
        const mouthColor = [0.4, 0.2, 0.1, 1.0];
        const bootsColor = [0.1, 0.1, 0.1, 1.0];   // Botas Pretas

        drawPart(viewProjectionMatrix, [0, 2.4, 0], [0.8, 0.8, 0.8], skinColor);
        drawPart(viewProjectionMatrix, [0, 1.5, 0], [0.8, 1.0, 0.4], shirtColor);
        drawPart(viewProjectionMatrix, [-0.6, 1.5, 0], [0.4, 1.0, 0.4], skinColor);
        drawPart(viewProjectionMatrix, [0.6, 1.5, 0], [0.4, 1.0, 0.4], skinColor);
        drawPart(viewProjectionMatrix, [-0.2, 0.5, 0], [0.4, 1.0, 0.4], pantsColor);
        drawPart(viewProjectionMatrix, [0.2, 0.5, 0], [0.4, 1.0, 0.4], pantsColor);

        drawPart(viewProjectionMatrix, [0, 2.85, 0], [0.85, 0.15, 0.85], hairColor);
        drawPart(viewProjectionMatrix, [0, 2.5, -0.42], [0.85, 0.6, 0.1], hairColor);
        drawPart(viewProjectionMatrix, [0.42, 2.5, 0], [0.1, 0.6, 0.85], hairColor);
        drawPart(viewProjectionMatrix, [-0.42, 2.5, 0], [0.1, 0.6, 0.85], hairColor);

        drawPart(viewProjectionMatrix, [-0.19, 2.5, 0.41], [0.25, 0.12, 0.05], eyeWhiteColor);
        drawPart(viewProjectionMatrix, [0.19, 2.5, 0.41], [0.25, 0.12, 0.05], eyeWhiteColor);
        drawPart(viewProjectionMatrix, [0, 2.25, 0.41], [0.4, 0.1, 0.05], mouthColor);

        drawPart(viewProjectionMatrix, [-0.2, 0.15, 0], [0.44, 0.3, 0.44], bootsColor);
        drawPart(viewProjectionMatrix, [0.2, 0.15, 0], [0.44, 0.3, 0.44], bootsColor);
        
        let eyeSpeed = 3.0; 
        let eyeOffset = Math.sin(time * eyeSpeed) * 0.07; 
        let leftEyePos = -0.19 + eyeOffset; 
        let rightEyePos = 0.19 + eyeOffset; 

        drawPart(viewProjectionMatrix, [leftEyePos, 2.5, 0.42], [0.12, 0.12, 0.05], eyePupilColor);
        drawPart(viewProjectionMatrix, [rightEyePos, 2.5, 0.42], [0.12, 0.12, 0.05], eyePupilColor);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
window.onload = main;