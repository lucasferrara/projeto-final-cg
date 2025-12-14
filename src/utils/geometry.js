// =============== GEOMETRIA ===============
let vertices = [];
let colors = [];
let normals = [];
let texcoords = [];

function resetGeometry() {
    vertices = [];
    colors = [];
    normals = [];
    texcoords = [];
}

function getGeometryData() {
    return { vertices, colors, normals, texcoords };
}


function quad(a, b, c, d, color, usarTextura = true) {
    let v1 = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
    let v2 = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
    

    let normal = [
        v1[1]*v2[2] - v1[2]*v2[1],
        v1[2]*v2[0] - v1[0]*v2[2],
        v1[0]*v2[1] - v1[1]*v2[0]
    ];
    let len = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);
    normal = [normal[0]/len, normal[1]/len, normal[2]/len];
    
    vertices.push(...a, ...b, ...c,  ...a, ...c, ...d);
    
    if (usarTextura) {
        
        const scale = 0.5; 

        texcoords.push(
            a[0] * scale, a[2] * scale,
            b[0] * scale, b[2] * scale,
            c[0] * scale, c[2] * scale,
            a[0] * scale, a[2] * scale,
            c[0] * scale, c[2] * scale,
            d[0] * scale, d[2] * scale
        );
    } else {
        
        texcoords.push(
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0
        );
    }

    for (let i=0;i<6;i++) {
        colors.push(...color);
        normals.push(...normal);
    }
}

function addCube(x,y,z, w,h,d, color) {
    const v = [
        [x-w, y-h, z-d], [x+w, y-h, z-d], [x+w, y+h, z-d], [x-w, y+h, z-d],
        [x-w, y-h, z+d], [x+w, y-h, z+d], [x+w, y+h, z+d], [x-w, y+h, z+d],
    ];
   
    quad(v[0],v[3],v[2],v[1],color, false); // Trás
    quad(v[1],v[2],v[6],v[5],color, false); // Direita
    quad(v[5],v[6],v[7],v[4],color, false); // Frente
    quad(v[4],v[7],v[3],v[0],color, false); // Esquerda
    quad(v[3],v[7],v[6],v[2],color, false); // Topo
    quad(v[0],v[1],v[5],v[4],color, false); // Base
}

function addRotatedCube(x, y, z, w, h, d, color, rotation) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    
    const corners = [
        [-w, -h, -d], [w, -h, -d], [w, h, -d], [-w, h, -d],
        [-w, -h, d], [w, -h, d], [w, h, d], [-w, h, d]
    ];
    
    const tCorners = corners.map(p => {
        const rx = p[0] * cos - p[2] * sin;
        const rz = p[0] * sin + p[2] * cos;
        return [x + rx, y + p[1], z + rz];
    });
    
    const v = tCorners;
    
    quad(v[0],v[3],v[2],v[1],color, false);
    quad(v[1],v[2],v[6],v[5],color, false);
    quad(v[5],v[6],v[7],v[4],color, false);
    quad(v[4],v[7],v[3],v[0],color, false);
    quad(v[3],v[7],v[6],v[2],color, false);
    quad(v[0],v[1],v[5],v[4],color, false);
}