const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const size = 30;

function resizeCanvas() {
    const maxWidth = 600;
    let width = window.innerWidth > maxWidth ? maxWidth : window.innerWidth - 10;
    width = Math.floor(width / size) * size;
    
    canvas.width = width;
    canvas.height = width;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const score = document.querySelector(".score--value")
const highScoreElement = document.querySelector(".high-score--value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")

// Load high score
const highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreElement.innerText = highScore;

const btnUp = document.getElementById("btn-up");
const btnDown = document.getElementById("btn-down");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");

let speed = 200; 
const speedIncrement = 10; 
const scoreIncrementThreshold = 50; 




const audioEat = new Audio('../assets/audio.mp3')
const audioGameOver = new Audio('../assets/gameover.wav')

let snake = [
    {x: 270, y: 240}, 
    {x: 300, y: 240},
    {x: 330, y: 240}
];

const incrementScore = () => {
    const newScore = parseInt(score.innerText) + 10
    score.innerText = newScore

    if (newScore % scoreIncrementThreshold === 0) {
        speed = Math.max(50, speed - speedIncrement); 
    }

}

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
   const maxPosition = (canvas.width - size) / size
   return Math.round(randomNumber(0, maxPosition)) * size
}

const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

let direction, loopId, lastMoveDirection;
let isPaused = false;


const drawFood = () => {
    const {x, y, color} = food

    ctx.shadowColor = color
    ctx.shadowBlur = 20
    ctx.fillStyle = food.color
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}

const drawSnake = () => {
  ctx.fillStyle = "#ddd";

  snake.forEach((position, index) => {
    if (index == snake.length - 1) {
      ctx.fillStyle = "white";
    }

    ctx.fillRect(position.x, position.y, size, size);
  });
};

const moveSnake = () => {
  if (!direction) return;

  const head = snake[snake.length - 1];

  if (direction == "right") {
    snake.push({ x: head.x + size, y: head.y });
  }

  if (direction == "left") {
    snake.push({ x: head.x - size, y: head.y });
  }

  if (direction == "down") {
    snake.push({ x: head.x, y: head.y + size });
  }

  if (direction == "up") {
    snake.push({ x: head.x, y: head.y - size });
  }

  snake.shift();
  lastMoveDirection = direction;
};

const drawGrid = () => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#191919";

  for (let i = 30; i < canvas.width; i += 30) {
    ctx.beginPath()
    ctx.lineTo(i, 0)
    ctx.lineTo(i, canvas.height)
    ctx.stroke()

    ctx.beginPath()
    ctx.lineTo(0, i)
    ctx.lineTo(canvas.width, i)
    ctx.stroke()
  }
}

const checkEat = () => {
    const head = snake[snake.length - 1]

    if (head.x == food.x && head.y == food.y) {
        incrementScore()
        snake.push(head)
        try { audioEat.play() } catch (e) {}
        
        let x = randomPosition()
        let y = randomPosition()
    

        while (snake.find((position) => position.x == x && position.y == y)) {
         x = randomPosition()
         y = randomPosition()
        }

        food.x = x
        food.y = y
        food.color = randomColor()
    }
    
}

const resetFoodPosition = () => {
    food.x = randomPosition();
    food.y = randomPosition();
    food.color = randomColor();
};


const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    const wallCollision = 
       head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit
    
    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })



    if (wallCollision || selfCollision) {
       try { audioGameOver.play() } catch (e) {}
       gameOver()
       snake = [
        {x: 270, y: 240}, 
        {x: 300, y: 240},
        {x: 330, y: 240}
    ]
       
    }
    
}

const gameOver = () => {
    direction = undefined
    
    menu.style.display = "flex"
    finalScore.innerText = score.innerText
    canvas.style.filter = "blur(12px)"

    const currentScore = parseInt(score.innerText);
    const currentHighScore = parseInt(localStorage.getItem("snakeHighScore") || 0);

    if (currentScore > currentHighScore) {
        localStorage.setItem("snakeHighScore", currentScore);
        highScoreElement.innerText = currentScore;
    }
}

const gameLoop = () => {
  clearTimeout(loopId);

  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFood()
  drawGrid()
  moveSnake();
  drawSnake();
  checkEat()
  checkCollision()

  loopId = setTimeout(() => {
    gameLoop();
  }, speed);
};

gameLoop()


document.addEventListener("keydown", ({ key }) => {
  if (key == "ArrowRight" && lastMoveDirection != "left") {
    direction = "right";
  }
  if (key == "ArrowLeft" && lastMoveDirection != "right") {
    direction = "left";
  }
  if (key == "ArrowDown" && lastMoveDirection != "up") {
    direction = "down";
  }
  if (key == "ArrowUp" && lastMoveDirection != "down") {
    direction = "up";
  }
  
  if (key == "p" || key == "P") {
      isPaused = !isPaused;
      if (!isPaused) gameLoop();
  }
});

buttonPlay.addEventListener("click", () => {
    score.innerText = "00"; 
    menu.style.display = "none";
    canvas.style.filter = "none";

    
    resetFoodPosition();
    speed = 200
    lastMoveDirection = undefined;
    isPaused = false;


    
    if (direction === undefined) {
        direction = undefined; 
        gameLoop()
         
    }
})

const handleDirectionChange = (newDirection) => {
    if (newDirection == "up" && lastMoveDirection != "down") direction = "up";
    if (newDirection == "down" && lastMoveDirection != "up") direction = "down";
    if (newDirection == "left" && lastMoveDirection != "right") direction = "left";
    if (newDirection == "right" && lastMoveDirection != "left") direction = "right";
};

[btnUp, btnDown, btnLeft, btnRight].forEach((btn) => {
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (btn === btnUp) handleDirectionChange("up");
        if (btn === btnDown) handleDirectionChange("down");
        if (btn === btnLeft) handleDirectionChange("left");
        if (btn === btnRight) handleDirectionChange("right");
    });

    btn.addEventListener("click", () => {
        if (btn === btnUp) handleDirectionChange("up");
        if (btn === btnDown) handleDirectionChange("down");
        if (btn === btnLeft) handleDirectionChange("left");
        if (btn === btnRight) handleDirectionChange("right");
    });
});
