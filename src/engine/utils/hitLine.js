// it's not a hitbox, it's a hitline


import { Point, Graphics } from 'pixi.js'

function lineLine(firstLine, secondLine) {
        const line1 = firstLine
        const line2 = secondLine
        const p0_x = line1.x1
        const p0_y = line1.y1
        const p1_x = line1.x2
        const p1_y = line1.y2
        const p2_x = line2.x1
        const p2_y = line2.y1
        const p3_x = line2.x2
        const p3_y = line2.y2
        const s1_x = p1_x - p0_x;
        const s1_y = p1_y - p0_y;
        const s2_x = p3_x - p2_x;
        const s2_y = p3_y - p2_y;
        const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        const t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
        return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}

export class HitLine extends Graphics {

    // TODO maybe an enum of "player", "danger", "barrier"

    constructor(startX, startY, endX, endY, label) {
        super()
        this.p1 = new Point(startX, startY)
        this.p2 = new Point(endX, endY)
        this.label = label
    }

    debug() {
        this
            .moveTo(this.p1.x, this.p1.y)
            .lineTo(this.p2.x, this.p2.y)
            .stroke( { width: 2, color: 0xff0000 })
    }

    getLine() {
        const line = {
            x1: this.p1.x,
            y1: this.p1.y,
            x2: this.p2.x,
            y2: this.p2.y
        }
        return line
    }

    checkCollision(line1) {
        const collided = lineLine(line1, this.getLine())

        return collided
    }

    // for when the collision is owned by a moving object
    // line1 must be global coordinates 
    checkCollisionGlobal(container, ownParentObject, line1) {
        let containerCoords = this.globalCoords(container, ownParentObject)
        const collided = lineLine(line1, containerCoords)
        return collided
    }

    // gives own global coordinates
    globalCoords(container, ownParentObject) {
        let localCoords = {
            p1: this.p1,
            p2: this.p2
        }

        let containerCoords = {
            p1: container.toLocal(localCoords.p1, ownParentObject),
            p2: container.toLocal(localCoords.p2, ownParentObject)
        }

        let containerLine = {
            x1: containerCoords.p1.x,
            y1: containerCoords.p1.y,
            x2: containerCoords.p2.x,
            y2: containerCoords.p2.y
        }
        return containerLine
    }

}

