window.onload = function () {

    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var context;
    var delay = 100; // 100 millisecondss
    var snakee;
    var applee;
    var widthMeasuredInBlocks = canvasWidth / blockSize;
    var heightMeasuredInBlocks = canvasHeight / blockSize;
    var score;

    init();

    function init() {
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = '20px solid black';
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "rgba(200,200,200,0.5";
        document.body.appendChild(canvas); //donne nous le document body html, avec le tag canvas
        context = canvas.getContext('2d');
        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
    }

    function refreshCanvas() {
        snakee.advance();
        if (snakee.checkImpact()) {
            gameOver();
        }
        else {
            if (snakee.isEatingApple(applee)) {
                score++;
                snakee.ateApple = true;
                do { applee.setNewPosition(); }
                while (applee.isOnSnake(snakee))
            }
            context.clearRect(0, 0, canvasWidth, canvasHeight); //effacer le canvas
            drawScore();
            snakee.draw();
            applee.draw();
            setTimeout(refreshCanvas, delay);
        }
    }

    function gameOver() {
        context.save();
        context.font = "bold 50px sans-serif";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.strokeStyle = "white";
        context.lineWidth = 5;
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        context.strokeText("Game Over !", centerX, centerY - 180);
        context.fillText("Game Over!", centerX, centerY - 180); //game over avec sa position en x et y
        context.font = "bold 20px sans-serif";
        context.strokeText("Press Enter to play again", centerX, centerY - 120);
        context.fillText("Press Enter to play again", centerX, centerY - 120);
        context.restore();
    }

    function restart() {
        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    }

    function drawScore() {
        context.save();
        context.font = "bold 100px sans-serif";
        context.fillStyle = "rgba(255,255,255)";
        context.textAlign = "center";
        context.textBaseline = "middle";
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        context.fillText(score.toString(), centerX, centerY);
        context.restore();
    }

    //création d'un bloc de taille blockSize sur blockSize
    //en commençant par en haut à gauche
    function drawBlock(context, position) {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        context.fillRect(x, y, blockSize, blockSize);
    }

    //constructeur
    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function () {
            context.save();
            context.fillStyle = '#ff0000';
            for (var i = 0; i < this.body.length; i++) {
                drawBlock(context, this.body[i]);
            }
            context.restore();
        };
        this.advance = function () {
            var nextPosition = this.body[0].slice();
            switch (this.direction) {
                case 'left':
                    nextPosition[0] -= 1; //x
                    break;
                case 'right':
                    nextPosition[0] += 1; //x
                    break;
                case 'down':
                    nextPosition[1] += 1; //y
                    break;
                case 'up':
                    nextPosition[1] -= 1; //y
                    break;
                default:
                    throw ('Invalid direction)');
            }
            this.body.unshift(nextPosition); //ajout au body
            // pas de suppression du dernier bloc si le serpent mange la pomme -> pour grandir
            if (!this.ateApple) {
                this.body.pop();    // suppression dernier élément du serpent
            }
            // sinon, s'il a mangé la pomme,s on remet à zéro la fonction ateApple
            else {
                this.ateApple = false;
            }
        };
        this.setDirection = function (newDirection) {
            var allowedDirections;
            switch (this.direction) {
                case 'left':
                case 'right':
                    allowedDirections = ["up", "down"];
                    break;
                case 'down':
                case 'up':
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw ('Invalid direction)');
            }
            if (allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;

            }
        };
        //si on touche le canvas ou si on touche le corps du serpent
        this.checkImpact = function () {
            var wallImpact = false;
            var snakeImpact = false;
            var snakeHead = this.body[0]; // tête = 1er élément du body à l'index 0
            var snakeBodyWithoutTheHead = this.body.slice(1);
            //la tête est un array de 2 valeurs : x et y
            var snakeHeadX = snakeHead[0];
            var snakeHeadY = snakeHead[1];
            // min x et y
            var minX = 0;
            var minY = 0;
            //nb de block -1
            var maxX = widthMeasuredInBlocks - 1;
            var maxY = heightMeasuredInBlocks - 1;
            // check s'il y a un pb sur la tête dans le x
            //sorti du mur de gauche oudu mur de droite :
            var isNotBetweenHorizontalWalls = snakeHeadX < minX || snakeHeadX > maxX;
            //sorti du mur du bas ou du mur du haut :
            var isNotBetweenVerticalWalls = snakeHeadY < minY || snakeHeadY > maxY;

            //si l'un des deux est vrai -> impact sur un mur
            if (isNotBetweenVerticalWalls || isNotBetweenHorizontalWalls) {
                wallImpact = true;
            }
            //vérifier si la tête touche le corps
            for (var i = 0; i < snakeBodyWithoutTheHead.length; i++) {
                if (snakeHeadX == snakeBodyWithoutTheHead[i][0] && snakeHeadY == snakeBodyWithoutTheHead[i][1]) {
                    snakeImpact = true;
                }
            }
            return snakeImpact || wallImpact;
        };
        this.isEatingApple = function (appleToEat) {
            var snakeHead = this.body[0];
            if (snakeHead[0] === appleToEat.position[0] && snakeHead[1] === appleToEat.position[1]) {
                return true;
            }
            else {
                return false;
            }
        };
    }

    function Apple(position) {
        this.position = position;
        this.draw = function () {
            context.save(); //enregistre les anciennes configurations du canvas
            context.fillStyle = "#33cc33";
            //je dessine ma pomme
            context.beginPath();
            var radius = blockSize / 2; // calculer le rayon du cercle
            //création du cercle : on commence par le centre
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            context.arc(x, y, radius, 0, Math.PI * 2), true; //dessine le cercle
            context.fill();
            context.restore(); //il remet les configurations
        };
        this.setNewPosition = function () {
            var newX = Math.round(Math.random() * (widthMeasuredInBlocks - 1));
            var newY = Math.round(Math.random() * (heightMeasuredInBlocks - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function (snakeToCheck) {
            var isOnSnake = false;
            for (var i = 0; i < snakeToCheck.body.length; i++) {
                if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        };
    }

    document.onkeydown = function handKeyDown(e) {
        //direction en fonction de la touche appuyée
        var key = e.key;
        // console.log(key);
        var newDirection;
        switch (key) {
            case "q":
                newDirection = "left";
                break;
            case "z":
                newDirection = "up";
                break;
            case "d":
                newDirection = "right";
                break;
            case "s":
                newDirection = "down";
                break;
            case "Enter": //enter key to start again
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }
}        