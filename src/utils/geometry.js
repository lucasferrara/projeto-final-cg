// =============== GEOMETRIA ===============
let vertices = [];
let colors = [];
let normals = [];

function resetGeometry() {
    vertices = [];
    colors = [];
    normals = [];
}

function getGeometryData() {
    return { vertices, colors, normals };
}

function quad(a,b,c,d,color){
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
    quad(v[0],v[1],v[2],v[3],color);
    quad(v[1],v[5],v[6],v[2],color);
    quad(v[5],v[4],v[7],v[6],color);
    quad(v[4],v[0],v[3],v[7],color);
    quad(v[3],v[2],v[6],v[7],color);
    quad(v[0],v[4],v[5],v[1],color);
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
    quad(v[0],v[1],v[2],v[3],color);
    quad(v[1],v[5],v[6],v[2],color);
    quad(v[5],v[4],v[7],v[6],color);
    quad(v[4],v[0],v[3],v[7],color);
    quad(v[3],v[2],v[6],v[7],color);
    quad(v[0],v[4],v[5],v[1],color);
}
