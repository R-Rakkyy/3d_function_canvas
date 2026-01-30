class Shape {
    constructor(z_func) {
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

        this.initialTheta                   = this.theta;
        this.initialPhi                     = this.phi;

        this.vertices                       = []

        this.z_func = z_func || function(x, y, time) {
            return 10 + 10 * Math.sin(0.005 * (x * x + y * y) - time)
        }
        
        this.computeVertices()
    }

    reset() {
        this.theta                          = this.initialTheta;
        this.phi                            = this.initialPhi;
        this.Nx                             = this.BASE_NX;
        this.Ny                             = this.BASE_NY;
        this.x_min                          = -50;
        this.x_max                          = 50;
        this.y_min                          = -50;
        this.y_max                          = 50;
    }

    update(deltaT) {
        if (pressedKeys.has('arrowleft'))     this.theta -= this.ROTATE_SPEED * deltaT
        if (pressedKeys.has('arrowright'))    this.theta += this.ROTATE_SPEED * deltaT
        if (pressedKeys.has('arrowup'))       this.phi -= this.ROTATE_SPEED * deltaT
        if (pressedKeys.has('arrowdown'))     this.phi += this.ROTATE_SPEED * deltaT

        this.computeVertices(performance.now() / 500)
    }

    computeVertices(time = 0) {
        this.vertices = []
        for (let i = 0; i < this.Nx; i++) {
            let x = this.x_min + (this.x_max - this.x_min) * (i / (this.Nx - 1))
            for (let j = 0; j < this.Ny; j++) {
                let y = this.y_min + (this.y_max - this.y_min) * (j / (this.Ny - 1))
                let z = this.z_func(x, y, time)
                this.vertices.push({ x: x, y: y, z: z })
            }
        }
    }
}
