// from https://gist.github.com/connorjclark/270558f27130a37747eeccb015232691

import { AnimatedSprite, Assets, extensions, ExtensionType, Rectangle, Texture, type ExtensionMetadataDetails, type FrameObject } from 'pixi.js'
import * as aseprite from "@kayahr/aseprite";

/**
 * Animation data structure
 */
export interface Animation {
    frames: FrameObject[]
    loop: boolean
    direction: 'forward' | 'reverse' | 'pingpong'
}

// Helper
function orderedFrames(sheet: aseprite.SpriteSheet): aseprite.ArrayFrame[] {
    const { frames } = sheet
    if (Array.isArray(frames)) return frames
    return Object.entries(frames).map(([filename, frame]) => ({ ...frame, filename }))
}

/**
  * Parse Aseprite JSON data and convert to PixiJS format
  */
const parseAsepriteData = (asepriteData: aseprite.SpriteSheet, baseTexture: Texture): AsepriteAsset => {
    const { meta } = asepriteData
    const frames = orderedFrames(asepriteData)
    const animations: Record<string, Animation> = {}
    const textures: Record<string, Texture> = {}

    frames.forEach((frameData) => {
        const frameName = frameData.filename
        const { frame, sourceSize, spriteSourceSize } = frameData

        const texture = new Texture({
            source: baseTexture.source,
            frame: new Rectangle(frame.x, frame.y, frame.w, frame.h),
            orig: new Rectangle(0, 0, sourceSize.w, sourceSize.h),
            trim: new Rectangle(
                spriteSourceSize.x,
                spriteSourceSize.y,
                spriteSourceSize.w,
                spriteSourceSize.h
            )
        })
        
        // keep sharp pixel-art look:
        texture.source.scaleMode = "nearest"

        textures[frameName] = texture
    })

    // Parse frame tags (animations)
    if (meta.frameTags) {
        meta.frameTags.forEach((tag) => {
            const animationFrames: FrameObject[] = []

            for (let i = tag.from; i <= tag.to; i++) {
                const frameData = frames[i]
                if (!frameData) continue
                animationFrames.push({
                    texture: textures[frameData.filename],
                    time: frameData.duration || 100
                })
            }

            animations[tag.name] = {
                frames: animationFrames,
                loop: tag.repeat == null,
                direction: tag.direction || 'forward'
            }
        })
    }

    // Fallback: create default animation from all frames
    if (Object.keys(animations).length === 0) {
        const allFrames: FrameObject[] = frames.map((frameData) => ({
            texture: textures[frameData.filename],
            time: frameData.duration || 100
        }))

        animations.default = {
            frames: allFrames,
            loop: true,
            direction: 'forward'
        }
    }

    // Return an AsepriteAsset object with helper methods
    return new AsepriteAsset(textures, animations, meta)
}

/**
 * Asset wrapper class with convenience methods
 */
export class AsepriteAsset<TAnimationNames extends string = string> {
    public readonly textures: Record<string, Texture>
    public readonly animations: Record<TAnimationNames, Animation>
    public readonly meta: aseprite.Meta

    constructor(
        textures: Record<string, Texture>,
        animations: Record<string, Animation>,
        meta: aseprite.Meta
    ) {
        this.textures = textures
        this.animations = animations
        this.meta = meta
    }

    /**
     * Get list of available animation names
     */
    getAnimationNames(): TAnimationNames[] {
        return Object.keys(this.animations) as TAnimationNames[]
    }

    /**
     * Check if an animation exists
     */
    hasAnimation(animationName: TAnimationNames): boolean {
        return animationName in this.animations
    }

    /**
     * Create an AnimatedSprite for a specific animation
     */
    createAnimatedSprite(animationName: TAnimationNames): AnimatedSprite {
        const animation = this.animations[animationName]

        if (!animation) {
            throw new Error(
                `Animation '${animationName}' not found. Available: ${this.getAnimationNames().join(', ')}`
            )
        }

        // animation.frames is { texture, time } []
        // which is what Pixi uses for per-frame timing.
        const sprite = new AnimatedSprite(animation.frames)

        sprite.loop = animation.loop
        sprite.animationSpeed = 1

        return sprite
    }

    /**
     * Get a single texture by frame name
     */
    getTexture(frameName: string): Texture | undefined {
        return this.textures[frameName]
    }

    /**
     * Get all textures for an animation
     */
    getAnimationTextures(animationName: TAnimationNames): Texture[] {
        const animation = this.animations[animationName]
        return animation ? animation.frames.map(frame => frame.texture) : []
    }

    /**
     * Get animation info without creating a sprite
     */
    getAnimationInfo(animationName: TAnimationNames): Animation | undefined {
        return this.animations[animationName]
    }

    /**
     * Get total duration of an animation in milliseconds
     */
    getAnimationDuration(animationName: TAnimationNames): number {
        const animation = this.animations[animationName]
        if (!animation) return 0

        return animation.frames.reduce((total, frame) => total + frame.time, 0)
    }

    /**
     * Get frame count for an animation
     */
    getAnimationFrameCount(animationName: TAnimationNames): number {
        const animation = this.animations[animationName]
        return animation ? animation.frames.length : 0
    }
}

const extension: ExtensionMetadataDetails = {
    type: ExtensionType.LoadParser,
    name: 'aseprite-loader',
    priority: 100, // Optional priority for ordering
}

export const asepriteLoader = {
    extension,

    /**
     * Test if this loader should handle the asset
     */
    test(url: string) {
        return url.endsWith('.aseprite.json') || (url.includes('aseprite') && url.endsWith('.json'))
    },

    async load(url: string) {
        // Load the JSON data
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to load Aseprite JSON: ${response.statusText}`)
        }
        const asepriteData: aseprite.SpriteSheet = await response.json()


        // Determine texture URL (assume same directory, same name but .png)
        const textureUrl = url.replace(/[^/]+\.aseprite\.json$/, asepriteData.meta.image)

        // Load the texture
        const texture = await Assets.load<Texture>(textureUrl)

        // Parse and return the processed data
        return parseAsepriteData(asepriteData, texture)
    }
}


/**
 * Initialize the Aseprite loader with PixiJS Assets system
 */
export function initAsepriteLoader(): void {
    // Add the loader to PixiJS extensions
    extensions.add(asepriteLoader)
}

// Auto-initialize when module is imported
initAsepriteLoader()

/* 
USAGE EXAMPLES WITH TYPESCRIPT:

// 1. Basic usage with proper typing
const playerAsset: AsepriteAsset = await PIXI.Assets.load('player.aseprite.json')
const walkSprite: PIXI.AnimatedSprite = playerAsset.createAnimatedSprite('walk')
app.stage.addChild(walkSprite)
walkSprite.play()

// 2. With custom texture URL and type safety
PIXI.Assets.add('player', {
  src: 'sprites/player.aseprite.json',
  data: { textureUrl: 'sprites/player_spritesheet.png' } as AsepriteAssetData
})
  const playerAsset: AsepriteAsset = await PIXI.Assets.load('player')

// 3. Type-safe bundle loading
interface GameAssets {
  player: AsepriteAsset
  enemy: AsepriteAsset
  npc: AsepriteAsset
  }

PIXI.Assets.addBundle('characters', {
  player: 'player.aseprite.json',
  enemy: 'enemy.aseprite.json',
  npc: 'npc.aseprite.json'
})
  
const characters = await PIXI.Assets.loadBundle<GameAssets>('characters')
const playerWalk: PIXI.AnimatedSprite = characters.player.createAnimatedSprite('walk')

// 4. Safe animation checking
if (playerAsset.hasAnimation('jump')) {
  const jumpSprite = playerAsset.createAnimatedSprite('jump')
  console.log(`Jump animation has ${playerAsset.getAnimationFrameCount('jump')} frames`)
  console.log(`Duration: ${playerAsset.getAnimationDuration('jump')}ms`)
  }

// 5. Get individual textures with null checking
const jumpTexture: PIXI.Texture | undefined = playerAsset.getTexture('jump_01')
if (jumpTexture) {
  const jumpSprite = new PIXI.Sprite(jumpTexture)
  }
*/
