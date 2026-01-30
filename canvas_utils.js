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

function drawnLine(ctx, x1, y1, x2, y2, color, width = 4) {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

function drawCompass() {
    const compassOrigin     = { x: render.width / 2, y: render.height / 2 }
    const compassScale      = 20
    const axisLength        = 1

    const xAxis             = { x: axisLength, y: 0, z: 0 }
    const yAxis             = { x: 0, y: axisLength, z: 0 }
    const zAxis             = { x: 0, y: 0, z: axisLength }

    const rotatedX          = rotateYZ(rotateXZ(xAxis, -camera.yaw), -camera.pitch)
    const rotatedY          = rotateYZ(rotateXZ(yAxis, -camera.yaw), -camera.pitch)
    const rotatedZ          = rotateYZ(rotateXZ(zAxis, -camera.yaw), -camera.pitch)

    const compassLineWidth = 1
    drawnLine(ctx, compassOrigin.x, compassOrigin.y, compassOrigin.x + rotatedX.x * compassScale, compassOrigin.y - rotatedX.y * compassScale, 'red', compassLineWidth)
    drawnLine(ctx, compassOrigin.x, compassOrigin.y, compassOrigin.x + rotatedY.x * compassScale, compassOrigin.y - rotatedY.y * compassScale, 'blue', compassLineWidth)
    drawnLine(ctx, compassOrigin.x, compassOrigin.y, compassOrigin.x + rotatedZ.x * compassScale, compassOrigin.y - rotatedZ.y * compassScale, 'green', compassLineWidth)
}

function drawShapeCompass() {
    const compassOrigin     = { x: render.width - 60, y: render.height - 60 }
    const compassScale      = 40
    const axisLength        = 1

    const xAxis             = { x: axisLength, y: 0, z: 0 }
    const yAxis             = { x: 0, y: axisLength, z: 0 }
    const zAxis             = { x: 0, y: 0, z: axisLength }

    let rotatedX            = rotate(xAxis, shape.theta, shape.phi, shape.psi)
    rotatedX                = rotateYZ(rotateXZ(rotatedX, -camera.yaw), -camera.pitch)

    let rotatedY            = rotate(yAxis, shape.theta, shape.phi, shape.psi)
    rotatedY                = rotateYZ(rotateXZ(rotatedY, -camera.yaw), -camera.pitch)
    
    let rotatedZ            = rotate(zAxis, shape.theta, shape.phi, shape.psi)
    rotatedZ                = rotateYZ(rotateXZ(rotatedZ, -camera.yaw), -camera.pitch)

    const compassLineWidth  = 2
    drawnLine(ctx, compassOrigin.x, compassOrigin.y, compassOrigin.x + rotatedX.x * compassScale, compassOrigin.y - rotatedX.y * compassScale, 'red', compassLineWidth)
    drawnLine(ctx, compassOrigin.x, compassOrigin.y, compassOrigin.x + rotatedY.x * compassScale, compassOrigin.y - rotatedY.y * compassScale, 'blue', compassLineWidth)
    drawnLine(ctx, compassOrigin.x, compassOrigin.y, compassOrigin.x + rotatedZ.x * compassScale, compassOrigin.y - rotatedZ.y * compassScale, 'green', compassLineWidth)
}

function drawLine3D(p1_world, p2_world, color, width) {
    const nearPlane        = 0.1

    const transformToCamera = (p_world) => {
        const p_relative = {
            x: p_world.x - camera.x,
            y: p_world.y - camera.y,
            z: p_world.z - camera.z
        }
        return rotateYZ(rotateXZ(p_relative, -camera.yaw), -camera.pitch) // world is opposite to camera hence -
    }

    let p1_cam          = transformToCamera(p1_world)
    let p2_cam          = transformToCamera(p2_world)

    const p1_in         = p1_cam.z > nearPlane
    const p2_in         = p2_cam.z > nearPlane

    if (p1_in && p2_in) {
        const p1_screen = toScreen(proj3Dto2D(p1_cam))
        const p2_screen = toScreen(proj3Dto2D(p2_cam))
        if (p1_screen && p2_screen)
            drawnLine(ctx, p1_screen.x, p1_screen.y, p2_screen.x, p2_screen.y, color, width)
    } else if (p1_in && !p2_in) {
        const t = (nearPlane - p1_cam.z) / (p2_cam.z - p1_cam.z)
        const p2_clipped = {
            x: p1_cam.x + t * (p2_cam.x - p1_cam.x),
            y: p1_cam.y + t * (p2_cam.y - p1_cam.y),
            z: nearPlane
        }
        const p1_screen = toScreen(proj3Dto2D(p1_cam))
        const p2_screen = toScreen(proj3Dto2D(p2_clipped))
        if (p1_screen && p2_screen)
            drawnLine(ctx, p1_screen.x, p1_screen.y, p2_screen.x, p2_screen.y, color, width)
    } else if (!p1_in && p2_in) {
        const t = (nearPlane - p2_cam.z) / (p1_cam.z - p2_cam.z)
        const p1_clipped = {
            x: p2_cam.x + t * (p1_cam.x - p2_cam.x),
            y: p2_cam.y + t * (p1_cam.y - p2_cam.y),
            z: nearPlane
        }
        const p1_screen = toScreen(proj3Dto2D(p1_clipped))
        const p2_screen = toScreen(proj3Dto2D(p2_cam))
        if (p1_screen && p2_screen)
            drawnLine(ctx, p1_screen.x, p1_screen.y, p2_screen.x, p2_screen.y, color, width)
    }
}

function drawPoint3D(p_world, color, size) {
    const nearPlane        = 0.1

    const transformToCamera = (p_world) => {
        const p_relative = {
            x: p_world.x - camera.x,
            y: p_world.y - camera.y,
            z: p_world.z - camera.z
        }
        return rotateYZ(rotateXZ(p_relative, -camera.yaw), -camera.pitch) // world is opposite to camera hence -
    }

    let p_cam          = transformToCamera(p_world)

    if (p_cam.z > nearPlane) {
        const p_screen = toScreen(proj3Dto2D(p_cam))
        if (p_screen) {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(p_screen.x, p_screen.y, size, 0, 2 * Math.PI)
            ctx.fill()
        }
    }
}

function drawTriangle3D(p1_world, p2_world, p3_world, color, width = 3) {
    const nearPlane        = 0.1

    // using drawLine3D to draw the triangle edges
    drawLine3D(p1_world, p2_world, color, width)
    drawLine3D(p2_world, p3_world, color, width)
    drawLine3D(p3_world, p1_world, color, width)
}

function drawGrid() {
    const gridSize      = 100
    const gridStep      = 5
    const gridY         = -30
    const gridColor     = "#8a7d55"
    const gridLineWidth = 1

    for (let i = -gridSize / 2; i <= gridSize / 2; i += gridStep) {
        addToRender('line', {
            p1: { x: i, y: gridY, z: -gridSize / 2 },
            p2: { x: i, y: gridY, z: gridSize / 2 },
            color: gridColor, width: gridLineWidth
        })

        addToRender('line', {
            p1: { x: -gridSize / 2, y: gridY, z: i },
            p2: { x: gridSize / 2, y: gridY, z: i },
            color: gridColor, width: gridLineWidth
        })
    }
}

function drawShapeGrid() {
    const gridSize      = (shape.x_max - shape.x_min) || 50
    const gridStep      = 5
    const gridZ         = 0; // Normal plane of the shape
    const gridColor     = "#7d8a55"
    const gridLineWidth = 1

    for (let i = -gridSize / 2; i <= gridSize / 2; i += gridStep) {
        let p1_local = { x: i, y: -gridSize / 2, z: gridZ }
        let p2_local = { x: i, y: gridSize / 2, z: gridZ }
        let p1_world = rotate(p1_local, shape.theta, shape.phi, shape.psi)
        let p2_world = rotate(p2_local, shape.theta, shape.phi, shape.psi)
        addToRender('line', { p1: p1_world, p2: p2_world, color: gridColor, width: gridLineWidth })

        let p3_local = { x: -gridSize / 2, y: i, z: gridZ }
        let p4_local = { x: gridSize / 2, y: i, z: gridZ }
        let p3_world = rotate(p3_local, shape.theta, shape.phi, shape.psi)
        let p4_world = rotate(p4_local, shape.theta, shape.phi, shape.psi)
        addToRender('line', { p1: p3_world, p2: p4_world, color: gridColor, width: gridLineWidth })
    }
}

function getRealWidth(distance, baseWidth) {
    const scaleFactor = 75
    if (distance <= 0) return baseWidth
    const width = distance < scaleFactor ? baseWidth * (scaleFactor / distance) : baseWidth * (scaleFactor / distance) ** 2
    return Math.max(1, Math.floor(width))
}