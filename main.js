class AnswerBox extends HTMLElement {
    constructor(text) {
        super();

        this.classList.add("answer");

        this.textElement = document.createElement("span");
        this.dragElement = document.createElement("span");

        this.textElement.innerText = text;
        this.dragElement.classList.add("dragfrom");
        this.dragElement.innerHTML = "&#x25cb;";

        this.appendChild(this.textElement);
        this.appendChild(this.dragElement);
    }
}

customElements.define("answer-box", AnswerBox);

const shuffle = (xs) => {
    for (let i = xs.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = xs[i];
        xs[i] = xs[j];
        xs[j] = tmp;
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    const left = document.querySelector("#left");
    const right = document.querySelector("#right");
    let [leftList, rightList] = [[], []];

    const categories = await fetch("/answers.json");

    Object.entries(await categories.json()).forEach(([_, answerList]) => {
        shuffle(answerList);

        answerList.forEach(answer => {
            const answerBox = new AnswerBox(answer);
            if (rightList.length >= 0 && rightList.length < 8) {
                rightList.push(answerBox);
            } else if (leftList.length >= 0 && leftList.length < 8) {
                leftList.push(answerBox);
            } else {
                Math.random() > 0.5 ? leftList.push(answerBox) : rightList.push(answerBox);
            }
        });

        leftList.forEach(answer => left.appendChild(answer));
        rightList.forEach(answer => right.appendChild(answer));
    });

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

    const withinCircle = (rect) => {
        const dx = rect;
    };

    circles.forEach(circle => {
        const shape = circle.getBoundingClientRect();
        console.log(shape);

        circle.addEventListener("mouseover", event => {
            resetAllCircles();

            circle.classList.add("circle-outline");
            event.stopPropagation();
        });

        circle.addEventListener("mousemove", event => {
            console.log(event);
        });

        circle.addEventListener("mouseleave", event => {
            resetAllCircles();
            event.stopPropagation();
        });

        circle.addEventListener("mouseup", event => {
            dragging.active = false;
            event.stopPropagation();
        });
    });

    container.addEventListener("mouseup", () => {
        dragging.active = false
        line.setAttribute("stroke", "transparent");
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

            dragging.origin = {
                x: dotBounds.x + dotBounds.width / 2,
                y: dotBounds.y + dotBounds.height / 2
            };

            line.setAttribute("stroke", "transparent");
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