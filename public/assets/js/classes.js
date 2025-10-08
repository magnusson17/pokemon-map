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
        c.fillStyle = 'rgba(255, 0, 0, 0.5)'
        c.fillStyle = 'transparent'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Moving {
    constructor({
        position,
        img,
        frames = {max: 1},
        sprites
    }) {

        this.position = position
        this.img = img

        // aggiorno .val e .elapsed nelle righe finali di draw()
        this.frames = {
            // frames è l'obj che passo (che conterrà la key "max")
            ...frames,
            // val è il frame corrente (da 0 a 3)
            val: 0,
            // elapsed è il contatore che tiene traccia di quante volte draw() è stata chiamata rispetto all'ultimo update
            elapsed: 0
        }

        this.img.onload = () => {
            this.width = this.img.width / this.frames.max
            this.height = this.img.height
        }

        this.moving = false
        this.sprites = sprites
    }

    draw() {
        c.drawImage(
            this.img,                           // source img

            this.frames.val * this.width,       // source crop start x (ho 4 frame uno di lato all'altro, per playerUp, Down, Left e Right, sulla X posso partire da 0xWidth, da 1xW, da 2xW, da 3xW)
            0,                                  // source crop start y (parti dal top della img)

            this.img.width / this.frames.max,   // source crop width (quanto tagliare in orizzontale)
            this.img.height,                    // source crop width (quanto tagliare in verticale)

            this.position.x,                    // dove disegnare sul canvas (x)
            this.position.y,                    // dove disegnare sul canvas (y)

            this.img.width / this.frames.max,   // in che misura disegnare su canvas (w)
            this.img.height                     // in che misura disegnare su canvas (h)
        )

        if (!this.moving) return

        // se lo sprite è l'omino allora faccio entrare in azione elapsed
        this.frames.max  > 1 ? this.frames.elapsed++ : ''

        // rallento l'animazione, cambio frame dello sprite ad ogni tot animationFrame (window.requestAnimationFrame(animate))
        // "fai un passo a ogni tot animationFrame"
        // attenzione! i passi dell'omino e la velocità di movimento dei "movables" (movSpeed) sono 2 cose separate e indipendenti tra loro
        if (this.frames.elapsed % 8 === 0) {
            this.frames.val < this.frames.max - 1 ? this.frames.val++ : this.frames.val = 0
        }
    }
}