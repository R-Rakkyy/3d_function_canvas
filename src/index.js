/* Colors and settings */
const BACKGROUND_COLOR      = "#7c6636"
const OTHER_COLOR           = "#7f8565"
const FOREGROUND_COLOR      = "hsl(300, 3%, 26%)"
let   TOTAL_FPS             = 74


/* Global variables */
const render                = document.getElementById("render")
const statsDiv              = document.getElementById("stats")
const camera                = new Camera(0, 25, -100, 0, 0)


const shape                 = new Shape(new CustomFunctionManager(PRESET_FUNCTIONS[current_preset_index].formula).func)

let   ctx                   = null
let   renderables           = []
let   lastFrameTime         = 0
let   frameTimes            = []
let   renderTimes           = []
let   deltaT                = 0
let   isPaused              = false
let   isVertexRecalcStopped = false


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
        const p_cam  = transformToCameraView(data.p)
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
    if (renderTimes.length > 5) renderTimes.shift()
    let avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
    const paddedRenderTime = avgRenderTime.toFixed(2).padStart(5, '0')

    statsDiv.textContent = `FPS: ${fps.toFixed(1)} | Render Time: ${paddedRenderTime}ms \nVertices: ${shape.Nx * shape.Ny} | Renderables: ${renderables.length}`
}

/* MAIN */
function renderVertices() {
    const renderTriangles           = (SETTINGS.render_type === 'triangle' || SETTINGS.render_type === 'solid' || SETTINGS.render_type === 'light-solid')
    const transformedVerticesCache  = new Array(shape.vertices.length)
    const lightSource               = { x: 0, y: 0, z: -1 }

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
            const v1_transformed                        = getTransformedVertex(i * shape.Ny + j)
            if (!v1_transformed)                        continue

            const p_local                               = v1_transformed.p_local
            const { p_world: p1_world, p_cam: p1_cam }  = v1_transformed

            if (!renderTriangles) {
                if (i < shape.Nx - 1) {
                    const v2_transformed                            = getTransformedVertex((i + 1) * shape.Ny + j)
                    if (v2_transformed) {
                        const { p_world: p2_world, p_cam: p2_cam }  = v2_transformed
                        const depth         = p_local.z
                        const avg_val       = (p1_world[SETTINGS.coloring_axis] + p2_world[SETTINGS.coloring_axis]) / 2
                        let color           = FOREGROUND_COLOR
                        if (SETTINGS.coloring_mode === 'axis')
                            color           = getColorFromAxis(avg_val, SETTINGS.coloring_axis)
                        else if (SETTINGS.coloring_mode === 'depth')
                            color           = getColorFromAxis(depth, SETTINGS.coloring_axis)
                        let width                                   = 2
                        if (SETTINGS.dynamic_width) {
                            const distance  = Math.sqrt(
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
                    const v2_transformed                            = getTransformedVertex(i * shape.Ny + (j + 1))
                    if (v2_transformed) {
                        const { p_local: p2_local, p_world: p2_world, p_cam: p2_cam }  = v2_transformed
                        const depth         = p2_local.z
                        const avg_val       = (p1_world[SETTINGS.coloring_axis] + p2_world[SETTINGS.coloring_axis]) / 2
                        const color         = SETTINGS.coloring_mode === 'axis' ? getColorFromAxis(avg_val, SETTINGS.coloring_axis) : (SETTINGS.coloring_mode === 'depth' ? getColorFromAxis(depth, SETTINGS.coloring_axis) : FOREGROUND_COLOR)
                        let width           = 2
                        if (SETTINGS.dynamic_width) {
                            const distance  = Math.sqrt(
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
            } else {
                if (i < shape.Nx - 1 && j < shape.Ny - 1) {
                    const v2_transformed                            = getTransformedVertex((i + 1) * shape.Ny + j)
                    const v3_transformed                            = getTransformedVertex(i * shape.Ny + (j + 1))
                    const v4_transformed                            = getTransformedVertex((i + 1) * shape.Ny + (j + 1))
                    if (v2_transformed && v3_transformed && v4_transformed) {
                        const { p_local: p2_local, p_world: p2_world, p_cam: p2_cam }  = v2_transformed
                        const { p_local: p3_local, p_world: p3_world, p_cam: p3_cam }  = v3_transformed
                        const { p_local: p4_local, p_world: p4_world, p_cam: p4_cam }  = v4_transformed

                        const processTriangle   = (p1, p2, p3, p1_local, p2_local, p3_local) => {
                            const depth         = (p1_local.z + p2_local.z + p3_local.z) / 3
                            const avg_val       = (p1[SETTINGS.coloring_axis] + p2[SETTINGS.coloring_axis] + p3[SETTINGS.coloring_axis]) / 3
                            let color = FOREGROUND_COLOR
                            if (SETTINGS.coloring_mode === 'axis')          color = getColorFromAxis(avg_val, SETTINGS.coloring_axis)
                            else if (SETTINGS.coloring_mode === 'depth')    color = getColorFromAxis(depth, SETTINGS.coloring_axis)
                            let widthForEdges = 1
                            const centroid_world = { x: (p1.x + p2.x + p3.x) / 3, y: (p1.y + p2.y + p3.y) / 3, z: (p1.z + p2.z + p3.z) / 3 }
                            const distance = Math.sqrt(
                                (centroid_world.x - camera.x) ** 2 +
                                (centroid_world.y - camera.y) ** 2 +
                                (centroid_world.z - camera.z) ** 2
                            )
                            widthForEdges       = SETTINGS.dynamic_width ? getRealWidth(distance, 2) : 1

                            let fill = false
                            if (SETTINGS.render_type === 'solid') {
                                const edge1 = subtract(p2, p1)
                                const edge2 = subtract(p3, p1)
                                const normal = normalize(crossProduct(edge1, edge2))
                                const light_intensity = Math.max(0, dotProduct(normal, lightSource))
                                const ambient_light = 0.25
                                const final_intensity = ambient_light + (1 - ambient_light) * light_intensity

                                color = chroma(color).luminance(chroma(color).luminance() * final_intensity).hex()
                                fill = true
                            } else if (SETTINGS.render_type === 'light-solid') {
                                fill = true
                            }

                            renderables.push({
                                type: 'triangle', p1, p2, p3, color, width: widthForEdges, fill,
                                depth: (p1_cam.z + p2_cam.z + p3_cam.z) / 3
                            })
                        }

                        processTriangle(p1_world, p2_world, p3_world, p_local, p2_local, p3_local)
                        processTriangle(p2_world, p4_world, p3_world, p2_local, p4_local, p3_local)
                    }
                }
            }

            if (!SETTINGS.display_points) continue

            const { p_world: p_world, p_cam: p_cam } = v1_transformed
            const depth                         = p_local.z
            const color                         = getColorFromDepth(depth)

            let width                           = 1
            if (SETTINGS.dynamic_width) {
                const distance = Math.sqrt(
                    (p_world.x - camera.x) ** 2 +
                    (p_world.y - camera.y) ** 2 +
                    (p_world.z - camera.z) ** 2
                )
                width                           = getRealWidth(distance, 2)
            }
            renderables.push({
                type: 'point', p: p_world, color, width,
                depth: p_cam.z - 0.1
            })
        }
    }
}

function frame(currentTime) {
    try {
    if (isPaused)
        return requestAnimationFrame(frame)
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
        else if (renderable.type === 'triangle')
            drawTriangle3D(renderable.p1, renderable.p2, renderable.p3, renderable.color, renderable.width, renderable.fill)
    })

    if (SETTINGS.show_compass) {
        drawCompass()
        drawShapeCompass()
    }

    displayStats(elapsed, performance.now() - startTime)
    } catch (e) {
        ERROR('Error in frame function: ' + e.message)
        isPaused = true
        updateUIFromState()
    }
}

initRender()
initPage()
initInputs()
requestAnimationFrame(frame);