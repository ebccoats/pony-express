// Game entities
import { Sprite, Spritesheet, Assets } from 'pixi.js'


async function makeSprite(label, isAnimated, width, height) {
    let path = `./assets/${label}.png`
    let sprite

    const texture = await Assets.load(path)
    texture.source.scaleMode = "nearest"

    if (!isAnimated) {
        sprite = new Sprite(texture)
        sprite.label = label
        return sprite

    } else {
        

    }

}

export function makeEntity(label, isAnimated) {

    let entity

    texture = getTexture(label)

    if (!isAnimated) {
        entity = new Sprite(texture)
        entity.label = label

    } else {
        entity = new 
    }



    return entity

}
