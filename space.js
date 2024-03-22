//board
let tilesize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tilesize * columns; // 32 x 16
let boardHeight = tilesize * rows; // 32 x 16
let context;

//music
let music = document.getElementById("gameMusic");

//ship
let shipWidth = tilesize * 2;
let shipHeight = tilesize;
let shipX = tilesize * columns/2 - tilesize;
let shipY = tilesize * rows - tilesize * 2; 


let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tilesize; //ship moving speed

//Bullets
let bulletArray = [];
let bulletVelocity = -10;

//Score
let score = 0;
let gameOver = false;

//Aliens
let alienArray = [];
let alienWidth = tilesize * 2;
let alienHeight = tilesize;
let alienX = tilesize;
let alienY = tilesize;
let alienImg;


let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //Number of aliens to defeat
let alienVelocity = 1; //Alien moving speed

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); // Used to draw on the board

    //music.play();
        
    //draw initial ship
   /* context.fillStyle = "green";
    context.fillRect(ship.x, ship.y, ship.width, ship.height);*/

    //Load Images
    shipImg = new Image();
    shipImg.src = "./SpaceShip.png";
    shipImg.onload = function(){
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
}

alienImg = new Image();
alienImg.src = "./Alien.png";
CreateAliens();

requestAnimationFrame(update);
document.addEventListener("keydown", moveShip); //Holding the key
document.addEventListener("keyup", Shoot); //Tapping the key
}
function update()
{
    requestAnimationFrame(update);

    if(gameOver)
    {
        context.fillStyle = "orange";
        context.font = "40px Arial";
        context.textAllign = "center";
        context.fillText("G A M E  O V E R", boardWidth/5, boardHeight/2);
        music.pause();
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //alien
for (let i = 0; i < alienArray.length; i++)
{
    let alien = alienArray[i];
    if (alien.alive)
    {
        alien.x += alienVelocity;

        //If alien touches the border of the screen
        if(alien.x + alien.width >= board.width || alien.x <= 0)
        {
            //Moving aliens in sync
            alienVelocity *= -1;
            alien.x += alienVelocity*2;

            //Move aliens up by one row
            for(let j = 0; j < alienArray.length; j++)
            {
                alienArray[j].y += alienHeight;
            }
        }
        context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

        if(alien.y >= ship.y)
        {
            gameOver = true;
        }
    }
}

//Drawing the bullets
for(let i = 0; i < bulletArray.length; i ++)
{
    let bullet = bulletArray[i];
    bullet.y += bulletVelocity;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    //bullet collision with aliens 
    for(let j = 0; j < alienArray.length; j++)
    {
        let alien = alienArray[j];
        if(!bullet.used && alien.alive && DetectCollision(bullet, alien))
        {
            bullet.used = true;
            alien.alive = false;
            alienCount--;
            score += 125;
        }
    }
}

//clearing useless bullets
while(bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0))
{
    bulletArray.shift(); //Removes the first element of the array
}

//next wave of aliens 
if(alienCount == 0)
{
    //increase the number of aliens in columns and rows by 1
    //The math below is specified so that the aliens don't exceed beyond the canvas
    alienColumns = Math.min(alienColumns + 1, columns/2 - 2); //cap at 16/2 -2 = 6
    alienRows = Math.min(alienRows + 1, rows - 4); //We dont want them to come to the bottom of the canvas (16 - 4 = 12)
    alienVelocity += 0.2; //increasse alien movement speed
    alienArray = [];
    bulletArray = [];
    CreateAliens();    

    
}

//Score
context.fillStyle = "white";
context.font = "16px courier";
context.fillText(score, 5, 20);

}



//The parameter e stands for event
function moveShip(e){

    if(gameOver)
    {
        return;
    }


    if(e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0)
    {
        ship.x -= shipVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width)
    {
        ship.x += shipVelocityX; //move right one tile
    }
}

function CreateAliens()
{
    for (let c = 0; c < alienColumns; c++)
    {
        for (let r = 0; r < alienRows; r++)
        {
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function Shoot(e) //e means event 
{
    if(gameOver)
    {
        return;
    }


    if (e.code == "Space")
    {
        let bullet = {
            x : ship.x + shipWidth * 15/32, //Basically places the bullet directly infront of the cannon in x position
            y : ship.y,
            width : tilesize/8,
            height : tilesize/2,
            used : false 
        }
        bulletArray.push(bullet);
    }
}

function DetectCollision(a, b)
{
    return a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x && //a's top right corner passes b's top left corner
           a.y < b.y + b.height && //a's top left corner doesn't reach b' bottom left corner
           a.y + a.height > b.y; //a's bottom left corner passes b's top left corner
}