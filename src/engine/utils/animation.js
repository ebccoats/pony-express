// Animation speed helpers

export function setAnimationFps(sprite, fps, sourceFrameMs = 100) {
    sprite.animationSpeed = (fps * sourceFrameMs) / 1000
}

export function scaleAnimationSpeed(sprite, multiple) {
    sprite.animationSpeed *= multiple
}
