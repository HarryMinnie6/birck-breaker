console.log("testing");

const canvas = document.querySelector(".game-board");

const context = canvas.getContext("2d");

const scoreDisplay = document.querySelector(".high-score");

const resetGame = document.querySelector(".reset");
const resetAfterDeath = document.querySelector(".reset-game");

canvas.height = 400;
canvas.width = 500;

//ball speed
let speed = 3;

//player score
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore"));

//for the left and right arrow keys
let right_Arrow_Pressed = false;
let left_Arrow_Pressed = false;

//creating the ball
let ball = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  direction_X: speed,
  direction_Y: -speed + 1,
  radius: 8,
  draw: function () {
    context.beginPath();
    context.fillStyle = "#8193A6";
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);

    context.closePath();
    context.fill();
  }
};

//creating the paddle
let paddle = {
  height: 10,
  width: 80,
  x: canvas.width / 2 - 76 / 2,
  draw: function () {
    context.beginPath();
    context.rect(this.x, canvas.height - this.height, this.width, this.height);
    context.fillStyle = "#F5749C";
    context.closePath();
    context.fill();
  }
};

//listening for arrow keys being pushed
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//what happens when arrow key is pushed in
function keyDown(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    right_Arrow_Pressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    left_Arrow_Pressed = true;
  }
}
//what happens when arrow key is released
function keyUp(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    right_Arrow_Pressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    left_Arrow_Pressed = false;
  }
}
if (isNaN(highScore)) {
  highScore = 0;
}
scoreDisplay.innerHTML = `High Score: ${highScore}`;

resetGame.addEventListener("click", () => {
  console.log("clicked");
  localStorage.setItem("highScore", "0");
  score = 0;
  scoreDisplay.innerHTML = `High Score: 0`;
  drawBricks();
});
resetAfterDeath.addEventListener("click", () => {
  window.location.reload();
});

//moving the paddle
function movePaddle() {
  if (right_Arrow_Pressed) {
    paddle.x += 5;
    //to prevent paddle from going of the right side of the screen
    if (paddle.x + paddle.width >= canvas.width) {
      paddle.x = canvas.width - paddle.width;
    }
  } else if (left_Arrow_Pressed) {
    paddle.x -= 5;
    //to prevent paddle from going of the left side of the screen
    if (paddle.x < 0) {
      paddle.x = 0;
    }
  }
}

function renderScore() {
  context.font = "16px Arial";
  context.fillStyle = "white";
  context.fillText("Score: " + score, 10, 20);
}

//rendering the game
function play() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  ball.draw();
  paddle.draw();
  drawBricks();
  movePaddle();
  brickCollisionDetection();
  levelUp();
  renderScore();

  //getting the ball to move
  ball.x += ball.direction_X;
  ball.y += ball.direction_Y;

  //side colision detection for the sides
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.direction_X *= -1;
  }

  //side colision detection for the top and bottom
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.direction_Y *= -1;
  }

  //making ball bounce off paddle
  if (
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width &&
    ball.y + ball.radius >= canvas.height - paddle.height
  ) {
    ball.direction_Y *= -1;
  }
  //reset the score if the ball touches the bottom
  if (ball.y + ball.radius > canvas.height) {
    if (score > parseInt(localStorage.getItem("highScore"))) {
      localStorage.setItem("highScore", score.toString());
      scoreDisplay.innerHTML = `High Score: ${score}`;
    }
    score = 0;
    setTimeout(function () {
      resetAfterDeath.style.display = "flex";
    }, 500);

    ball.direction_X = ball.y;
    ball.direction_Y = ball.x;
  }

  requestAnimationFrame(play);
}

//generating the bricks
let brick_Row_Count = 3;
let brick_Column_Count = 5;
let brick_Width = 70;
let brick_Height = 15;
let brick_Padding = 20;
let brick_Offset_Top = 30;
let brick_Offset_Left = 35;

let bricks = [];

//generating the bricks
function generateBricks() {
  for (let columns = 0; columns < brick_Column_Count; columns++) {
    bricks[columns] = [];
    for (let rows = 0; rows < brick_Row_Count; rows++) {
      bricks[columns][rows] = {
        x: 0,
        y: 0,
        status: 1
      };
    }
  }
}

//adding bricks to the gameboard
function drawBricks() {
  for (let columns = 0; columns < brick_Column_Count; columns++) {
    for (let rows = 0; rows < brick_Row_Count; rows++) {
      if (bricks[columns][rows].status === 1) {
        let brickX =
          columns * (brick_Width + brick_Padding) + brick_Offset_Left; //formula for getting bricks in the right place on the canvas
        let brickY = rows * (brick_Height + brick_Padding) + brick_Offset_Top; //formula for getting bricks in the right place on the canvas
        bricks[columns][rows].x = brickX;
        bricks[columns][rows].y = brickY;
        //drawing bricks onto canvas
        context.beginPath();
        context.rect(brickX, brickY, brick_Width, brick_Height);
        context.fillStyle = "#A9D800";
        context.fill();
        context.closePath();
      }
    }
  }
}

//collision detection for the bricks
function brickCollisionDetection() {
  for (let columns = 0; columns < brick_Column_Count; columns++) {
    for (let rows = 0; rows < brick_Row_Count; rows++) {
      let brick = bricks[columns][rows];
      if (brick.status === 1) {
        //checking if ball hits the bricks edges
        if (
          ball.x >= brick.x &&
          ball.x <= brick.x + brick_Width &&
          ball.y >= brick.y &&
          ball.y <= brick.y + brick_Height
        ) {
          ball.direction_Y *= -1;
          brick.status = 0;
          score++;
        }
      }
    }
  }
}

let gameLevelUp = true;

//increasing speed when all bricks are broken
function levelUp() {
  if (score % 15 === 0 && score !== 0) {
    //making sure bricks will load for new "level" when the ball is in the bottom half of the canvas
    if (ball.y > canvas.height / 2) {
      generateBricks();
    }
    if (gameLevelUp) {
      if (ball.direction_Y > 0) {
        ball.direction_Y += 1;
        gameLevelUp = false;
      } else if (ball.dy < 0) {
        ball.direction_Y -= 1;
        gameLevelUp = false;
      }
    }
    if (score % 15 !== 0) {
      gameLevelUp = true;
    }
  }
}

generateBricks();
play();