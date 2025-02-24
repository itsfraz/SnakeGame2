const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const difficulty = document.getElementById('difficulty');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const finalScore = document.getElementById('finalScore');

        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        let snake = [{ x: 10, y: 10 }];
        let food = { x: 15, y: 15 };
        let dx = 0;
        let dy = 0;
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let gameSpeed = parseInt(difficulty.value);
        let gameLoop;

        // Sound effects
        const eatSound = new Audio('https://www.soundjay.com/buttons/sounds/button-09a.mp3');
        const gameOverSound = new Audio('https://www.soundjay.com/buttons/beep-02.mp3');

        highScoreElement.textContent = highScore;

        function drawGame() {
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = score;
                eatSound.play();
                generateFood();
                if (gameSpeed > 20) gameSpeed -= 1;
            } else {
                snake.pop();
            }

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw snake with gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#4203a9');
            gradient.addColorStop(1, '#6a0dad');
            ctx.fillStyle = gradient;
            snake.forEach((segment, index) => {
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize/2, segment.y * gridSize + gridSize/2, 
                    gridSize/2 - 1, 0, Math.PI * 2);
                ctx.fill();
                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#4203a9';
            });
            ctx.shadowBlur = 0;

            // Draw food with animation
            ctx.fillStyle = '#90bafc';
            ctx.beginPath();
            const foodSize = gridSize/2 - 1 + Math.sin(Date.now() / 200) * 2;
            ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, 
                foodSize, 0, Math.PI * 2);
            ctx.fill();

            if (checkCollision(head)) {
                gameOver();
                return;
            }

            gameLoop = setTimeout(drawGame, gameSpeed);
        }

        function generateFood() {
            food.x = Math.floor(Math.random() * tileCount);
            food.y = Math.floor(Math.random() * tileCount);
            snake.forEach(segment => {
                if (segment.x === food.x && segment.y === food.y) {
                    generateFood();
                }
            });
        }

        function checkCollision(head) {
            return (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
                snake.slice(1).some(segment => head.x === segment.x && head.y === segment.y));
        }

        function gameOver() {
            clearTimeout(gameLoop);
            gameLoop = null;
            gameOverSound.play();
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('snakeHighScore', highScore);
                highScoreElement.textContent = highScore;
            }
            finalScore.textContent = score;
            gameOverScreen.style.display = 'flex';
        }

        function startGame() {
            if (!gameLoop) {
                clearTimeout(gameLoop);
                gameSpeed = parseInt(difficulty.value);
                dx = 1;
                dy = 0;
                drawGame();
            }
        }

        function resetGame() {
            clearTimeout(gameLoop);
            gameLoop = null;
            snake = [{ x: 10, y: 10 }];
            food = { x: 15, y: 15 };
            dx = 0;
            dy = 0;
            score = 0;
            gameSpeed = parseInt(difficulty.value);
            scoreElement.textContent = score;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawInitialState();
        }

        function drawInitialState() {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#4203a9');
            gradient.addColorStop(1, '#6a0dad');
            ctx.fillStyle = gradient;
            snake.forEach(segment => {
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize/2, segment.y * gridSize + gridSize/2, 
                    gridSize/2 - 1, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.fillStyle = '#90bafc';
            ctx.beginPath();
            ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, 
                gridSize/2 - 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            move(e.key.replace('Arrow', '').toLowerCase());
        });

        // Touch controls handler
        function move(direction) {
            switch(direction) {
                case 'up': if (dy === 0) { dx = 0; dy = -1; } break;
                case 'down': if (dy === 0) { dx = 0; dy = 1; } break;
                case 'left': if (dx === 0) { dx = -1; dy = 0; } break;
                case 'right': if (dx === 0) { dx = 1; dy = 0; } break;
            }
        }

        difficulty.addEventListener('change', () => {
            if (!gameLoop) gameSpeed = parseInt(difficulty.value);
        });