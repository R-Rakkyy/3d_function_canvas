class Shape {
    constructor() {
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

        this.vertices                       = []

        this.input_rotate_left              = false
        this.input_rotate_right             = false
        this.input_rotate_up                = false
        this.input_rotate_down              = false

        this.initInputs()
        this.computeVertices()
    }

    initInputs() {
        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowLeft':   this.input_rotate_left = true; break
                case 'ArrowRight':  this.input_rotate_right = true; break
                case 'ArrowUp':     this.input_rotate_up = true; break
                case 'ArrowDown':   this.input_rotate_down = true; break
            }
        })
        window.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowLeft':   this.input_rotate_left = false; break
                case 'ArrowRight':  this.input_rotate_right = false; break
                case 'ArrowUp':     this.input_rotate_up = false; break
                case 'ArrowDown':   this.input_rotate_down = false; break
            }
        })
    }

    update(deltaT) {
        if (this.input_rotate_left)     this.theta -= this.ROTATE_SPEED * deltaT
        if (this.input_rotate_right)    this.theta += this.ROTATE_SPEED * deltaT
        if (this.input_rotate_up)       this.phi -= this.ROTATE_SPEED * deltaT
        if (this.input_rotate_down)     this.phi += this.ROTATE_SPEED * deltaT

        this.computeVertices(performance.now() / 500)
    }

    computeVertices(time = 0) {
        this.vertices = []
        for (let i = 0; i < this.Nx; i++) {
            let x = this.x_min + (this.x_max - this.x_min) * (i / (this.Nx - 1))
            for (let j = 0; j < this.Ny; j++) {
                let y = this.y_min + (this.y_max - this.y_min) * (j / (this.Ny - 1))
                let z = 10 + 10 * Math.sin(0.005 * (x * x + y * y) - time)
                this.vertices.push({ x: x, y: y, z: z })
            }
        }
    }
}
