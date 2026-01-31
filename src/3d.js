function rotateXZ(point, theta) { // around Y
    const cosinus = Math.cos(theta)
    const sinus = Math.sin(theta)
    return {
        x: point.x * cosinus + point.z * sinus,
        y: point.y,
        z: -point.x * sinus + point.z * cosinus
    }
}
function rotateYZ(point, phi) { // around X
    const cosinus = Math.cos(phi)
    const sinus = Math.sin(phi)
    return {
        x: point.x,
        y: point.y * cosinus - point.z * sinus,
        z: point.y * sinus + point.z * cosinus
    }
}
function rotateXY(point, psi) { // around Z
    const cosinus = Math.cos(psi)
    const sinus = Math.sin(psi)
    return {
        x: point.x * cosinus - point.y * sinus,
        y: point.x * sinus + point.y * cosinus,
        z: point.z
    }
}
function rotate(point, theta, phi, psi) {
    let rotatedPoint = rotateXZ(point, theta)
    rotatedPoint     = rotateYZ(rotatedPoint, phi)
    rotatedPoint     = rotateXY(rotatedPoint, psi)
    return rotatedPoint
}
function proj3Dto2D(point3D) {
    if (point3D.z <= 0) return null
    return {
        x: point3D.x / point3D.z,
        y: point3D.y / point3D.z,
    }
}
function toScreen(point2D) {
    return {
        x: Math.floor((point2D.x + 1) * render.width / 2),
        y: Math.floor((1 - point2D.y) * render.height / 2)
    }
}

function transformToCameraView(p_world) {
    const p_relative = {
        x: p_world.x - camera.x,
        y: p_world.y - camera.y,
        z: p_world.z - camera.z
    }
    return rotateYZ(rotateXZ(p_relative, -camera.yaw), -camera.pitch)
}


function getColorFromAxis(val, axis) {
    if (SETTINGS.coloring_mode.toLowerCase() === 'none') return OTHER_COLOR
    let min_val = -20
    let max_val = 20

    if (axis === 'x') {
        min_val = shape.x_min
        max_val = shape.x_max
    } else if (axis === 'y') {
        min_val = shape.y_min
        max_val = shape.y_max
    }

    const percentage            = (Math.max(min_val, Math.min(val, max_val)) - min_val) / (max_val - min_val)

    const start_hue             = 120
    const end_hue               = 10
    const hue                   = start_hue + percentage * (end_hue - start_hue)

    const start_saturation      = 70
    const end_saturation        = 100
    const saturation            = start_saturation + percentage * (end_saturation - start_saturation)

    const start_lightness       = 80
    const end_lightness         = 45
    const lightness             = start_lightness + percentage * (end_lightness - start_lightness)

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

function crossProduct(v1, v2) {
    return {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    }
}

function normalize(v) {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
    if (length === 0) return { x: 0, y: 0, z: 0 }
    return { x: v.x / length, y: v.y / length, z: v.z / length }
}

function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
}

function subtract(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }
}

function getColorFromDepth(depth) {
    if (SETTINGS.coloring_mode.toLowerCase() === 'none') return OTHER_COLOR
    const min_depth             = -5
    const max_depth             = 5
    const percentage            = (Math.max(min_depth, Math.min(depth, max_depth)) - min_depth) / (max_depth - min_depth)

    const start_lightness       = 90
    const end_lightness         = 30
    const lightness             = start_lightness + percentage * (end_lightness - start_lightness)

    return `hsl(200, 50%, ${lightness}%)`
}
