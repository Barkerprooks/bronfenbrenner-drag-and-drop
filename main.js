class Line {
    constructor(v2Initial, v2Final) {
        this.v2Initial = v2Initial;
        this.v2Final = v2Final;
    }
}

class Viewport {
    constructor(selector) {
        this.element = document.querySelector(id);
        this.questions = [];
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector("#container");
    const circles = document.querySelectorAll(".circle");
    const answers = document.querySelectorAll(".answer");
    const svg = container.querySelector("svg");
    const line = svg.querySelector("line");

    const dragging = {
        active: false,
        origin: undefined,
        target: undefined,
    };

    const resetAllCircles = () => circles.forEach(circle => circle.classList.remove("circle-outline"));

    circles.forEach(circle => {
        circle.addEventListener("mouseover", event => {
            resetAllCircles();
            circle.classList.add("circle-outline");
            event.stopPropagation();
        });

        circle.addEventListener("mouseleave", event => {
            resetAllCircles();
            event.stopPropagation();
        });
    });

    container.addEventListener("mouseup", () => {
        dragging.active = false
        line.setAttribute("stroke", "white");
        line.setAttribute("x2", dragging.origin.x);
        line.setAttribute("y2", dragging.origin.y);
        container.querySelectorAll(".dragfrom").forEach(dot => {
            dot.innerHTML = "&#x25cb;";
        });
    });

    answers.forEach(answer => {
        answer.addEventListener("mousedown", event => {
            dragging.active = true;

            const dot = answer.querySelector(".dragfrom");
            const dotBounds = dot.getBoundingClientRect();

            dot.innerHTML = "&#x25cf;";

            dragging.origin = { x: dotBounds.x + dotBounds.width / 2, y: dotBounds.y + dotBounds.height / 2 };

            line.setAttribute("stroke", "white");
            line.setAttribute("x1", dragging.origin.x);
            line.setAttribute("y1", dragging.origin.y);
            line.setAttribute("y2", dragging.origin.x);
            line.setAttribute("y2", dragging.origin.y);
        });
    });

    container.addEventListener("mousemove", event => {
        if (dragging.active) {
            line.setAttribute("stroke", "black");
            line.setAttribute("x2", event.clientX);
            line.setAttribute("y2", event.clientY);
        }
    });
});