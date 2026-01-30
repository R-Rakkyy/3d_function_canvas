/*
    Rakkyy - 26/01/2026
    cube_test.js
*/

BACKGROUND_COLOR    = "#ad935a"
OTHER_COLOR         = "#9ead5a"
FOREGROUND_COLOR    = "hsl(300, 4%, 14%)"
TOTAL_FPS           = 45

/* Logging functions */
function LOGGER(msg) {
    console.log('[LOG]: ', msg)
}
function ERROR(msg) {
    console.error('[ERROR]: ', msg)
}

/* Render functions */

function resizeRender() {
    render.width  = Math.max(window.innerWidth * 0.574, 500)
    render.height = Math.max(window.innerHeight * 0.774, 500)
}
function initRender() {
    LOGGER('Initializing render...')

    resizeRender()
    ctx = render.getContext("2d")
    LOGGER('Render initialized.')
}
function clear() {
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(0, 0, render.width, render.height)
}
function drawPoint(x, y, color) {
    const size = 14

    ctx.fillStyle = color
    ctx.fillRect(x - size/2, y - size/2, size, size)
}

function drawnLine(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

/* Math functions */
function toScreen(objCoords) {
    return {
        x: ((objCoords.x + 1) / 2) * render.width,
        y: ((1 - (objCoords.y + 1) / 2)) * render.height
    }
}
function proj3Dto2D(point3D) {
    return {
        x: point3D.x / point3D.z,
        y: point3D.y / point3D.z,
    }
}
function translateZ(point, dz) {
    return {
        x: point.x,
        y: point.y,
        z: point.z + dz
    }
}
function rotateXZ(point, theta) {
    cosinus = Math.cos(theta)
    sinus = Math.sin(theta)
    return {
        x: point.x * cosinus - point.z * sinus,
        y: point.y,
        z: point.x * sinus + point.z * cosinus
    }
}
function rotateYZ(point, phi) {
    cosinus = Math.cos(phi)
    sinus = Math.sin(phi)
    return {
        x: point.x,
        y: point.y * cosinus - point.z * sinus,
        z: point.y * sinus + point.z * cosinus
    }
}
function rotateXY(point, psi) {
    cosinus = Math.cos(psi)
    sinus = Math.sin(psi)
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



/* Input functions */
let input_down      = false;
let input_up        = false;
let input_left      = false;
let input_right     = false;

let input_cam_in    = false;
let input_cam_out   = false;
let input_cam_left  = false;
let input_cam_right = false;

function initShapeInputs() {
    window.addEventListener('resize', () => { resizeRender() })
    window.addEventListener('orientationchange', () => { resizeRender() })
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                input_up = true
                break;
            case 'ArrowDown':
                input_down = true
                break;
            case 'ArrowLeft':
                input_left = true
                break;
            case 'ArrowRight':
                input_right = true
                break;
            case 'z':
                input_cam_in = true
                break;
            case 's':
                input_cam_out = true
                break;
            case 'd':
                input_cam_right = true
                break;
            case 'q':
                input_cam_left = true
                break;
            default:
                break;
        }
    })
    window.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                input_up = false
                break;
            case 'ArrowDown':
                input_down = false
                break;
            case 'ArrowLeft':
                input_left = false
                break;
            case 'ArrowRight':
                input_right = false
                break;
            case 'z':
                input_cam_in = false
                break;
            case 's':
                input_cam_out = false
                break;
            case 'd':
                input_cam_right = false
                break;
            case 'q':
                input_cam_left = false
                break;
            default:
                break;
        }
    })
}

function computeShapeInputs(deltaT) {
    if (!input_up && !input_down && !input_left && !input_right &&
        !input_cam_in && !input_cam_out && !input_cam_left && !input_cam_right) {
        theta += 0.2 * Math.PI * deltaT
    }
    if (input_right)
        theta += Math.PI * deltaT
    if (input_up)
        phi -= Math.PI * deltaT
    if (input_down)
        phi += Math.PI * deltaT
    if (input_left)
        theta -= Math.PI * deltaT

    if (input_cam_left)
        psi -= Math.PI * deltaT
    if (input_cam_right)
        psi += Math.PI * deltaT
    if (input_cam_in  && dz > 0.35)
        dz -= deltaT
    if (input_cam_out  && dz < 5)
        dz += deltaT

    if (dz < 0.35) dz = 0.35
    if (dz > 5) dz = 5
}

/* Animation functions */
function frame() {
    clear()

    deltaT  = 1 / TOTAL_FPS
    
    computeShapeInputs(deltaT)
    
    for (let i = 0; i < lines.length; i++) {
        let p1_3D       = translateZ(rotate(matrix[lines[i][0]], theta, phi, psi), dz)
        let p2_3D       = translateZ(rotate(matrix[lines[i][1]], theta, phi, psi), dz)

        let p1_2D       = proj3Dto2D(p1_3D)
        let p2_2D       = proj3Dto2D(p2_3D)

        let p1_screen   = toScreen(p1_2D)
        let p2_screen   = toScreen(p2_2D)

        drawnLine(ctx, p1_screen.x, p1_screen.y, p2_screen.x, p2_screen.y, FOREGROUND_COLOR)
    }

    // point on top of the cube
    point = translateZ(rotate({x:0, y: 0.45, z: 0}, theta, phi, psi), dz)
    point2D = proj3Dto2D(point)
    screenPoint = toScreen(point2D)
    drawPoint(screenPoint.x, screenPoint.y, OTHER_COLOR)
}

let matrix = [
    {x: 0.33, y: 0.33, z: 0.33},
    {x: -0.33, y: 0.33, z: 0.33},
    {x: -0.33, y: -0.33, z: 0.33},
    {x: 0.33, y: -0.33, z: 0.33},

    {x: 0.33, y: 0.33, z: -0.33},
    {x: -0.33, y: 0.33, z: -0.33},
    {x: -0.33, y: -0.33, z: -0.33},
    {x: 0.33, y: -0.33, z: -0.33},
]

let lines = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],

    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],

    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
]


let deltaT          = 0
let theta           = 0 // rotation around Y
let phi             = 0 // rotation around X
let dz              = 1 // distance from camera
let psi             = 0 // rotation around Z (camera rotation/roll)
let ctx             = null
let frameInterval   = null

initRender()
initShapeInputs()
frameInterval = setInterval(frame, 1000 / TOTAL_FPS)
