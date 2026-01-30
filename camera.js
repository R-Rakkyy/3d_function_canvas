class Camera {
    constructor(x, y, z, yaw, pitch) {
        this.x                      = x
        this.y                      = y
        this.z                      = z
        this.yaw                    = yaw
        this.pitch                  = pitch
        this.MOVE_SPEED             = 74
        this.ROTATE_SPEED           = 1.5 * Math.PI

        this.input_forward          = false
        this.input_backward         = false
        this.input_left             = false
        this.input_right            = false
        this.input_up               = false
        this.input_down             = false
        this.input_view_left        = false
        this.input_view_right       = false
        this.input_view_forward     = false
        this.input_view_backward    = false

        this.initInputs()
        this.updateRotation = this.updateRotation.bind(this)
    }

    initInputs() {
        const render = document.getElementById('render')
        render.addEventListener('click', () => { render.requestPointerLock(); })

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === render) {
                document.addEventListener("mousemove", this.updateRotation, false)
            } else {
                document.removeEventListener("mousemove", this.updateRotation, false)
            }
        })

        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'z':       this.input_forward = true; break
                case 's':       this.input_backward = true; break
                case 'q':       this.input_left = true; break
                case 'd':       this.input_right = true; break
                case ' ':       this.input_up = true; break
                case 'Shift':   this.input_down = true; break
                case 'a':       this.input_down = true; break
                case 'i':       this.input_view_forward = true; break
                case 'k':       this.input_view_backward = true; break
                case 'j':       this.input_view_left = true; break
                case 'l':       this.input_view_right = true; break
            }
        })
        window.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'z':       this.input_forward = false; break
                case 's':       this.input_backward = false; break
                case 'q':       this.input_left = false; break
                case 'd':       this.input_right = false; break
                case ' ':       this.input_up = false; break
                case 'Shift':   this.input_down = false; break
                case 'a':       this.input_down = false; break
                case 'i':       this.input_view_forward = false; break
                case 'k':       this.input_view_backward = false; break
                case 'j':       this.input_view_left = false; break
                case 'l':       this.input_view_right = false; break
            }
        })
    }

    updateRotation(event) {
        const sensitivity   = 0.374
        this.yaw            += event.movementX * sensitivity * (Math.PI / 180)
        this.pitch          += event.movementY * sensitivity * (Math.PI / 180)
        this.pitch          = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch))
    }

    update(deltaT) {
        if (this.input_forward) {
            this.x += this.MOVE_SPEED * Math.sin(this.yaw) * deltaT
            this.z += this.MOVE_SPEED * Math.cos(this.yaw) * deltaT
        }
        if (this.input_backward) {
            this.x -= this.MOVE_SPEED * Math.sin(this.yaw) * deltaT
            this.z -= this.MOVE_SPEED * Math.cos(this.yaw) * deltaT
        }
        if (this.input_left) {
            this.x -= this.MOVE_SPEED * Math.cos(this.yaw) * deltaT
            this.z += this.MOVE_SPEED * Math.sin(this.yaw) * deltaT
        }
        if (this.input_right) {
            this.x += this.MOVE_SPEED * Math.cos(this.yaw) * deltaT
            this.z -= this.MOVE_SPEED * Math.sin(this.yaw) * deltaT
        }
        if (this.input_up)              this.y           += this.MOVE_SPEED * deltaT
        if (this.input_down)            this.y           -= this.MOVE_SPEED * deltaT
        if (this.input_view_left)       this.yaw         -= this.ROTATE_SPEED * deltaT
        if (this.input_view_right)      this.yaw         += this.ROTATE_SPEED * deltaT
        if (this.input_view_forward)    this.pitch       += this.ROTATE_SPEED * deltaT
        if (this.input_view_backward)   this.pitch       -= this.ROTATE_SPEED * deltaT

        this.pitch                      = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch))
    }
}
