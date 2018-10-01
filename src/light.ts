import * as Color from "color";

declare const WEBSOCKET_URL: string;

const cursor = document.getElementById("cursor");
const canvas = document.getElementById("root") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const socket = new WebSocket(WEBSOCKET_URL);

function getRadius() {
    return Math.min(canvas.width / 2, canvas.height / 2);
}

function coordinatesToColor(x: number, y: number) {
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = x - centerX;
    const radiusY = y - centerY;
    const radius = getRadius();
    const distanceToCenter = Math.sqrt(Math.pow(radiusX, 2) + Math.pow(radiusY, 2));
    if (distanceToCenter < radius) {
        const hue = 360 * (Math.atan2(radiusY, radiusX)) / (Math.PI * 2);
        const lightness = 100 * (1 - distanceToCenter / radius);
        const color = Color.hsl(hue, 100, lightness);
        const { r, g, b } = color.rgb().object();
        return {
            r: Math.floor(r),
            g: Math.floor(g),
            b: Math.floor(b),
        };
    }
    return { r: 0, g: 0, b: 0 };
}

function colorToCoordinates(r: number, g: number, b: number) {
    const { width, height } = canvas;
    const { h, l } = Color.rgb(r, g, b).hsl().object();
    console.log(h, l);
    const arc = (h / 360) * Math.PI * 2;
    const radius = (1 - (l / 100)) * getRadius();
    const x = width / 2 + radius * Math.cos(arc);
    const y = height / 2 + radius * Math.sin(arc);
    return { x, y };
}

function render() {
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    const imageData = ctx.createImageData(width, height);
    const { data } = imageData;

    for (let x = 0; x < width; ++x) {
        for (let y = 0; y < height; ++y) {
            const { r, g, b } = coordinatesToColor(x, y);
            const index = (y * width + x) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, undefined, undefined);
}

canvas.addEventListener("mousedown", ({ x, y }) => {
    socket.send(JSON.stringify(coordinatesToColor(x, y)));
});

render();

window.addEventListener("resize", render);

socket.addEventListener("message", evt => {
    const { r, g, b } = JSON.parse(evt.data);
    const { x, y } = colorToCoordinates(r, g, b);
    const { width, height } = cursor.getBoundingClientRect();
    console.log(x, y);
    cursor.style.left = `${x - width / 2}px`;
    cursor.style.top = `${y - height / 2}px`;
});
