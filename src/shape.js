class Shape {
    constructor(custom_function) {
        this.x                              = 0
        this.y                              = 0
        this.z                              = 0
        this.theta                          = 0; // rotation around Y
        this.phi                            = 0; // rotation around X
        this.psi                            = 0; // rotation around Z
        this.ROTATE_SPEED                   = Math.PI / 4

        this.BASE_NX                        = 47
        this.BASE_NY                        = 47
        this.Nx                             = this.BASE_NX
        this.Ny                             = this.BASE_NY
        this.x_min                          = -50
        this.x_max                          = 50
        this.y_min                          = -50
        this.y_max                          = 50

        this.depth_scale                    = 1

        this.initialTheta                   = this.theta
        this.initialPhi                     = this.phi

        this.vertices                       = []

        this.custom_function = custom_function || function(x, y, time) {
            return 10 + 10 * Math.sin(0.005 * (x * x + y * y) - time)
        }
        
        this.computeVertices()
    }

    reset() {
        this.theta                          = this.initialTheta
        this.phi                            = this.initialPhi
        this.Nx                             = this.BASE_NX
        this.Ny                             = this.BASE_NY
        this.x_min                          = -50
        this.x_max                          = 50
        this.y_min                          = -50
        this.y_max                          = 50
        this.depth_scale                    = 1
    }

    update(deltaT) {
        if (pressedKeys.has('arrowleft'))     this.theta -= this.ROTATE_SPEED * deltaT
        if (pressedKeys.has('arrowright'))    this.theta += this.ROTATE_SPEED * deltaT
        if (pressedKeys.has('arrowup'))       this.phi -= this.ROTATE_SPEED * deltaT
        if (pressedKeys.has('arrowdown'))     this.phi += this.ROTATE_SPEED * deltaT

        if (isVertexRecalcStopped) return
        
        this.computeVertices(performance.now() / 500)
    }

    computeVertices(time = 0) {
        this.vertices = new Array(this.Nx * this.Ny) // preallocate array size
        const rawFunc = this.custom_function
        const func = (v1, v2) => {
            const fn = (typeof rawFunc === 'function') ? rawFunc : (rawFunc && typeof rawFunc.func === 'function' ? rawFunc.func : (() => 0))
            return fn(v1, v2, time) * this.depth_scale
        }

        for (let i = 0; i < this.Nx; i++) {
            const u = this.x_min + (this.x_max - this.x_min) * (i / (this.Nx - 1))
            for (let j = 0; j < this.Ny; j++) {
                const v = this.y_min + (this.y_max - this.y_min) * (j / (this.Ny - 1))
                
                let x, y, z
                switch (SETTINGS.function_axis) {
                    case 'x':
                        z = u; y = v; x = func(y, z)
                        break
                    case 'y':
                        x = u; z = v; y = func(x, z)
                        break
                    default:
                        x = u; y = v; z = func(x, y)
                        break
                }
                this.vertices[i * this.Ny + j] = { x, y, z }
            }
        }
        if (SETTINGS.depth_smoother)
            this.smoothDepth()
    }

    smoothDepth() {
        const smoothed_vertices = new Array(this.Nx * this.Ny) // preallocate array size
        for (let i = 0; i < this.Nx; i++) {
            for (let j = 0; j < this.Ny; j++) {
                let sum = 0
                let count = 0
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        const ni = i + di
                        const nj = j + dj
                        if (ni >= 0 && ni < this.Nx && nj >= 0 && nj < this.Ny) {
                            sum += this.vertices[ni * this.Ny + nj].z
                            count++
                        }
                    }
                }
                const current_vertex = this.vertices[i * this.Ny + j]
                const smoothed_z = current_vertex.z * (1 - SETTINGS.depth_smoother_factor) + (sum / count) * SETTINGS.depth_smoother_factor
                smoothed_vertices[i * this.Ny + j] = ({
                    x: current_vertex.x,
                    y: current_vertex.y,
                    z: smoothed_z
                })
            }
        }
        this.vertices = smoothed_vertices
    }
}
