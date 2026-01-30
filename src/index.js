/* Colors and settings */
const BACKGROUND_COLOR      = "#ad935a"
const OTHER_COLOR           = "#535741"
const FOREGROUND_COLOR      = "hsl(300, 4%, 14%)"
let   TOTAL_FPS             = 74
let   OPTIMIZATION          = true // Useless for now, always on


/* Global variables */
const render                = document.getElementById("render")
const statsDiv              = document.getElementById("stats")
const camera                = new Camera(0, 25, -100, 0, 0)


const shape                 = new Shape(new Function('x', 'y', 'time', 'return ' + PRESET_FUNCTIONS[current_preset_index].formula))

let   ctx                   = null
let   renderables           = []
let   lastFrameTime         = 0
let   frameTimes            = []
let   renderTimes           = []
let   deltaT                = 0


/* Logging functions */
function LOGGER(msg) {
    console.log('[LOG]: ', msg)
}
function ERROR(msg) {
    console.error('[ERROR]: ', msg)
}

/* Render functions */
function addToRender(type, data) {
    let depth
    if (type === 'line') {
        const p1_cam = transformToCameraView(data.p1)
        const p2_cam = transformToCameraView(data.p2)
        depth = (p1_cam.z + p2_cam.z) / 2
    } else if (type === 'point') {
        const p_cam = transformToCameraView(data.p)
        depth = p_cam.z
    }
    renderables.push({ type, ...data, depth })
}

function displayStats(actualFrameTime, renderTime) {
    frameTimes.push(actualFrameTime)
    if (frameTimes.length > 60) frameTimes.shift(); // Use a larger sample size for smoother FPS
    let avgElapsed = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
    let fps = 1000 / avgElapsed

    renderTimes.push(renderTime)
    if (renderTimes.length > 5) renderTimes.shift();
    let avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
    const paddedRenderTime = avgRenderTime.toFixed(2).padStart(5, '0')

    statsDiv.textContent = `FPS: ${fps.toFixed(1)} | Render Time: ${paddedRenderTime}ms \nVertices: ${shape.Nx * shape.Ny} | Renderables: ${renderables.length} | Optimization: ${OPTIMIZATION ? 'ON' : 'OFF'}`
}

/* MAIN */
function renderVertices() {
    const transformedVerticesCache = new Array(shape.vertices.length)

    const getTransformedVertex = (index) => { // Cache transformed vertices
        if (transformedVerticesCache[index])
            return transformedVerticesCache[index]
        const p_local = shape.vertices[index]
        if (!p_local) return null

        const p_world = rotate(p_local, shape.theta, shape.phi, shape.psi)
        const p_cam = transformToCameraView(p_world)
        const transformed = { p_local, p_world, p_cam }
        transformedVerticesCache[index] = transformed
        return transformed
    }

    for (let i = 0; i < shape.Nx; i++) {
        for (let j = 0; j < shape.Ny; j++) {
            const v1_transformed = getTransformedVertex(i * shape.Ny + j)
            if (!v1_transformed) continue

            if (i < shape.Nx - 1) {
                const v2_transformed = getTransformedVertex((i + 1) * shape.Ny + j)
                if (v2_transformed) {
                    const { p_world: p1_world, p_cam: p1_cam } = v1_transformed
                    const { p_world: p2_world, p_cam: p2_cam } = v2_transformed

                    const avg_z = (p1_world.z + p2_world.z) / 2
                    const color = SETTINGS.z_coloring ? getColorFromZ(avg_z) : FOREGROUND_COLOR;
                    let width = 2;
                    if (SETTINGS.dynamic_width) {
                        const distance = Math.sqrt(
                            (((p1_world.x + p2_world.x) / 2) - camera.x) ** 2 +
                            (((p1_world.y + p2_world.y) / 2) - camera.y) ** 2 +
                            (((p1_world.z + p2_world.z) / 2) - camera.z) ** 2
                        )
                        width = getRealWidth(distance, 5)
                    }
                    renderables.push({
                        type: 'line', p1: p1_world, p2: p2_world, color, width,
                        depth: (p1_cam.z + p2_cam.z) / 2
                    })
                }
            }
            if (j < shape.Ny - 1) {
                const v2_transformed = getTransformedVertex(i * shape.Ny + (j + 1))
                if (v2_transformed) {
                    const { p_world: p1_world, p_cam: p1_cam } = v1_transformed
                    const { p_world: p2_world, p_cam: p2_cam } = v2_transformed

                    const avg_z = (p1_world.z + p2_world.z) / 2
                    const color = SETTINGS.z_coloring ? getColorFromZ(avg_z) : FOREGROUND_COLOR;

                    let width = 2;
                    if (SETTINGS.dynamic_width) {
                        const distance = Math.sqrt(
                            (((p1_world.x + p2_world.x) / 2) - camera.x) ** 2 +
                            (((p1_world.y + p2_world.y) / 2) - camera.y) ** 2 +
                            (((p1_world.z + p2_world.z) / 2) - camera.z) ** 2
                        )
                        width = getRealWidth(distance, 5)
                    }
                    renderables.push({
                        type: 'line', p1: p1_world, p2: p2_world, color, width,
                        depth: (p1_cam.z + p2_cam.z) / 2
                    })
                }
            }

            if (!SETTINGS.z_coloring) continue; // Points wouldn't show anyway
            const { p_local, p_world, p_cam } = v1_transformed
            const depth = p_local.z
            const color = SETTINGS.z_coloring ? getColorFromDepth(depth) : FOREGROUND_COLOR;

            let width = 1;
            if (SETTINGS.dynamic_width) {
                const distance = Math.sqrt(
                    (p_world.x - camera.x) ** 2 +
                    (p_world.y - camera.y) ** 2 +
                    (p_world.z - camera.z) ** 2
                )
                width = getRealWidth(distance, 2)
            }
            renderables.push({
                type: 'point', p: p_world, color, width,
                depth: p_cam.z - 5 // slight offset to render points in front of lines
            })
        }
    }
}

function frame(currentTime) {
    requestAnimationFrame(frame)

    const elapsed = currentTime - lastFrameTime
    const frameDuration = 1000 / TOTAL_FPS
    if (elapsed < frameDuration) return
    deltaT = 1 / TOTAL_FPS
    lastFrameTime = currentTime
    const startTime = performance.now()

    clear()
    camera.update(deltaT)
    shape.update(deltaT)

    renderables = []
    if (SETTINGS.show_grid) {
        drawGrid()
        drawShapeGrid()
    }
    renderVertices()

    renderables.sort((a, b) => b.depth - a.depth)
    renderables.forEach(renderable => {
        if (renderable.type === 'line')
            drawLine3D(renderable.p1, renderable.p2, renderable.color, renderable.width)
        else if (renderable.type === 'point')
            drawPoint3D(renderable.p, renderable.color, renderable.width)
    })

    if (SETTINGS.show_compass) {
        drawCompass()
        drawShapeCompass()
    }

    displayStats(elapsed, performance.now() - startTime)
}

initRender()
initPage()
initInputs()
requestAnimationFrame(frame);