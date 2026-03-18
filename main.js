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

    getText() {
        return this.textElement.innerText;
    }
}


const shuffle = (xs) => {
    for (let i = xs.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = xs[i];
        xs[i] = xs[j];
        xs[j] = tmp;
    }
}

const findClosestPointOnCircle = (vA, vB, r) => {
    vC = {
        x: vB.x - vA.x,
        y: vB.y - vA.y
    }

    v2 = {
        x: Math.pow(vC.x, 2),
        y: Math.pow(vC.y, 2)
    };

    d = Math.sqrt(v2.x + v2.y);

    return {
        x: vA.x + r * (vC.x / d),
        y: vA.y + r * (vC.y / d)
    };
};

customElements.define("answer-box", AnswerBox);

document.addEventListener("DOMContentLoaded", async () => {

    const left = document.querySelector("#left");
    const right = document.querySelector("#right");

    let [leftList, rightList] = [[], []];

    const response = await fetch("/answers.json");
    const categories = await response.json();

    const answerMap = {};

    Object.entries(categories).forEach(([_, answerList]) => {
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

            answerMap[answer] = {
                elements: {
                    answerBox,
                    line: undefined,
                    dot: undefined
                },
                mapping: undefined
            };
        });

        shuffle(leftList);
        shuffle(rightList);

        leftList.forEach(answer => left.appendChild(answer));
        rightList.forEach(answer => right.appendChild(answer));
    });

    const container = document.querySelector("#container");
    const circles = document.querySelectorAll(".circle");
    const answers = document.querySelectorAll(".answer");
    const button = document.querySelector("button");
    const svg = container.querySelector("svg");
    const line = svg.querySelector("line");

    const dragging = {
        active: false,
        origin: undefined,
        target: undefined,
        answer: undefined,
    };

    const resetAllCircles = () => circles.forEach(circle => circle.classList.remove("circle-outline"));

    circles.forEach(circle => {
        circle.addEventListener("mouseover", event => {
            if (dragging.active) {
                resetAllCircles();
                circle.classList.add("circle-outline");
            }
            event.stopPropagation();
        });

        circle.addEventListener("mouseleave", event => {
            if (dragging.active) {
                resetAllCircles();
            }
            event.stopPropagation();
        });

        circle.addEventListener("mouseup", event => {
            if (!dragging.active) {
                return;
            }

            resetAllCircles();

            dragging.active = false;
            line.setAttribute("stroke", "transparent");

            const bounds = circle.getBoundingClientRect();

            vA = {
                x: parseFloat(line.getAttribute("x1")),
                y: parseFloat(line.getAttribute("y1"))
            }

            vB = {
                x: bounds.left + bounds.width / 2,
                y: bounds.top + bounds.height / 2
            }

            const vC = findClosestPointOnCircle(vB, vA, bounds.width / 2);

            const newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            newLine.setAttribute("x1", vA.x);
            newLine.setAttribute("y1", vA.y);
            newLine.setAttribute("x2", vC.x);
            newLine.setAttribute("y2", vC.y);
            newLine.setAttribute("stroke", "black");
            newLine.setAttribute("stroke-width", 2);
            svg.appendChild(newLine);
            answerMap[dragging.answer].elements.line = newLine;

            const newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            newCircle.setAttribute("r", 2);
            newCircle.setAttribute("cx", vC.x);
            newCircle.setAttribute("cy", vC.y);
            newCircle.setAttribute("stroke", "black");
            svg.appendChild(newCircle);
            answerMap[dragging.answer].elements.dot = newCircle;

            const mapping = circle.querySelector("div").innerText;
            answerMap[dragging.answer].mapping = mapping;

            event.stopPropagation();
        });
    });

    answers.forEach(answer => {
        answer.addEventListener("mousedown", () => {
            const answerText = answer.querySelector("span").innerText;

            if (answerMap[answerText]) {
                answerMap[answerText].elements.line?.remove();
                answerMap[answerText].elements.line = undefined;
                answerMap[answerText].elements.dot?.remove();
                answerMap[answerText].elements.dot = undefined;
            }

            dragging.active = true;
            dragging.answer = answerText;

            const dot = answer.querySelector(".dragfrom");
            const dotBounds = dot.getBoundingClientRect();

            dot.innerHTML = "&#x25cf;";

            dragging.origin = {
                x: dotBounds.x + dotBounds.width / 2,
                y: dotBounds.y + dotBounds.height / 2
            };

            line.setAttribute("stroke", "transparent");
            line.setAttribute("x1", dragging.origin.x);
            line.setAttribute("y1", dragging.origin.y - 1);
            line.setAttribute("y2", dragging.origin.x);
            line.setAttribute("y2", dragging.origin.y - 1);
        });
    });

    container.addEventListener("mousemove", event => {
        if (dragging.active) {
            line.setAttribute("stroke", "black");
            line.setAttribute("x2", event.clientX);
            line.setAttribute("y2", event.clientY);
        }
    });

    button.addEventListener("click", () => {
        Object.entries(answerMap).forEach(([answer, category]) => {
            const mapping = categories[category.mapping] || [];
            if (mapping.includes(answer)) {
                category.elements.answerBox.classList.add("right");
                category.elements.answerBox.classList.remove("wrong");
                console.log("correct!", answer);
            } else {
                category.elements.answerBox.classList.add("wrong");
                category.elements.answerBox.classList.remove("right");
                console.log("wrong!", answer);
            }
        });
    });
});

