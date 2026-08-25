// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application, Assets, Container, Sprite, Graphics } from 'pixi.js';
import { debugStuff } from './debug.js'
import './src/engine/utils/aseprite-loader.ts'
import { HitLine } from './src/engine/utils/hitLine.js'
import { scaleAnimationSpeed } from './src/engine/utils/animation.js';
import { KEY_MAP, createInput, keyboard } from './src/engine/utils/inputs.js'

// Debug flag
let debug = false
const pageTitle = document.title

if (pageTitle === "Pony Debug") {
    debug = true
}

let input

const container = new Container();
const player = new Container();
player.label = 'player'

const screenWidth = 256
const screenHeight = 240

const playerPositionFromRight = 85
const playerPositionFromBottom = 90

const scaleFactor = 3

let positionX
let positionY


async function init() {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({
        background: '#1099bb',
        ...(debug
            ? { resizeTo: window, resolution: 1 }
            : {
                  width: screenWidth,
                  height: screenHeight,
                  resolution: scaleFactor,
              }),
    });


    input = createInput([
        keyboard(KEY_MAP),
        // gamepad()
        // touch(app.canvas),
    ])

    app.canvas.style.imageRendering = "pixelated"


    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Create and add a container to the stage

    app.stage.addChild(container);

    // Load the background texture
    const texture = await Assets.load('./assets/PonyExpressMapBG.png');
    texture.source.scaleMode = "nearest"

    const background = new Sprite(texture)
    background.label = "background"
    container.addChild(background)

    let obstacle = new HitLine(233, 5608, 278, 5608, "fence")
    container.addChild(obstacle)

    // position the container at the start of the scroll
    container.x = 0
    container.y = -(texture.height - screenHeight)

    positionX = container.x
    positionY = container.y

    //add player/objects
    const riderSheet = await Assets.load('./assets/rider-sprite.aseprite.json')
    const rider = riderSheet.createAnimatedSprite('runFwRight')
    scaleAnimationSpeed(rider, 0.5)
    rider.play()
    player.addChild(rider)
    // debug for player collision
    let playerObstacle = new HitLine(0 + (rider.width/4), rider.height - (rider.height/4), rider.width - (rider.width / 4), rider.height / 3, "playerWall")
    player.addChild(playerObstacle)
    playerObstacle.debug() // debug function makes red line along collision line


    container.addChild(player)
    player.x = screenWidth - playerPositionFromRight
    player.y = container.height - playerPositionFromBottom

    if (!debug) {

        // Listen for animate update
        app.ticker.add(update);

    } else {

        // Debug stuff here
        debugStuff(app, container, player)
    }

}

init()

const containerSpeedY = 0.5
const containerSpeedX = -0.5

const playerSpeedX = 5

let accumulator = 0
let frequency = 1000 / 30 // 20 updates per second (1000 ms)

const update = (time) => {
    accumulator += time.deltaMS

    if (accumulator >= frequency) {

        input.poll()


        positionX += (containerSpeedX * time.deltaTime)
        positionY += (containerSpeedY * time.deltaTime)

        container.x = Math.floor(positionX)
        container.y = Math.floor(positionY)


        // keep player at the correct spot onscreen
        player.x = player.x - containerSpeedX + (input.moveX * playerSpeedX) 
        player.y = player.y - containerSpeedY

        // check if player has collided with a single fence
        let collide = player.getChildByLabel('playerWall')
        let translatedLine = collide.globalCoords(container, player)

        let fence = container.getChildByLabel('fence')
        if (fence.checkCollision(translatedLine)) {
            console.log("collision between player and fence")

        }



        // if (input.throwPressed) throwLetter()

        accumulator -= frequency

    }

}
