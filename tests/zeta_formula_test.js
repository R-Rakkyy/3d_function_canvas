/*
    Rakkyy - 28/01/2026
    zeta_formula_test.js
*/

BACKGROUND_COLOR    = "#ad935a"
OTHER_COLOR         = "#535741"
FOREGROUND_COLOR    = "hsl(300, 4%, 14%)"
TOTAL_FPS           = 45
BASE_NX             = 50
BASE_NY             = 50

Nx                  = BASE_NX
Ny                  = BASE_NY
x_min               = -.5
x_max               = 1.35
y_min               = -.5
y_max               = 2


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
    const size = 2

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

function drawCircle(x, y, radius, color) {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.stroke()
}

function drawRectangle(x, y, width, height, color) {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
}

function drawTriangle(x1, y1, x2, y2, x3, y3, color) {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.closePath()
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
    if (point3D.z === 0)
        return null
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
                break
            case 'ArrowDown':
                input_down = true
                break
            case 'ArrowLeft':
                input_left = true
                break
            case 'ArrowRight':
                input_right = true
                break
            case 'z':
                input_cam_in = true
                break
            case 's':
                input_cam_out = true
                break
            case 'd':
                input_cam_right = true
                break
            case 'q':
                input_cam_left = true
                break
            default:
                break
        }
    })
    window.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                input_up = false
                break
            case 'ArrowDown':
                input_down = false
                break
            case 'ArrowLeft':
                input_left = false
                break
            case 'ArrowRight':
                input_right = false
                break
            case 'z':
                input_cam_in = false
                break
            case 's':
                input_cam_out = false
                break
            case 'd':
                input_cam_right = false
                break
            case 'q':
                input_cam_left = false
                break
            default:
                break
        }
    })
}

function computeShapeInputs(deltaT) {

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
    if (input_cam_in)
        dz -= deltaT
    if (input_cam_out)
        dz += deltaT

    if (dz < 0.001) dz = 0.001
    if (dz > 50) dz = 50

    Nx = Math.floor(BASE_NX + dz * 10)
    Ny = Math.floor(BASE_NY + dz * 10)
}

let vertices            = []
let ZETA_FUNC_SCALE     = 0.5
let ZETA_FUNC_OFFSET    = -2.0
let ZETA_N_TERMS        = 100

let zeta_time           = 0.0
let zeta_time_speed     = 0.5

function zetaApprox(sigma, t, max_terms = ZETA_N_TERMS) {
    // Using Dirichlet series approximation
    if (sigma > 1.0) {
        let re          = 0.0
        let im          = 0.0
        for (let n = 1; n <= max_terms; n++) {
            let denom_re = Math.pow(n, sigma)
            let denom_im = Math.pow(n, sigma) * Math.log(n) * t

            re          += Math.cos(denom_im) / denom_re
            im          -= Math.sin(denom_im) / denom_re
        }
        return {re: re, im: im}
    // Using the relation zeta(s) = (1 - 2^(1-s)) * eta(s)
    // where eta(s) is the Dirichlet eta function
    } else {
        let eta_re           = 0.0
        let eta_im           = 0.0
        for (let n = 1; n <= max_terms; n++) {
            let denom_re = Math.pow(n, sigma)
            let denom_im = Math.pow(n, sigma) * Math.log(n) * t

            eta_re          += (n % 2 == 1 ? Math.cos(denom_im) / denom_re : -Math.cos(denom_im) / denom_re)
            eta_im          -= (n % 2 == 1 ? Math.sin(denom_im) / denom_re : -Math.sin(denom_im) / denom_re)
        }
        return {
            re: (1.0 - Math.pow(2.0, 1.0 - sigma)) * eta_re,
            im: (1.0 - Math.pow(2.0, 1.0 - sigma)) * eta_im
        }
    }
}


function computeFunction(deltaT) {
    let minY = Infinity, maxY = -Infinity
    for (let i = 0; i < Nx; i++) {
        let x = x_min + (x_max - x_min) * (i / (Nx - 1))
        for (let j = 0; j < Ny; j++) {
            let y                       = y_min + (y_max - y_min) * (j / (Ny - 1))
            let s_sigma                 = x
            let s_t                     = y + zeta_time // shift to first zero
            let zeta_val                = zetaApprox(s_sigma, s_t)
            let h                       = Math.log(1.0 + Math.sqrt(zeta_val.re * zeta_val.re + zeta_val.im * zeta_val.im))
            let z                       = h * ZETA_FUNC_SCALE + ZETA_FUNC_OFFSET
            if (!isFinite(z) || isNaN(z)) z = -10.0
            
            vertices[i * Ny + j] = {
                x: s_sigma,
                y: z,
                z: s_t
            }
            if (z > maxY) maxY = z
            if (z < minY) minY = z
        }
    }
    if (minY === Infinity || maxY === -Infinity) return // nothing to center
    
    // Centering in Y
    let yCenter                         = (maxY + minY) / 2
    for (let i = 0; i < Nx; i++) {
        for (let j = 0; j < Ny; j++) {
            vertices[i * Ny + j].y      -= yCenter
        }
    }
}

/* Animation functions */
function frame() {
    clear()

    deltaT              = 1 / TOTAL_FPS
    zeta_time           = Math.cos(Date.now() * 0.001 * zeta_time_speed)

    computeShapeInputs(deltaT)
    computeFunction(deltaT)

    // triangles
    for (let i = 0; i < Nx - 1; i++) {
        for (let j = 0; j < Ny - 1; j++) {
            let p1          = vertices[i * Ny + j]
            let p2          = vertices[(i + 1) * Ny + j]
            let p3          = vertices[i * Ny + (j + 1)]
            let p4          = vertices[(i + 1) * Ny + (j + 1)]

            if (!p1 || !p2 || !p3 || !p4) continue
            let sprp1       = proj3Dto2D(translateZ(rotate(p1, theta, phi, psi), dz))
            let sprp2       = proj3Dto2D(translateZ(rotate(p2, theta, phi, psi), dz))
            let sprp3       = proj3Dto2D(translateZ(rotate(p3, theta, phi, psi), dz))
            let sprp4       = proj3Dto2D(translateZ(rotate(p4, theta, phi, psi), dz))
            
            if (!sprp1 || !sprp2 || !sprp3 || !sprp4) continue
            if ([sprp1, sprp2, sprp3, sprp4].some(p => !isFinite(p.x) || !isFinite(p.y))) continue
            let sc1         = toScreen(sprp1)
            let sc2         = toScreen(sprp2)
            let sc3         = toScreen(sprp3)
            let sc4         = toScreen(sprp4)

            if ([sc1, sc2, sc3, sc4].some(p => p.x > render.width || p.y > render.height)) continue
            drawTriangle(sc1.x, sc1.y, sc2.x, sc2.y, sc3.x, sc3.y, OTHER_COLOR)
            drawTriangle(sc2.x, sc2.y, sc4.x, sc4.y, sc3.x, sc3.y, OTHER_COLOR)
        }
    }

    // points (optionnel, décommenter pour debug)
    for (let i = 0; i < Nx; i++) {
        for (let j = 0; j < Ny; j++) {
            let point3D = vertices[i * Ny + j]
            if (!point3D) continue
            if (point3D.z < 0.05) continue
            let sprp = proj3Dto2D(translateZ(rotate(point3D, theta, phi, psi), dz))
            if (!sprp) continue
            if (!isFinite(sprp.x) || !isFinite(sprp.y)) continue
            let sc = toScreen(sprp)
            if (sc.x < 0 || sc.x > render.width || sc.y < 0 || sc.y > render.height) continue
            drawPoint(sc.x, sc.y, FOREGROUND_COLOR)
        }
    }
}

/* MAIN */
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
