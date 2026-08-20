import { DualShock4 } from 'webhid-ds4'

// get controller permissions/connection thru popup


const controllerPopup = document.createElement("dialog")
const connectButton = document.createElement("button")
connectButton.innerText= "Connect controller"
controllerPopup.appendChild(connectButton)

export function makeControllerDialog(page) {
    page.appendChild(controllerPopup)

}

function toInt16(uint16value) {
    return (uint16value << 16) >> 16
}

// stuff to normalize raw gyro input
const gyroZero = 65535
const ps4HardwareScaleFactor = 16.384

// gyro beta = pitch (nose up/down tilt)
// gyro gamma = roll (left/right tilt)
// gyro alpha = yaw (2d direction you are pointing)

function getGyros(controller) {
    const gyro = {
        x: toInt16(controller.state.axes.gyroX),
        y: toInt16(controller.state.axes.gyroY),
        z: toInt16(controller.state.axes.gyroZ)
    }

    return gyro
}

        // The WebHID device can only be requested upon user interaction
    connectButton.addEventListener('click', async () => {
      const DS4 = new DualShock4()
      // This will request the WebHID device and initialize the controller
      await DS4.init()
      // Define a custom lightbar color
      await DS4.lightbar.setColorRGB(170, 255, 0)
      // The state object is updated periodically with the current controller state
      function logInputs () {

          const gyroValues = getGyros(DS4)

          const degreesPerSecond = {
              pitch: gyroValues.x / ps4HardwareScaleFactor,
              roll: gyroValues.y / ps4HardwareScaleFactor,
              yaw: gyroValues.z / ps4HardwareScaleFactor
          }
          
          
        requestAnimationFrame(logInputs)
      }
      logInputs()
    })

