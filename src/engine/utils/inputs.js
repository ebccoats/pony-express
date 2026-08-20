// owns devices -> actions. Does not move the rider.

export const KEY_MAP = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    throw: 'Space',
    slowdown: 'ArrowDown',
    speedup: 'ArrowUp',
}

// TODO: check against rcade documentation
export const CABINET_MAP = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    throw: 'ControlLeft',
    slowdown: 'ArrowDown',
    speedup: 'ArrowUp',
}

export function keyboard(map = KEY_MAP) {
    const keys = new Set()
    window.addEventListener('keydown', (e) => {
        keys.add(e.code)
        e.preventDefault()
    })
    window.addEventListener('keyup', (e) => keys.delete(e.code))

    return {
        moveX: 0,
        throwHeld: false,
        poll() {
            const left = keys.has(map.left)
            const right = keys.has(map.right)
            this.moveX = left && !right ? -1 :
                right && !left ? 1 : 0
            this.throwHeld = keys.has(map.throw)
        },
    }
}

export function gamepad(controlMode) {
    if (controlMode === 'tilt') {
        // roll to turn L or R (pull from ds4-handler)
    } else {
        // use L thumbstick
        // X to throw
    }
}

// export function touch(canvas) {
//     // TODO make gameboy style wrapper for mobile, with buttons
// }


export function createInput(adapters) {
    const state = { 
        moveX: 0, 
        throwPressed: false, 
        speedup: false, 
        slowdown: false 
    }
    let throwHeld = false

    function poll() {
        let moveX = 0
        let wantThrow = false
        for (const adapter of adapters) {
            adapter.poll()
            if (adapter.moveX) moveX = adapter.moveX
            if (adapter.throwHeld) wantThrow = true
        }

        state.moveX = moveX
        state.throwPressed = wantThrow && !throwHeld
        throwHeld = wantThrow
    }

    return {
        poll,
        get moveX() { return state.moveX },
        get throwPressed() { return state.throwPressed },
    }
}
