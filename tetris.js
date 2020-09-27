// main canvas, gameboard
const cvs = document.getElementById('tetris');
const ctx = cvs.getContext('2d');

// sub-canvas, to show the next tetromino
const cvsSub = document.getElementById('sub');
const ctxSub = cvsSub.getContext('2d');

// score, level, startbutton
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const descriptText = document.getElementById('description');
const bonusText = document.getElementById('bonus-text');
const startBtn = document.querySelector('#start-btn');

let score = 0;
let level = 0;
let speed = 1000;   // entry speed (ms)
const bonus = 10;

let start = false;
let pauseDrop = false;  // for pause

// main canvas - row, column, squaresize 20, board(color)
const row = 20;
const col = 10;
const sq = 20;
let board = [];

// sub canvas - boardSub 4*4 cells
const rowSub = 4;
const colSub = 4;
let boardSub = [];

// empty square color, delete line color, background color, stroke color
const vacant = 'azure';
const deleteColor = 'red';
const backColor = 'darkslategray';
const strokeColor = 'black';

//-------------------------------------
// click start button - Game Start
startBtn.addEventListener('click', () => {

    if(!start){
        startBtn.disabled = true; 
        descriptText.innerHTML = 'PLAYING...';
        start = true;
        nextPiece.drawNext();
        drop();
    }
});


//--------------- BOARD ----------------------
// draw one square in main canvas
function drawSquare(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(x*sq, y*sq, sq, sq);
    
    ctx.strokeStyle = strokeColor;
    ctx.strokeRect(x*sq, y*sq, sq, sq);
}
// draw one sub square, with backgroundcolor
function drawSquareSub(x, y, color){
    ctxSub.fillStyle = color;
    ctxSub.fillRect(x*sq, y*sq, sq, sq);
    
    ctxSub.strokeStyle = backColor;
    ctxSub.strokeRect(x*sq, y*sq, sq, sq);
}

// create a white(empty) board-color array (color array)
for(let r=0; r<row; r++){       //y
    board[r] = [];
    for(let c=0; c<col; c++){   //x
        board[r][c] = vacant;
    }
}
// create a sub board (with background color)
for(let r=0; r<rowSub; r++){       //y
    boardSub[r] = [];
    for(let c=0; c<colSub; c++){   //x
        boardSub[r][c] = backColor;
    }
}

// draw/update a board (all squares) 
function drawBoard(){
    for(let r=0; r<row; r++){       //y
        for(let c=0; c<col; c++){   //x
            drawSquare(c, r, board[r][c]);
        }
    }
}
// before game start, create game board, all square are vacant color (white) 
drawBoard();

// draw/update a sub board
function drawBoardSub(){
    for(let r=0; r<rowSub; r++){       //y
        for(let c=0; c<colSub; c++){   //x
            drawSquareSub(c, r, boardSub[r][c]);
        }
    }
}
// create sub board, with background color
drawBoardSub();


//---------------- PIECES ---------------------
// seven tetromino types and its color
const tPieces = [
    [iT, 'cyan'],
    [jT, 'blue'],
    [lT, 'orange'],
    [oT, 'yellow'],
    [sT, 'lime'],
    [tT, 'blueviolet'],
    [zT, 'forestgreen']
];

// tetromino constructor
function Piece(tetromino, color){   

    this.tetromino = tetromino;
    this.color = color;

    //tetromino index (rotate No.)/ start with the first rotate [0]
    this.rotateNum = 0;

    // acrive tetromino piece (current rotate)
    this.acriveT = this.tetromino[this.rotateNum];

    // to control tetromino (default - initial position)
    this.x = 3;
    this.y = -2;
}

// generate instance, random piece 
function randomPiece(){
    // ramdom Number (0 to 6 - from 7 kinds of tetrominos)
    let r = Math.floor(Math.random() * tPieces.length);
    return new Piece(tPieces[r][0], tPieces[r][1]);
}
// create randomPiece (game piece and next piece)
let gamePiece = randomPiece();
let nextPiece = randomPiece();

// nextpiece update
function updateNextpiece(){

    // create the next piece
    nextPiece = randomPiece();

    // clear the sub board color-array, with back ground color
    drawBoardSub();

    // draw the next piece
    nextPiece.drawNext();
}

// draw the next tetromino piece on the sub board (always inicial pos.)
Piece.prototype.drawNext = function(){
    for(let r=0; r<this.acriveT.length; r++){    //length 3 or 4 (iT or oT)
        for(let c=0; c<this.acriveT.length; c++){   
            if(this.acriveT[r][c]){              // 0 = vacant, 1 = draw 
                drawSquareSub(c, r, this.color);
            }
        }
    }
}

// draw / undraw a tetromino piece on the board
Piece.prototype.fill = function(x, y, color){
    for(let r=0; r<this.acriveT.length; r++){     //acriveT.length 3 or 4 (iT or oT)
        for(let c=0; c<this.acriveT.length; c++){   
            if(this.acriveT[r][c]){              // 0 = vacant, 1 = draw 
                drawSquare(x + c, y + r, color);
            }
        }
    }
}

// draw a tetromino piece on the board
Piece.prototype.draw = function(){
    this.fill(this.x, this.y, this.color);
}

// undraw a tetromino before move/rotate
Piece.prototype.undraw = function(){
    this.fill(this.x, this.y, vacant);
}


// ----- CONTROL Functions -----
// move down
Piece.prototype.moveDown = function(){
    if (pauseDrop) {
        return;
    }

    if(!this.collision(0, 1, this.acriveT)){    //collision = FALSE
        this.undraw();
        this.y++;
        this.draw();
    }
    else{   // lock the piece and generate next random piece
        this.lock();
        this.shineRow();
        gamePiece = nextPiece;
        updateNextpiece();
    }
}

// move right
Piece.prototype.moveRight = function(){
    if(!this.collision(1, 0, this.acriveT)){    //collision = FALSE
        this.undraw();
        this.x++;
        this.draw();
    }
}

// move left
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1, 0, this.acriveT)){    //collision = FALSE
        this.undraw();
        this.x--;
        this.draw();
    }
}

// rotate
Piece.prototype.rotate = function(){
    // next pattern after the rotate
    let nextPattern = this.tetromino[(this.rotateNum + 1) % this.tetromino.length];
   
    // if rotate at wall, kick one to the center direction
    let kick = 0; 

    // after the rotate (next pattern) happens collision
    if(this.collision(0, 0, nextPattern)){  // if rotate, collision happen
        if(this.x > col/2){ // right side of the board wall 
            kick = -1;      // move the piece to left
        }
        else{               // left side of the board wall 
            kick = 1;       // move the piece to right
        }
    }

    if(!this.collision(kick, 0, nextPattern)){    //collision = FALSE
        this.undraw();
        this.x += kick;
        this.rotateNum = (this.rotateNum + 1) % this.tetromino.length; // next tetromino index number (after rotate)
        this.acriveT = this.tetromino[this.rotateNum];
        this.draw();
    }
}

// sleep(waiting) when clear the line
function sleep(ms) {
    pauseDrop = true;
    return new Promise(resolve => setTimeout(() => {
        pauseDrop = false;
        return resolve();
    }, ms));
}

// lock the pieces
Piece.prototype.lock = async function(){

    for(let r=0; r<this.acriveT.length; r++){       //acriveT.length 3 or 4 (iT or oT)
        for(let c=0; c<this.acriveT.length; c++){   
            // skip the vacant squares
            if(!this.acriveT[r][c]){              // 0 = vacant, 1 = draw 
                continue;
            }

            // to lock the piece over the board, if game over
            if(this.y + r < 0){
                // stop the animation request
                gameOver = true;
                descriptText.innerHTML = 'GAME OVER!';

                alert('GAME OVER!!');
                break;
            }

            // to lock the piece if piece comes on the floor 
            // in board array give the color
            board[this.y + r][this.x + c] = this.color;
        }
    }
    // update the board
    drawBoard();
}

// shine the row if line is full 
Piece.prototype.shineRow = async function(){

    let rowNum = 0; // total row number to delate (1-4)
    let deleteRow = []; // row No. array, which rows schould be deleted

    // remove full row, if all columns are not vacant.
    for(let r=0; r<row; r++){
        let isRowFull = true;

        // if all the col (x) is not vacant
        for(let c=0; c<col; c++){
            isRowFull = isRowFull && (board[r][c] != vacant);
        }

        // if one row is full, to set the shine color
        if(isRowFull){

            rowNum += 1;
            deleteRow.push(r);

            // draw the fullrow - shine color
            for(let c=0; c<col; c++){
                board[r][c] = deleteColor;
            }

            // increment the score 
            score += 10;
            // increment the level
            if(score > 0 && score % 100 === 0){
                level += 1;
                if (speed > 50) speed -= 50;
            }
        }
    }
    
    // if there are some rows (1-4) to delete
    if(rowNum){

        // if 2-4 rows full together, + bonus 
        if(rowNum > 1) {
            for(let r=1; r<=rowNum; r++) {

                // increment the score (bonus)
                score += bonus;
            
                // increment the level
                if(score % 100 === 0){
                    level += 1;
                    if (speed > 50) speed -= 50;
                }
            }
            bonusText.innerHTML = `BONUS + ${bonus*rowNum} !`;    
        }  
        // update the score n level 
        scoreElement.innerHTML = score;
        levelElement.innerHTML = level;

        // draw the delete color
        drawBoard();

        // wait 200ms
        await sleep(500);

        //draw the delete color to white
        for(let r=0; r<row; r++){
            for(let c=0; c<col; c++){
                if(board[r][c] == deleteColor) board[r][c] = vacant;
            }
        }
        drawBoard();

        // wait 500ms
        await sleep(500);

        rowNum = 0;

        // delete bonus text
        bonusText.innerHTML = ' ';
    }

    // call the delete function, to delete the full rows
    if(deleteRow.length > 0) this.delete(deleteRow);
}

// delete the full rows
Piece.prototype.delete = function(dr){     

    for(let r=0; r<dr.length; r++){

        // if row is full, remove the row
        // rows above it - go down 
        for(let y=dr[r]; y>1; y--){
            for(let c=0; c<col; c++){  
                board[y][c] = board[y-1][c];
            }
        }

        // top of the board - add vacant row
        for(let c=0; c<col; c++){
            board[0][c] = vacant;
        }
    }
    // update the board
    drawBoard();
}

// collision function
Piece.prototype.collision = function(x, y, piece){
    for(let r=0; r<piece.length; r++){       //Tetromino.length 3 or 4 (iT or oT)
        for(let c=0; c<piece.length; c++){   
            // skip the vacant squares
            if(!piece[r][c]){         
                continue;
            }

            // the piece position after the movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // if new positions are beyond the board, collision == TRUE
            if(newX < 0 || newX >= col || newY >= row){
                return true;
            }

            // crush the game if y<0, contimue
            if(newY < 0){
                continue;
            }

            // if there is already locked piece on the new position(not vacant), collision == TRUE
            if(board[newY][newX] != vacant){
                return true;
            }
        }
    }
    return false;
}


// control the piece (event)
document.addEventListener('keydown', control);

function control(event){
    if (pauseDrop) {
        return;
    }
    if(event.keyCode === 37){
        gamePiece.moveLeft();
        dropStart = Date.now();
    }
    else if(event.keyCode === 38){
        gamePiece.rotate();
        dropStart = Date.now();
    }
    else if(event.keyCode === 39){
        gamePiece.moveRight();
        dropStart = Date.now();
    }
    else if(event.keyCode === 40){
        gamePiece.moveDown();
    }
}

// drop down the piece every second (1000ms) (animation)
let dropStart = Date.now();
let gameOver = false;

function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > speed){
        gamePiece.moveDown();
        dropStart = Date.now();
    }

    //animation request, until gameOver
      if(start && !gameOver) {
        animeId = requestAnimationFrame(drop);
    }  
}

