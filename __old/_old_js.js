const battleMap = []
for (let i = 0; i < battle.length; i += 70) {
    battleMap.push(battle.slice(i, 70 + i))
}

battleMap.forEach((row, i) => {
    row.forEach((el, j) => {
        if (el === 55) {
            battleAreas.push(new Boundary({
                position: {
                    x: j * Boundary.w + offset.x,
                    y: i * Boundary.h + offset.y,
                }
            }))
        }
    })
})

// collision con la battle area
if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleAreas.length; i++) {
        const battle = battleAreas[i]
        const overlappingArea = 
            (Math.min(player.position.x + player.width, battle.position.x + battle.width) -
            Math.max(player.position.x, battle.position.x)) *
            (Math.min(player.position.y + player.height, battle.position.y + battle.height) -
            Math.max(player.position.y, battle.position.y))
        if (
            rectangularCollision({
                rect1: player,
                rect2: {...battle, position: {
                    x: battle.position.x,
                    y: battle.position.y
                }}
                // per prendere dal busto in giu del player: player.width * player.height / 2
            }) &&  overlappingArea > (player.width * player.height) / 2
        ) {
            console.log("battle")
        }
    }
}