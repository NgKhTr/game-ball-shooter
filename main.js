console.log(gsap);
let canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    scoreEle = document.getElementById('scoreEle'),
    modalEle = document.querySelector('.modal');
const Width = innerWidth,
    Height = innerHeight;
canvas.width = Width;
canvas.height = Height;

function startGame() {
    console.log('start');
    modalEle.style.display = 'none';
    init();
    animate();
    spawmEnemies();
}

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc( this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}


class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc( this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}


class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc( this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}


function spawmEnemies() {
    setInterval(() => {
        let radius = Math.random() * (30 - 5) + 5;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? - radius: canvas.width + radius;
            y = Math.random() * canvas.height;
        }
        else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? - radius: canvas.height + radius;
        }
        let color = `hsl( ${Math.random() * 360}, 50%, 50%)`;
        let angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);
        let velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity));
        
    }, 2000);
}

let friction = 0.98; // s??? c??ng nh??? th?? c??ng ch???m v?? s??? d???ng ph??p nh??n
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc( this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

let player = new Player( canvas.width / 2, canvas.height / 2, 10, 'WHITE'),
    enemies = [],
    particles = [],
    projectileS = [],
    score = 0,
    animationId;

function init() {
    enemies = [],
    particles = [],
    projectileS = [],
    score = 0;
    scoreEle.innerHTML = score;
}
function animate() {
    animationId = requestAnimationFrame(animate);
    console.log(projectileS);
    ctx.fillStyle = 'rgba( 0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    projectileS.forEach((projectile, index) => {
        projectile.update();

        // x??a ?????n ra ngo??i bi??n
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
                // x??a c??ch n??y v???n ??o ???n !!!
                projectileS.splice(index, 1);
        }
    })

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            setTimeout(() => {
                particles.splice(index, 1);
            }, 0)
        }
        else {
            particle.update();
        }
    })

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        //end game

        let dist = Math.hypot( enemy.x - player.x, enemy.y - player.y)
            if (dist < enemy.radius + player.radius) {
                console.log('end');
                cancelAnimationFrame(animationId);
                let bigScore = document.getElementById('bigScore');
                bigScore.innerHTML = score;
                modalEle.style.display = 'flex';
            }

        
        projectileS.forEach((projectile, projectileIndex) => {
            let dist = Math.hypot( enemy.x - projectile.x, enemy.y - projectile.y)
            //touch
            if (dist < enemy.radius + projectile.radius) {
                if (enemy.radius - 10 > 5) {
                    // t??ng ??i???m khi b??o m??n m???c ti??u
                    score += 100;
                    scoreEle.innerHTML = score;
                    // cho n?? m?????t
                    gsap.to(enemy, {radius: enemy.radius - 10});
                    //enemy.radius -= 10;
                    setTimeout(() => {
                        projectileS.splice(projectileIndex, 1);
                    }, 0);
                }
                else {
                    // t??ng ??i???m khi ti??u di???t m???c ti??u
                    score += 150;
                    scoreEle.innerHTML = score;                
                    // hi???u ???ng flash ?????i t?????ng k??? ti???p khi ?????i t?????ng hi???n t???i b??? x??a ?????t ng???t
                    // v?? ??ang duy???t qua t??? ph???n t??? m???ng m?? l???i t??c ?????ng v?? ch??nh ph???n t??? c???a m???ng
                    // ph???n t??? hi???n t???i b??? x??a th?? ph???n t??? k??? ti???p s??? ch???y v??o index b??? b??? tr???ng c???a ph???n t??? hi???n t???i n??n b??? forEach b??? qua
                    // --> Ko ???????c v??? ra d???n ?????n flash
                    // setTimeout s??? mang c??c d??ng code trong call back v??o frame k??? ti???p l?? khi ???? k???t th??c forEach
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        projectileS.splice(projectileIndex, 1);
                    }, 0);
                }
                // t???o hi???u ???ng va ch???m
                for (let i = 0; i < enemy.radius; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 3, enemy.color, 
                        {
                            x: (Math.random() - 0.5) * Math.random() * 6 ,
                            y: (Math.random() - 0.5) * Math.random() * 6
                        }))
                }
            }
        })
    })
}
addEventListener('click', (e) => {
    let angle = Math.atan2(e.offsetY - canvas.height/2, e.offsetX - canvas.width/2);
    let velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectileS.push(new Projectile(canvas.width/2, canvas.height / 2, 5, 'WHITE', velocity));
})
