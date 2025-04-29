class Boundary {
    static w = 48
    static h = 48
    constructor({ position }) {
        this.position = position
        // i quadratini sono 12px ma abbiamo esportato la mappa al 400% quindi 12 x 4
        this.width = 48
        this.height = 48
    }

    draw() {
        c.fillStyle = 'transparent'
        c.fillStyle = 'rgba(255, 0, 0, 0.5)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Moving {
    constructor({ position, velocity, img, frames = {max: 1}, sprites }) {
        this.position = position
        this.img = img
        // lavoro per creare movimento tra i frame del player
        this.frames = {...frames, val: 0, elapsed: 0}
        this.img.onload = () => {
            this.width = this.img.width / this.frames.max
            this.height = this.img.height
        }
        this.moving = false
        this.sprites = sprites
    }

    draw() {
        c.drawImage(
            this.img, 
            /* croppo le imgs in eccesso */
            // crop position
            this.frames.val * this.width, 
            0,
            // crop width/height
            this.img.width / this.frames.max,
            this.img.height,
    
            // actual part visible: crop & width/height
            this.position.x,
            this.position.y,
            this.img.width / this.frames.max,
            this.img.height
        )
        if (!this.moving) return
        this.frames.max  > 1 ? this.frames.elapsed++ : ''
        if (this.frames.elapsed % 5 === 0) {
            this.frames.val < this.frames.max - 1 ? this.frames.val++ : this.frames.val = 0
        }
    }
}