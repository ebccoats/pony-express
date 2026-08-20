
let haptics = false
let strideDone = true

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function playRumble(ds4, steps) {
    let t = performance.now()
    for (const step of steps) {
        ds4.rumble.setRumbleIntensity(step.light, step.heavy) // don't await
        t += step.durationMs
        await wait(Math.max(0, t - performance.now()))
    }
    // await ds4.rumble.setRumbleIntensity(0, 0)
}

const beat = 100 

export const gallop = [
    { light: 255, heavy: 0, durationMs: beat / 2},
    { light: 255, heavy: 255, durationMs: beat},
    { light: 255, heavy: 0, durationMs: beat / 2},
    { light: 0, heavy: 0, durationMs: (beat * 4) },
]

export const fastGallop = [
    { light: 255, heavy: 0, durationMs: beat / 2},
    { light: 255, heavy: 255, durationMs: beat / 2},
    { light: 255, heavy: 0, durationMs: beat / 2},
    { light: 0, heavy: 0, durationMs: (beat * 2) },
]

export const slowGallop = [
    { light: 255, heavy: 0, durationMs: beat / 2},
    { light: 0, heavy: 0, durationMs: beat * 2 },
    { light: 255, heavy: 255, durationMs: beat },
    { light: 0, heavy: 0, durationMs: (beat * 4) },
]
