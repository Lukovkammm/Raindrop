const answerButtons = document.querySelector('.answer__buttons');
const display = document.querySelector('.display');
const rangeBase = document.querySelector('.range__base');
const rangeFill = document.querySelector('.range__fill');
const operationsContainer = document.querySelector('.operations');
const play = document.querySelector('.play');
const drops = document.querySelectorAll('.drop');
const score = document.querySelector('.score');
const sea = document.querySelector('.sea');
const modal = document.querySelector('.modal');
const rules = document.querySelector('.rules');
const bgAudio = document.querySelector('.audio_bg');
const crushAudio = document.querySelector('.audio_crush');
const lostAudio = document.querySelector('.audio_lost');

let lastDrop;
let operations = ['+'];
let rightAnswers = [];
let liveDropsSum = [];
let liveDropsNode = [];
let height = 100;

let timeUp = false;
let allActive = false;

const operationsData = [{
    data: '+',
    content: '+'
}, {
    data: '-',
    content: '-'
}, {
    data: '*',
    content: '&#215'
}, {
    data: '/',
    content: '&divide'
}, {
    data: 'All',
    content: 'All'
}];

const operationButtons = operationsData.reduce((acc, item) => {
    return acc + `<button data-operation="${item.data}" class="operation">${item.content}</button>`
}, '');
operationsContainer.innerHTML = operationButtons;

function changeNumberRange(e) {
    let length = rangeBase.offsetWidth;
    let maxNumber = Math.ceil((100 * e.layerX) / length);
    rangeFill.style.width = `${maxNumber}%`;
    maxNumber > 0 ? maxNumber : maxNumber = '0';
    rangeFill.textContent = maxNumber;
}

function getRandomNumber() {
    maxNumber = rangeFill.textContent;
    let randomNumberFirst = Math.ceil(Math.random() * maxNumber);
    let randomNumberSecond = Math.ceil(Math.random() * randomNumberFirst);
    return [randomNumberFirst, randomNumberSecond];
}

operationsContainer.firstElementChild.classList.add('operation_active');

function chooseOperation(e) {
    if (e.target.classList.contains('operation')) {
        e.target.classList.toggle('operation_active');
        if (e.target.classList.contains('operation_active')) {
            if (e.target.dataset.operation != 'All') {
                if (allActive) {
                    operationsContainer.lastElementChild.classList.remove('operation_active');
                    operations = [];
                    allActive = false;
                }
                operations.push(e.target.dataset.operation);
            } else {
                Array.from(operationsContainer.children, child => child.classList.remove('operation_active'));
                e.target.classList.add('operation_active');
                operations = ['+', '-', '*', '/'];
                allActive = true;
            }
        } else {
            let index = operations.indexOf(e.target.dataset.operation);
            operations.splice(index, 1);
        }
    }
    return operations;
}

function getRandomOperation() {
    let randomOperationIndex = Math.floor(Math.random() * operations.length);
    let randomOperation = operations[randomOperationIndex];
    return randomOperation;
}

let dropIndex = 0;

function getDrop() {
    let randomPosition = Math.ceil(Math.random() * (90 - 10) + 10);
    let drop = drops[dropIndex];
    dropIndex++;
    if (dropIndex >= drops.length) dropIndex = 0;
    return [drop, randomPosition];
}

function generateTask() {
    let randomNumbers = getRandomNumber();
    let randomOperation = getRandomOperation();
    let drop = getDrop();

    drop[0].innerHTML = `
        <span class="task task__number_first">${randomNumbers[0]}</span>
        <span class="task task__operator">${randomOperation}</span>
        <span class="task task__number_second">${randomNumbers[1]}</span>`;
    drop[0].style.left = `${drop[1]}%`
    const rightAnswer = eval(`${randomNumbers[0]}${randomOperation}${randomNumbers[1]}`);
    rightAnswers.push(rightAnswer);
    return [drop[0], rightAnswer];
}

const answerKeys = [{
    key: 55,
    content: '7',
    class: 'number'
}, {
    key: 56,
    content: '8',
    class: 'number'
}, {
    key: 57,
    content: '9',
    class: 'number'
}, {
    key: 52,
    content: '4',
    class: 'number'
}, {
    key: 53,
    content: '5',
    class: 'number'
}, {
    key: 54,
    content: '6',
    class: 'number'
}, {
    key: 49,
    content: '1',
    class: 'number'
}, {
    key: 50,
    content: '2',
    class: 'number'
}, {
    key: 51,
    content: '3',
    class: 'number'
}, {
    key: 48,
    content: '0',
    class: 'number'
}, {
    key: 8,
    content: 'C',
    class: 'clear'
}, {
    key: 46,
    content: 'Del',
    class: 'delete'
}, {
    key: 13,
    content: 'Enter',
    class: 'enter'
}];

const content = answerKeys.reduce((acc, item) => {
    return acc + `
    <button data-key="${item.key}" class="${item.class}">${item.content}</button>`
}, '');
answerButtons.innerHTML = content;

function clickOnDisplay(e) {
    let button = e.target;
    showOnDisplay(button);
}

function clickOnKeyboard(e) {
    const button = document.querySelector(`button[data-key="${e.keyCode}"]`);
    showOnDisplay(button);
}

function showOnDisplay(button) {
    if (button.classList.contains('enter')) {
        let result = display.textContent;
        display.textContent = '';
        checkAnswer(result);
    } else if (button.classList.contains('clear')) {
        display.textContent = display.textContent.slice(0, length - 1);
    } else if (button.classList.contains('delete')) {
        display.textContent = '';
    } else if (button.classList.contains('number')) {
        if (display.textContent === '0') {
            display.textContent = button.textContent;
        } else {
            display.textContent += button.textContent;
        }
    }
}

function startGame() {
    height = 100;
    sea.style.cssText = `height: ${height}px; transition: all .3s linear;`;
    modal.classList.remove('modal_show');
    score.textContent = '0';
    rightAnswers = [];

    // bgAudio.play();


    startRain();
    setInterval(() => {
        if (!timeUp) startRain();
        if (timeUp) stopGame();
    }, 3000);

    setTimeout(() => {
        timeUp = true;
        stopGame();
    }, 20000);
    timeUp = false;
}

function startRain() {
    const drop = generateTask();
    liveDropsSum.push(drop[1]);
    liveDropsNode.push(drop[0]);
    drop[0].classList.add('drop_active');
    setTimeout(() => {
        drop[0].classList.remove('drop_active');
    }, 3000);

}

function checkAnswer(result) {
    liveDropsSum.forEach((sum, index) => {
        if (sum === +result) {
            crushAudio.play();
            liveDropsNode[index].classList.remove('drop_active');
            liveDropsNode[index].innerHTML = '';
            liveDropsSum.splice(index, 1);
            liveDropsNode.splice(index, 1);
            let scoreValue = +score.textContent;
            scoreValue += 5;
            score.textContent = scoreValue;
            let i = rightAnswers.indexOf(+result);
            delete rightAnswers[i];
        } else {
            liveDropsNode[index].classList.remove('drop_active');
            liveDropsNode[index].innerHTML = '';
            liveDropsSum.splice(index, 1);
            liveDropsNode.splice(index, 1);
            seaUp();
        }
    })
}

function seaUp() {
    lostAudio.play();
    if (height === 250) {
        stopGame();
    }
    height += 50;
    sea.style.cssText = `height: ${height}px; transition: all .3s linear;`;
}

function stopGame() {
    timeUp = true;
    bgAudio.pause();
    let crushedDrops = rightAnswers.length - rightAnswers.filter(drop => drop).length;
    modal.classList.add('modal_show');
    modal.innerHTML = `
            <h2>Game over</h2>
            <span>Total score: ${score.textContent}</span>
            <span>Total drops: ${rightAnswers.length}</span>
            <span>Crushed drops: ${crushedDrops}</span>`
}

function playGameAuto() {
    startGame();
    let drop = generateTask();
    
}




play.addEventListener('click', startGame);
operationsContainer.addEventListener('click', chooseOperation);
answerButtons.addEventListener('click', clickOnDisplay);
rangeBase.addEventListener('mousedown', () => {
    rangeBase.addEventListener('mousemove', changeNumberRange);
});
rangeBase.addEventListener('mouseup', () => {
    rangeBase.removeEventListener('mousemove', changeNumberRange);
});
rangeBase.addEventListener('click', changeNumberRange);
rules.addEventListener('click', playGameAuto);
window.addEventListener('keydown', clickOnKeyboard);