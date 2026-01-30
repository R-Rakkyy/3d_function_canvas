class Camera {
    constructor(x, y, z, yaw, pitch) {
        this.x                      = x
        this.y                      = y
        this.z                      = z
        this.yaw                    = yaw
        this.pitch                  = pitch
        this.MOVE_SPEED             = 74
        this.ROTATE_SPEED           = 1.5 * Math.PI

        this.updateRotation         = this.updateRotation.bind(this)

        this.initialX               = x
        this.initialY               = y
        this.initialZ               = z
        this.initialYaw             = yaw
        this.initialPitch           = pitch
    }

    reset() {
        this.x      = this.initialX
        this.y      = this.initialY
        this.z      = this.initialZ
        this.yaw    = this.initialYaw
        this.pitch  = this.initialPitch
    }

    updateRotation(event) {
        const sensitivity   = 0.374
        this.yaw            += event.movementX * sensitivity * (Math.PI / 180)
        this.pitch          += event.movementY * sensitivity * (Math.PI / 180)
        this.pitch          = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch))
    }

    update(deltaT) {
        if (pressedKeys.has('w') || pressedKeys.has('z')) {
            this.x += this.MOVE_SPEED * Math.sin(this.yaw) * deltaT
            this.z += this.MOVE_SPEED * Math.cos(this.yaw) * deltaT
        }
        if (pressedKeys.has('s')) {
            this.x -= this.MOVE_SPEED * Math.sin(this.yaw) * deltaT
            this.z -= this.MOVE_SPEED * Math.cos(this.yaw) * deltaT
        }
        if (pressedKeys.has('q')) {
            this.x -= this.MOVE_SPEED * Math.cos(this.yaw) * deltaT
            this.z += this.MOVE_SPEED * Math.sin(this.yaw) * deltaT
        }
        if (pressedKeys.has('d')) {
            this.x += this.MOVE_SPEED * Math.cos(this.yaw) * deltaT
            this.z -= this.MOVE_SPEED * Math.sin(this.yaw) * deltaT
        }
        if (pressedKeys.has(' '))               this.y           += this.MOVE_SPEED * deltaT
        if (pressedKeys.has('shift') 
         || pressedKeys.has('a'))               this.y           -= this.MOVE_SPEED * deltaT
        if (pressedKeys.has('i'))               this.pitch       += this.ROTATE_SPEED * deltaT
        if (pressedKeys.has('k'))               this.pitch       -= this.ROTATE_SPEED * deltaT
        if (pressedKeys.has('j'))               this.yaw         -= this.ROTATE_SPEED * deltaT
        if (pressedKeys.has('l'))               this.yaw         += this.ROTATE_SPEED * deltaT

        this.pitch                      = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch))
        this.yaw                        = (this.yaw + 2 * Math.PI) % (2 * Math.PI)
    }
}