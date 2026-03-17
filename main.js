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
    const centerCircle = document.querySelector("#child");
    const centerBounds = centerCircle.getBoundingClientRect();

    const dragging = {
        active: false,
        origin: undefined,
        target: undefined,
    };

    const resetAllCircles = () => circles.forEach(circle => circle.classList.remove("circle-outline"));

    circles.forEach((circle, index) => {
        circle.addEventListener("mouseover", event => {
            resetAllCircles();

            circle.classList.add("circle-outline");
            event.stopPropagation();
        });

        circle.addEventListener("mouseleave", event => {
            resetAllCircles();
            event.stopPropagation();
        });

        circle.addEventListener("mouseup", event => {
            dragging.active = false;

            console.log(event);

            const x1 = parseFloat(line.getAttribute("x1"));
            const y1 = parseFloat(line.getAttribute("y1"));

            const x2 = centerBounds.left + centerBounds.width / 2;
            const y2 = centerBounds.top + centerBounds.height / 2;

            const [dx, dy] = [x2 - x1, y2 - y1];
            const d = Math.sqrt(dx + dy);
            const [ux, uy] = [dx / d, dy / d];
            const [nx, ny] = [x1 + ux * (d - 5), y1 + uy * (d - 5)];

            console.log(x1, x2, y1, y2);
            console.log(ux, uy);
            console.log('distance', d);

            line.setAttribute("x2", nx);
            line.setAttribute("y2", ny);

            event.stopPropagation();
        });
    });

    // container.addEventListener("mouseup", () => {
    //     dragging.active = false
    //     line.setAttribute("stroke", "transparent");
    //     line.setAttribute("x2", dragging.origin.x);
    //     line.setAttribute("y2", dragging.origin.y);
    //     container.querySelectorAll(".dragfrom").forEach(dot => {
    //         dot.innerHTML = "&#x25cb;";
    //     });
    // });

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