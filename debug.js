// Thanks cursor
import { DualShock4 } from "webhid-ds4"
import { playRumble, gallop, fastGallop, slowGallop } from './src/engine/utils/horse-haptics.js'

const DS4 = new DualShock4()

export function debugStuff(app, container) {

    const bounds = container.getLocalBounds();

    const fit = Math.min(
        window.innerWidth / bounds.width,
        window.innerHeight / bounds.height,
    );
    container.scale.set(fit);
    container.x = (window.innerWidth - bounds.width * fit) / 2;
    container.y = (window.innerHeight - bounds.height * fit) / 2;

    const canvas = app.canvas;
    canvas.style.cursor = "default";

    let focusX = bounds.width / 2;
    let focusY = bounds.height / 2;

    let highlighted = new Set();

    function zoomTo(scale) {
        container.scale.set(scale);
        container.x = app.screen.width / 2 - focusX * scale;
        container.y = app.screen.height / 2 - focusY * scale;
    }

    canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        focusX = (mouseX - container.x) / container.scale.x;
        focusY = (mouseY - container.y) / container.scale.y;
    });

    canvas.addEventListener(
        "wheel",
        (e) => {
            e.preventDefault();
            container.x -= e.deltaX;
            container.y -= e.deltaY;
        },
        { passive: false },
    );

    window.addEventListener("keydown", (e) => {
        if (e.key >= "1" && e.key <= "9") {
            zoomTo(Number(e.key));
        }
        if (e.key === "0") {
            zoomTo(fit);
        }
        if (e.key === "Escape") {
            highlighted = new Set();
            renderChildren();
        }
    });


    // HUD pixel x, y debug
    const hud = document.createElement("div");
    hud.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 1000;
        padding: 6px 8px;
        background: #000;
        color: #0f0;
        font: 12px/1.3 monospace;
        pointer-events: none;
        user-select: none;
    `;
    hud.textContent = "x: —  y: —";
    document.body.appendChild(hud);

    function pngPixelAt(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (app.screen.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (app.screen.height / rect.height);
        const x = Math.floor((mouseX - container.x) / container.scale.x);
        const y = Math.floor((mouseY - container.y) / container.scale.y);
        return { x, y };
    }

    canvas.addEventListener("pointermove", (e) => {
        const { x, y } = pngPixelAt(e);
        const inside =
            x >= 0 && y >= 0 && x < bounds.width && y < bounds.height;
        hud.textContent = inside ? `x: ${x}  y: ${y}` : "x: —  y: —";
    });

    // HUD children list
    const childPanel = document.createElement("div");
    childPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        bottom: 10px;
        width: 220px;
        z-index: 1000;
        padding: 8px;
        overflow: auto;
        background: #000;
        color: #0f0;
        font: 12px/1.4 monospace;
        user-select: none;
        border: solid 1px #0f0;
    `;
    document.body.appendChild(childPanel);

    function childLabel(child, index) {
        return child.label || child.name || `${child.constructor.name} ${index}`;
    }

    function renderChildren() {
        if (container.children.length === 0) {
            childPanel.textContent = "no children";
            return;
        }

        childPanel.replaceChildren(
            ...container.children.map((child, index) => {
                const row = document.createElement("div");
                row.textContent = `${index}: ${childLabel(child, index)}  (${Math.floor(child.x)}, ${Math.floor(child.y)})`;
                row.style.padding = "2px 4px";
                if (highlighted.has(child)) {
                    row.style.background = "#0f0";
                    row.style.color = "#000";
                }
                return row;
            }),
        );
    }

    renderChildren();
    container.on("childAdded", renderChildren);
    container.on("childRemoved", renderChildren);

    function childrenAtPng(x, y) {
        return container.children.filter((child) => {
            const local = child.toLocal({ x, y }, container);
            const b = child.getLocalBounds();
            return (
                local.x >= b.x &&
                local.x < b.x + b.width &&
                local.y >= b.y &&
                local.y < b.y + b.height
            );
        });
    }


    // Controls Panel
    const controlsPanel = document.createElement("div");
    controlsPanel.style.cssText = `
        position: fixed;
        top: 50px;
        left: 10px;
        width: 220px;
        z-index: 1000;
        padding: 8px;
        overflow: auto;
        background: #000;
        color: #0f0;
        font: 12px/1.4 monospace;
        user-select: none;
        border: solid 1px #0f0;
    `;
    document.body.appendChild(controlsPanel);
    const connectButton = document.createElement("button")
    connectButton.innerText= "Connect controller"
    controlsPanel.appendChild(connectButton)

    const status = document.createElement("div")
    status.textContent = "Game controller connected?"
    controlsPanel.appendChild(status)

        // The WebHID device can only be requested upon user interaction
    connectButton.addEventListener('click', async () => {
      // This will request the WebHID device and initialize the controller
      await DS4.init()
      // Define a custom lightbar color
      await DS4.lightbar.setColorRGB(170, 255, 0)

        // Define a rumble
await playRumble(DS4, [...gallop, ...gallop, ...gallop, ...gallop, ...gallop])
await playRumble(DS4, [...fastGallop, ...fastGallop, ...fastGallop, ...fastGallop, ...fastGallop, ...fastGallop])
await playRumble(DS4, [...slowGallop, ...slowGallop, ...slowGallop, ...slowGallop, ...slowGallop, ...slowGallop, ])
      // The state object is updated periodically with the current controller state
        console.log(DS4.state.interface)
        const leftStick = document.createElement("div")
        controlsPanel.appendChild(leftStick)
        const rightStick = document.createElement("div")
        controlsPanel.appendChild(rightStick)
        const gyro = document.createElement("div")
        controlsPanel.appendChild(gyro)

        // translate gyro 65000 numbers into someting useful
        function toInt16(uint16Value) {
            return (uint16Value << 16) >> 16
        }

      function logInputs () {

          const gyroX = toInt16(DS4.state.axes.gyroX)
          const gyroY = toInt16(DS4.state.axes.gyroY)
          const gyroZ = toInt16(DS4.state.axes.gyroZ)
          
        requestAnimationFrame(logInputs)
        leftStick.innerText = `Left Stick: ${DS4.state.axes.leftStickX}, ${DS4.state.axes.leftStickY}`
        rightStick.innerText = `Right Stick: X:${DS4.state.axes.rightStickX}, Y:${DS4.state.axes.rightStickY}`
          gyro.innerText = `Gyro: X:${gyroX}, Y: ${gyroY}, Z: ${gyroZ}`
      }
      logInputs()
    })



    canvas.addEventListener("dblclick", (e) => {
        const { x, y } = pngPixelAt(e);
        highlighted = new Set(childrenAtPng(x, y));
        renderChildren();
    });
}
