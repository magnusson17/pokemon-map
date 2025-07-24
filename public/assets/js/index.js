const canvas = document.querySelector('canvas')
// racchiudo in var le proprietà di canvas
const c = canvas.getContext('2d')

const fumetti = document.querySelectorAll('.fumetto')
const btnsNo = document.querySelectorAll('.fumetto .fumetto__btn--no')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const movSpeed = 8
const isMobile = window.innerWidth <= 991
let resizeTimeout

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        location.reload();
    }, 300);
})

/* voglio looppare nel array collision per andare a trovare dove ho i miei collision square
looppo ogni 70 perchè so che la mappa è larga 70 (l'ho deciso prima su Tiled) 
ora avrò tanti array quante righe ho (40, deciso su Tiled) */

const collisionsMap = []
const doorMap = []

if (window.location.pathname === '/') {
    for (let i = 0; i < collision.length; i += 70) {
        collisionsMap.push(collision.slice(i, 70 + i))
    }
    for (let i = 0; i < door.length; i += 70) {
        doorMap.push(door.slice(i, 70 + i))
    }
} else if (window.location.pathname === '/home') {
    for (let i = 0; i < collisionInterni.length; i += 70) {
        collisionsMap.push(collisionInterni.slice(i, 70 + i))
    }
    for (let i = 0; i < doorInterna.length; i += 70) {
        doorMap.push(doorInterna.slice(i, 70 + i))
    }
} else if (window.location.pathname === '/lighthouse') {
    for (let i = 0; i < collisionLighthouse.length; i += 70) {
        collisionsMap.push(collisionLighthouse.slice(i, 70 + i))
    }
    for (let i = 0; i < doorLighthouse.length; i += 70) {
        doorMap.push(doorLighthouse.slice(i, 70 + i))
    }
}

// istanzio gli array che isoleranno gli specifici quadretti di contatto
const boundaries = []
const doorAreas = []
const doorLighthouseAreas = []

// faccio caricare il canva centrato sempre rispetto a un punto (cosi che il player non cadrà per sbaglio su una collision al caricamento)
const TILE_SIZE = 48
let START_TILE = {}

if (window.location.pathname === '/home') {
    START_TILE = { col: 35, row: 23 }
} else if (window.location.pathname === '/lighthouse') {
    START_TILE = { col: 34, row: 23 }
} else if (document.referrer.includes('/home')) {
    START_TILE = { col: 26, row: 20 }
} else if (document.referrer.includes('/lighthouse')) {
    START_TILE = { col: 45, row: 12 }
} else if (window.location.pathname === '/') {
    START_TILE = { col: 36, row: 21 }
}

const offset = {
    x: -START_TILE.col * TILE_SIZE + canvas.width / 2 - TILE_SIZE / 2,
    y: -START_TILE.row * TILE_SIZE + canvas.height / 2 - TILE_SIZE / 2
}
// *********************** //

// identifico i quadretti di contatto
collisionsMap.forEach((row, i) => {
    row.forEach((el, j) => {
        if (el === 2103) {
            boundaries.push(new Boundary({
                position: {
                    x: j * Boundary.w + offset.x,
                    y: i * Boundary.h + offset.y,
                }
            }))
        }
    })
})

doorMap.forEach((row, i) => {
    row.forEach((el, j) => {
        if (el === 2104) {
            doorAreas.push(new Boundary({
                position: {
                    x: j * Boundary.w + offset.x,
                    y: i * Boundary.h + offset.y,
                }
            }))
        } else if (el === 2107) {
            doorLighthouseAreas.push(new Boundary({
                position: {
                    x: j * Boundary.w + offset.x,
                    y: i * Boundary.h + offset.y,
                }
            }))
        }
    })
})

// istanzio le imgs
const img = new Image()
const dietroImg = new Image()

if (window.location.pathname === '/') {
    img.src = '/assets/imgs/new-pellet-town.png'
    dietroImg.src = '/assets/imgs/front-els-new-pellet-town.png'
} else if (window.location.pathname === '/home') {
    img.src = '/assets/imgs/new-casa-interno.png'
    dietroImg.src = '/assets/imgs/passaDietroInterno.png'
} else if (window.location.pathname === '/lighthouse') {
    img.src = '/assets/imgs/new-lighthouse-interno.png'
    dietroImg.src = '/assets/imgs/retroInternoLighthouse.png'
}

const playerUpImg = new Image()
playerUpImg.src = '/assets/imgs/playerUp.png'

const playerLeftImg = new Image()
playerLeftImg.src = '/assets/imgs/playerLeft.png'

const playerDownImg = new Image()
playerDownImg.src = '/assets/imgs/playerDown.png'

const playerRightImg = new Image()
playerRightImg.src = '/assets/imgs/playerRight.png'

const player = new Moving({
    position: {
        // 192 e 68 sono le misure intrinsiche del img player
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2,
    },
    img: playerDownImg,
    frames: {max: 4},
    sprites: {
        up: playerUpImg,
        left: playerLeftImg,
        down: playerDownImg,
        right: playerRightImg,
    }
})

const bg = new Moving({ 
    position: {
        x: offset.x,
        y: offset.y,
    },
    img: img,
})

// passa dietro
const dietro = new Moving({ 
    position: {
        x: offset.x,
        y: offset.y,
    },
    img: dietroImg
})

const keys = {
    w: {pressed: false},
    a: {pressed: false},
    s: {pressed: false},
    d: {pressed: false},
}

let lastKey = ''

// per muovere contemporaneamente mappa e bariere
const movables = [bg, ...boundaries, ...doorAreas, ...doorLighthouseAreas, dietro]

function rectangularCollision({ rect1, rect2 }) {
    return (
        rect1.position.x + rect1.width >= rect2.position.x &&
        rect1.position.x <= rect2.position.x + rect2.width &&
        rect1.position.y <= rect2.position.y + rect2.height &&
        rect1.position.y + rect1.height >= rect2.position.y
    )
}

// creo una sentinella quando busso alla porta, se è true faccio return (quindi non posso camminare con il fumetto aperto)
const doorSet = { isKnocking: false }

btnsNo.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        console.log("click")
        fumetti.forEach((fumetto, index) => {
            if (fumetto.classList.contains('active')) {
                fumetto.classList.remove('active')
            }
        })
        doorSet.isKnocking = false
    })
})

function animate() {

    window.requestAnimationFrame(animate)

    if (isMobile) {
        c.save()
     
        const zoom = 0.7
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
     
        c.translate(centerX, centerY)
        c.scale(zoom, zoom)
        c.translate(-centerX, -centerY)
    }
   
    bg.draw()
    boundaries.forEach((boundary) => boundary.draw())
    doorAreas.forEach((door) => door.draw())
    doorLighthouseAreas.forEach((door) => door.draw())
    player.draw()
    dietro.draw()

    c.restore()
    
    let isMoving = true
    player.moving = false

    if (doorSet.isKnocking) return

    if (keys.w.pressed) {
        // collision con door "home"
        for (let i = 0; i < doorAreas.length; i++) {
            const door = doorAreas[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {...door, position: {
                        x: door.position.x,
                        y: door.position.y + 10
                    }}
                })
            ) {
                fumetti.forEach((fumetto, index) => {
                    if (fumetto.dataset.fumetto === "home") {
                        fumetto.classList.add('active')
                    }
                })     
                doorSet.isKnocking = true
                break
            }
        }
        // collision con door "lighthouse"
        for (let i = 0; i < doorLighthouseAreas.length; i++) {
            const door = doorLighthouseAreas[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {...door, position: {
                        x: door.position.x,
                        y: door.position.y + 10
                    }}
                })
            ) {                
                fumetti.forEach((fumetto, index) => {
                    if (fumetto.dataset.fumetto === "lighthouse") {
                        fumetto.classList.add('active')
                    }
                })
                doorSet.isKnocking = true
                break
            }
        }
    } else if (keys.s.pressed) {
        // collision con door "home" per uscire
        for (let i = 0; i < doorAreas.length; i++) {
            const door = doorAreas[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {...door, position: {
                        x: door.position.x,
                        y: door.position.y - 20
                    }}
                })
            ) {                
                fumetti.forEach((fumetto, index) => {
                    fumetto.classList.add('active')
                })
                doorSet.isKnocking = true
                break
            }
        }
    }

    // movimento
    if (keys.w.pressed && lastKey === 'ArrowUp') {
        player.moving = true
        player.img = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y + movSpeed
                    }}
                })
            ) {
                isMoving = false
                break
            }
        }
        if (isMoving)
            movables.forEach((move) => {
                move.position.y += movSpeed
            })
    } else if (keys.a.pressed && lastKey === 'ArrowLeft') {
        player.moving = true
        player.img = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {...boundary, position: {
                        x: boundary.position.x + movSpeed,
                        y: boundary.position.y
                    }}
                })
            ) {
                isMoving = false
                break
            }
        }
        if (isMoving)
            movables.forEach((move) => {
                move.position.x += movSpeed 
            })
    } else if (keys.s.pressed && lastKey === 'ArrowDown') {
        player.moving = true
        player.img = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y - movSpeed
                    }}
                })
            ) {
                isMoving = false
                break
            }
        }
        if (isMoving)
        movables.forEach((move) => {
            move.position.y -= movSpeed 
        })
    } else if (keys.d.pressed && lastKey === 'ArrowRight') {
        player.moving = true
        player.img = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rect1: player,
                    rect2: {...boundary, position: {
                        x: boundary.position.x - movSpeed,
                        y: boundary.position.y
                    }}
                })
            ) {
                isMoving = false
                break
            }
        }
        if (isMoving)
        movables.forEach((move) => {
            move.position.x -= movSpeed 
        }) 
    }
}
animate()

window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            keys.w.pressed = true
            lastKey = 'ArrowUp'
            break
        case 'ArrowLeft':
            keys.a.pressed = true
            lastKey = 'ArrowLeft'
            break
        case 'ArrowDown':
            keys.s.pressed = true
            lastKey = 'ArrowDown'
            break
        case 'ArrowRight':
            keys.d.pressed = true
            lastKey = 'ArrowRight'
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            keys.w.pressed = false
            break
        case 'ArrowLeft':
            keys.a.pressed = false
            break
        case 'ArrowDown':
            keys.s.pressed = false
            break
        case 'ArrowRight':
            keys.d.pressed = false
            break
    }
})

// direzioni
const setDirection = (key, isPressed) => {
    switch (key) {
        case 'ArrowUp': keys.w.pressed = isPressed; lastKey = 'ArrowUp'; break;
        case 'ArrowDown': keys.s.pressed = isPressed; lastKey = 'ArrowDown'; break;
        case 'ArrowLeft': keys.a.pressed = isPressed; lastKey = 'ArrowLeft'; break;
        case 'ArrowRight': keys.d.pressed = isPressed; lastKey = 'ArrowRight'; break;
    }
}

document.getElementById('mob-dir-up').addEventListener('touchstart', () => setDirection('ArrowUp', true))
document.getElementById('mob-dir-up').addEventListener('touchend', () => setDirection('ArrowUp', false))

document.getElementById('mob-dir-down').addEventListener('touchstart', () => setDirection('ArrowDown', true))
document.getElementById('mob-dir-down').addEventListener('touchend', () => setDirection('ArrowDown', false))

document.getElementById('mob-dir-left').addEventListener('touchstart', () => setDirection('ArrowLeft', true))
document.getElementById('mob-dir-left').addEventListener('touchend', () => setDirection('ArrowLeft', false))

document.getElementById('mob-dir-right').addEventListener('touchstart', () => setDirection('ArrowRight', true))
document.getElementById('mob-dir-right').addEventListener('touchend', () => setDirection('ArrowRight', false))