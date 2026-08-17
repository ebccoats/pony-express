// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application, Assets, Container, Sprite } from 'pixi.js';


  const container = new Container();

const screenWidth = 256
const screenHeight = 240

const scaleFactor = 3

let positionX
let positionY


async function init() {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ 
      background: '#1099bb', 
      width: screenWidth,
      height: screenHeight,
      resolution: scaleFactor,
  });
    app.canvas.style.imageRendering = "pixelated"


  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Create and add a container to the stage

  app.stage.addChild(container);

  // Load the bunny texture
  const texture = await Assets.load('./assets/PaperboyMapBG.png');
    texture.source.scaleMode = "nearest"

  // Create a 5x5 grid of bunnies in the container
    const background = new Sprite(texture)
    container.addChild(background)
    
  // Move the container to the center
  container.x = 0
  container.y = -(texture.height - screenHeight)

    positionX = container.x
    positionY = container.y

  // Center the bunny sprites in local container coordinates

  // Listen for animate update
    app.ticker.add(update);

}

init()

const containerSpeedY = 0.5
const containerSpeedX = -0.5

let accumulator = 0
let frequency = 1000/32 // 20 updates per second (1000 ms)

const update = (time) => {
    accumulator += time.deltaMS

    if (accumulator >= frequency) {
        positionX += (containerSpeedX * time.deltaTime)
        positionY += (containerSpeedY * time.deltaTime)

        container.x = Math.floor(positionX)
        container.y = Math.floor(positionY)

        accumulator -= frequency

    }

}
