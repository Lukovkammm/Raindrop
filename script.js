const answerButtons = document.querySelector('.answer__buttons');
const display = document.querySelector('.display');
const rangeBase = document.querySelector('.range__base');
const rangeFill = document.querySelector('.range__fill');
const operationsContainer = document.querySelector('.operations');
const play = document.querySelector('.play');
const drop = document.querySelector('.drop');
const dropLucky = document.querySelector('.drop_lucky');
const score = document.querySelector('.score');
const sea = document.querySelector('.sea');
const modal = document.querySelector('.modal');
const modalRules = document.querySelector('.modal_rules');
const rules = document.querySelector('.rules');
const bgAudio = document.querySelector('.audio_bg');
const crushAudio = document.querySelector('.audio_crush');
const lostAudio = document.querySelector('.audio_lost');

let operations = ['+'];
let rightAnswer = 0;
let rightLuckyAnswer = 0;
let height = 100;

let youLose = false;
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
operationsContainer.firstElementChild.classList.add('operation_active');

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

function getDropPosition() {
    let randomPosition = Math.ceil(Math.random() * (90 - 10) + 10);
    return randomPosition;
}

function generateTask() {
    let randomNumbers = getRandomNumber();
    let randomOperation = getRandomOperation();
    if (randomOperation === '/') {
        if (randomNumbers[0] % randomNumbers[1] !== 0) {
            generateTask();
        }
    }
    return [randomNumbers, randomOperation];
}

function generateDrop() {
    let randoms = generateTask();
    drop.innerHTML = `
        <span class="task task__number_first">${randoms[0][0]}</span>
        <span class="task task__operator">${randoms[1]}</span>
        <span class="task task__number_second">${randoms[0][1]}</span>`;
    rightAnswer = eval(`${randoms[0][0]}${randoms[1]}${randoms[0][1]}`);
    return drop;
}

function generateLuckyDrop() {
    let randoms = generateTask();
    dropLucky.innerHTML = `
    <span class="task task__number_first">${randoms[0][0]}</span>
    <span class="task task__operator">${randoms[1]}</span>
    <span class="task task__number_second">${randoms[0][1]}</span>`;
    rightLuckyAnswer = eval(`${randoms[0][0]}${randoms[1]}${randoms[0][1]}`);
    return dropLucky;
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
    const button = e.target;
    showOnDisplay(button);
}

function clickOnKeyboard(e) {
    const button = document.querySelector(`button[data-key="${e.keyCode}"]`);
    showOnDisplay(button);
}

function showOnDisplay(button) {
    console.log(button);
    if (button) {
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
}

let timer;
let autoTimer;
let transitionTime = 3;
let dropCounter = 0;


function startGame() {
    youLose = false;
    height = 100;
    dropCounter = 0;
    transitionTime = 3;
    clearInterval(autoTimer);

    sea.style.cssText = `height: ${height}px; transition: all .3s linear;`;
    modal.classList.remove('modal_show');
    score.textContent = '0';

    startRain();
}

function startRain() {
    const dropPosition = getDropPosition();
    const drop = generateDrop();
    const dropLucky = generateLuckyDrop();
    if (drop.style.transition) {
        drop.style.cssText = '';
        seaUp();
        lostAudio.play();
    } else if (dropLucky.style.transition) {
        dropLucky.style.cssText = '';
        seaUp();
        lostAudio.play();
    } else {
        drop.style.cssText = `top: 95%; left: ${dropPosition}%; opacity: 1; transition: top ${transitionTime}s linear;`;
        dropCounter++;
    }

    clearInterval(timer);
    timer = setInterval(() => {
        if (!youLose) startRain();
        if (dropCounter === 3) {
            setTimeout(() => {
                generateLuckyDrop();
                dropLucky.style.cssText = `top: 125%; left: ${dropPosition}%; opacity: 1; transition: top ${transitionTime}s linear;`;
                dropCounter = 0;
                transitionTime -= 0.5;
            }, 1000);
        }
    }, (transitionTime * 1000));
}

function playGameAuto() {
    startGame();
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
        if (!youLose) {
            modalRules.classList.add('modal_show');
            display.textContent = rightAnswer;
            let result = rightAnswer;
            checkAnswer(result);

            setTimeout(() => {
                display.textContent = '';
                modalRules.classList.remove('modal_show');
            }, 1000);
        }
    }, ((2 * (transitionTime * 1000)) + 500));
}

function checkAnswer(result) {
    if (rightAnswer === +result || rightLuckyAnswer === +result) {
        crushAudio.play();
        if (rightAnswer) {
            rightAnswer = 0;
            drop.classList.add('drop_crushed');
            drop.innerHTML = '';
            setTimeout(() => {
                drop.style.cssText = '';
                drop.classList.remove('drop_crushed');
            }, 100);
        } else if (rightLuckyAnswer) {
            rightLuckyAnswer = 0;
            dropLucky.classList.add('drop-lucky_crushed');
            dropLucky.innerHTML = '';
            setTimeout(() => {
                dropLucky.style.cssText = '';
                dropLucky.classList.remove('drop-lucky_crushed');
            }, 100);
        }
        let scoreValue = +score.textContent;
        scoreValue += 5;
        score.textContent = scoreValue;
    } else {
        if (rightAnswer) {
            lostAudio.play();
            drop.style.cssText = '';
            startRain();
            seaUp();
        } else if (rightLuckyAnswer) {
            lostAudio.play();
            dropLucky.style.cssText = '';
            seaUp();
        }
    }
}


function seaUp() {
    if (height === 250) {
        stopGame();
    }
    height += 50;
    sea.style.cssText = `height: ${height}px; transition: all .3s linear;`;
}

function stopGame() {
    youLose = true;
    modal.classList.add('modal_show');
    modalRules.classList.remove('modal_show');

    modal.innerHTML = `
            <h2>Game over</h2>
            <span>Total score: ${score.textContent}</span>
            <span>Crushed drops: ${+(score.textContent) / 5}</span>`
}

play.addEventListener('click', startGame);
rules.addEventListener('click', playGameAuto);
operationsContainer.addEventListener('click', chooseOperation);
answerButtons.addEventListener('click', clickOnDisplay);
rangeBase.addEventListener('mousedown', () => {
    rangeBase.addEventListener('mousemove', changeNumberRange);
});
rangeBase.addEventListener('mouseup', () => {
    rangeBase.removeEventListener('mousemove', changeNumberRange);
});
rangeBase.addEventListener('click', changeNumberRange);
window.addEventListener('keydown', clickOnKeyboard);