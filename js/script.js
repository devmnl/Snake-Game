const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth - 2; // Deixe um pouco de margem
    canvas.height = window.innerWidth > 600 ? 600 : window.innerWidth - 2;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const score = document.querySelector(".score--value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")

const btnUp = document.getElementById("btn-up");
const btnDown = document.getElementById("btn-down");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");

let speed = 200; 
const speedIncrement = 10; 
const scoreIncrementThreshold = 50; 




const audioEat = new Audio('../assets/audio.mp3')
const audioGameOver = new Audio('../assets/gameover.wav')

const size = 30;

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

let direction, loopId;


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
};

const drawGrid = () => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#191919";

  for (let i = 30; i < canvas.width; i += 30) {
    ctx.beginPath()
    ctx.lineTo(i, 0)
    ctx.lineTo(i, 600)
    ctx.stroke()

    ctx.beginPath()
    ctx.lineTo(0, i)
    ctx.lineTo(600, i)
    ctx.stroke()
  }
}

const checkEat = () => {
    const head = snake[snake.length - 1]

    if (head.x == food.x && head.y == food.y) {
        incrementScore()
        snake.push(head)
        audioEat.play()
        
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
       audioGameOver.play()
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

}

const gameLoop = () => {
  clearInterval(loopId);

  ctx.clearRect(0, 0, 600, 600);
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
  if (key == "ArrowRight" && direction != "left") {
    direction = "right";
  }
  if (key == "ArrowLeft" && direction != "right") {
    direction = "left";
  }
  if (key == "ArrowDown" && direction != "up") {
    direction = "down";
  }
  if (key == "ArrowUp" && direction != "down") {
    direction = "up";
  }
});

buttonPlay.addEventListener("click", () => {
    score.innerText = "00"; 
    menu.style.display = "none";
    canvas.style.filter = "none";

    
    resetFoodPosition();
    speed = 200


    
    if (direction === undefined) {
        direction = undefined; 
        gameLoop()
         
    }
})

btnUp.addEventListener("touchstart", () => {
    if (direction !== "down") direction = "up";
});

btnDown.addEventListener("touchstart", () => {
    if (direction !== "up") direction = "down";
});

btnLeft.addEventListener("touchstart", () => {
    if (direction !== "right") direction = "left";
});

btnRight.addEventListener("touchstart", () => {
    if (direction !== "left") direction = "right";
});
