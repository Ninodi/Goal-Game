const smallBoardBtn = document.getElementById('small-board')
const mediumBoardBtn = document.getElementById('medium-board')
const largeBoardBtn = document.getElementById('large-board')
const settContainer = document.querySelector('.settings-container')

const smallBoard = document.querySelector('.small-board')
const mediumBoard = document.querySelector('.medium-board')
const largeBoard = document.querySelector('.large-board')

const betAmount = document.getElementById('bet-amount')
const incrBet = document.getElementById('incrBet')
const decrBet = document.getElementById('decrBet')
const presetAmounts = document.querySelectorAll('.preset-amount')

const betBtn = document.getElementById('bet-btn')
const cashoutBtn = document.getElementById('cashout-btn')
const creditCont = document.getElementById('credit')

const bombSound = new Audio('assets/sounds/bomb.mp3');
const ballSound = new Audio('assets/sounds/ballKicks.mp3');
const winSound = new Audio('assets/sounds/win.mp3');


let bet = 2.00
let credit = 9999.00


//set 2.00 as base bet
betAmount.innerText = bet
//set 9999 as start amount for credit
creditCont.innerText = credit.toFixed(2) + "$"

//by default medium board should be active
mediumBoard.classList.add('active')
mediumBoardBtn.classList.add('active')


const removeActiveStatus = () => {
    document.querySelectorAll('.active').forEach(each => {
        each.classList.remove('active')
    })
}


//Change board sizes
const addActiveStatus = (targetBtn, targetBoard) => {
    targetBtn.addEventListener('click', () => {
        removeActiveStatus()
        targetBoard.classList.add('active')
        targetBtn.classList.add('active')
        document.querySelectorAll('.bomb').forEach(each => each.remove())
        targetBoard.querySelectorAll('.column.inactive').forEach(each => each.classList.remove('inactive'))
        document.querySelectorAll('.ball').forEach(ball => ball.remove())
    })
}

addActiveStatus(smallBoardBtn, smallBoard)
addActiveStatus(mediumBoardBtn, mediumBoard)
addActiveStatus(largeBoardBtn, largeBoard)



//increase/decrease bet amonunt manually
incrBet.addEventListener('click', () => {
    if(bet === 100) return
    bet = parseFloat((parseFloat(betAmount.value) + 0.1).toFixed(2))
    bet = Math.min(bet, 100);
    betAmount.value = bet.toFixed(2)
})

decrBet.addEventListener('click', () => {
    if(bet === 0.1) return
    bet = parseFloat((parseFloat(betAmount.value) - 0.1).toFixed(2))
    bet = Math.max(bet, 0.10)
    betAmount.value = bet.toFixed(2)
})


//increase/decrease bet with preset amounts
let presetFirstClick = true
let prevPreset

presetAmounts.forEach(eachAmount => {
    eachAmount.addEventListener('click', (e) => {
        let amountNumericValue = parseFloat(eachAmount.innerText)
        let currPreset = e.target

        if(prevPreset !== currPreset){
            presetFirstClick = true
            prevPreset = currPreset
        }

        if(presetFirstClick){
            betAmount.value = amountNumericValue.toFixed(2)
            presetFirstClick = false
            prevPreset = currPreset
        }else{
            bet = parseFloat(betAmount.value);
            bet += amountNumericValue;
            bet = Math.min(bet, 100);
            betAmount.value = bet.toFixed(2)
        }

    })
})



//start game
let bombPlaces = []
let columnIndex
let activeBox = null
let gameLost = false
let loss = 0 
let gain = 0
let boxEventHandlers = [];

betBtn.addEventListener('click', () => {
    columnIndex = 0
    let columns = document.querySelectorAll('.active .columns-container .column')
    let boxes = document.querySelectorAll('.active .column .box')
    let multiplierRates = document.querySelectorAll('.active .multiplier-rates p')
    multiplierRates.forEach(rate => rate.classList.remove('active'))

    if(gameLost){
        calculateLoss()
        loss = 0
        gain = 0
    } else {
        calculateGain()
        loss = 0
        gain = 0
    }

    multiplierRates[0].classList.add('active')

    resetGame(columns, columnIndex)
    placeBombs(columns)
    selectBox(boxes, columns, columnIndex, multiplierRates)

    columns.forEach(each => each.classList.remove('inactive'))
    settContainer.classList.add('inactive')
    columns[columnIndex].classList.add('active')

 });
 

 function selectBox(boxes, columns, columnIndex, multiplierRates){
    
    boxes.forEach((box, index) => {
        box.removeEventListener('click', boxEventHandlers[index])
    })

    boxEventHandlers = []

    boxes.forEach((box, index) => {
        let handler = (e) => {
            console.log('index', columnIndex)
            gain = 0
            columns[columnIndex].classList.remove('active')
            columns[columnIndex].classList.add('inactive')
            multiplierRates[columnIndex].classList.remove('active')
            columnIndex++
 
            betBtn.style.display = 'none'
            cashoutBtn.style.display = 'flex'
 
            currMult = multiplierRates[columnIndex-1].innerText.slice(1)
            currMult = parseFloat(currMult)
            gain = betAmount.value * currMult
 
            cashoutBtn.innerText = `CASHOUT ${gain.toFixed(2)}$`
 
            let myChoice = Array.from(columns[columnIndex-1].querySelectorAll('.box')).indexOf(e.target)
            
            if(myChoice === bombPlaces[columnIndex-1]){
                addExplosion(box)
                columns.forEach(each => each.classList.add('inactive'))
                columns.forEach(each => each.classList.remove('active'))
                // multiplierRates[columnIndex+1].classList.remove('active')
                console.log(multiplierRates)
                gameLost = true
                boxes.forEach((box, index) => {
                    box.removeEventListener('click', boxEventHandlers[index])
                })

            }else addBall(box)
 
            if (columnIndex === columns.length) {
                settContainer.classList.remove('inactive')
                bombPlaces = []
 
                gameLost = false
                let lastMult = multiplierRates[columns.length-1].innerText.slice(1)
                lastMult = parseFloat(lastMult)
                gain = betAmount.value * lastMult
                betBtn.style.display = 'flex'
                cashoutBtn.style.display = 'none'
                winSound.play()
                
            } else {
                multiplierRates[columnIndex].classList.remove('active')
                columns[columnIndex].classList.add('active')
                multiplierRates[columnIndex].classList.add('active')
            }
        };
 
        box.addEventListener('click', handler);
 
        boxEventHandlers[index] = handler;
    })
 }


 function addBall(box){
    let ball = document.createElement('img')
    ball.src = 'assets/images/ball.png'
    ball.classList.add('ball')

    box.append(ball)
    ballSound.currentTime = 0
    ballSound.play()
 }

 function calculateLoss(){
    loss = betAmount.value
    credit -= loss
    creditCont.innerText = `${credit.toFixed(2)}$`
 }

 function calculateGain(){
    credit += gain
    creditCont.innerText = `${credit.toFixed(2)}$`
 }


 function addExplosion(box){
    bombSound.play()
    box.querySelector('img').src = 'assets/images/explode.png'
    document.querySelectorAll('.bomb').forEach(bomb => bomb.style.display = "block")
    settContainer.classList.remove('inactive')
    betBtn.style.display = 'flex'
    cashoutBtn.style.display = 'none'
 }

 function placeBombs(columns){
    columns.forEach(each => {
        let firstColumn = columns[0]
        let boxesInFirstColumn = firstColumn.querySelectorAll('.box')
        let boxNumber = boxesInFirstColumn.length
        let bombIndex = Math.floor(Math.random() * boxNumber)

        let bombImg = document.createElement('img')
        bombImg.classList.add('bomb')
        bombImg.src = 'assets/images/bomb.png'

        each.querySelectorAll('.box')[bombIndex].append(bombImg)
        bombPlaces.push(bombIndex)

    })
 }


 function resetGame(columns){
    document.querySelectorAll('.bomb').forEach(bomb => bomb.remove())
    columns.forEach(each => each.classList.remove('inactive'))
    columns.forEach(each => each.classList.remove('active'))
    document.querySelectorAll('.ball').forEach(ball => ball.remove())

    bombPlaces = []
    bombSound.pause()
    bombSound.currentTime = 0
 }

 cashoutBtn.addEventListener('click', () => {

    creditCont.innerText = `${credit + gain}$`
    betBtn.style.display = 'flex'
    cashoutBtn.style.display = 'none'
    settContainer.classList.remove('inactive')
    winSound.play()

    document.querySelectorAll('.bomb').forEach(bomb => bomb.remove())
    document.querySelectorAll('.column').forEach(each => each.classList.remove('inactive', 'active'))
    document.querySelectorAll('.multiplier-rates p').forEach(each => each.classList.remove('active'))
    document.querySelectorAll('.ball').forEach(ball => ball.remove())

    bombPlaces = []
    columnIndex = 0
 })