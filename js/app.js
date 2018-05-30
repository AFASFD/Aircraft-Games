// 元素
var container = document.getElementById("game");
//获取画布
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
//设置动画帧数
window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 20);
  };
//存放所有怪兽
let monsters;
//存放所有子弹
let bullets;
//飞机
let plane;
/**
 * 整个游戏对象
 */
var GAME = {
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts
   * @return {[type]}      [description]
   */
  score: 0,
  init: function(opts) {
    this.status = "start";
    this.bindEvent();
  },
  bindEvent: function() {
    var self = this;
    var playBtn = document.querySelector(".js-play");
    // 开始游戏按钮绑定
    playBtn.onclick = function() {
      self.play();
    };
    var replayBtns = document.querySelectorAll(".js-replay");
    replayBtns.forEach(replayBtn => {
      replayBtn.onclick = function() {
        console.log("重新开始");
        self.play();
      };
    });
  },

  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * all-success 游戏通过
   * stop 游戏暂停（可选）
   */
  setStatus: function(status) {
    this.status = status;
    container.setAttribute("data-status", status);
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (status === "all-success") {
      document.querySelector(".game-all-success > .all-score").textContent =
        "最终得分:" + this.score;
      eventHub.emit("over");
    } else if (status === "failed") {
      document.querySelector(".game-failed > .game-info-text").textContent =
        "最终得分:" + this.score;
      eventHub.emit("over");
    }
  },
  play: function() {
    monsters = [];
    bullets = [];
    eventHub.events = {};
    this.score = 0;
    this.setStatus("playing");
    //监听怪兽触碰左右边缘
    this.bindEventHub();
    //产生飞机
    plane = new Plane({
      x: 320,
      y: 470,
      src: "https://i.loli.net/2018/05/30/5b0e8abd0d930.png"
    });
    //产生怪兽
    for (let i = 0; i < 7; i++) {
      let offsetX = 30 + i * 60;
      let offsetY = 30;
      let src = "https://i.loli.net/2018/05/30/5b0e8abd0c41e.png";
      let direction = "right";
      monsters.push(
        new Monster({
          x: offsetX,
          y: offsetY,
          src: src,
          die: false,
          direction: direction
        })
      );
    }
    //画一次怪兽
    for (let i = 0; i < monsters.length; i++) {
      monsters[i].draw();
    }
    //显示成绩
    this.drawScore();
    animate();
  },
  bindEventHub: function() {
    eventHub.on("left", () => {
      monsters.forEach(monster => {
        monster.direction = "left";
      });
    });
    eventHub.on("right", () => {
      monsters.forEach(monster => {
        monster.direction = "right";
      });
    });
    eventHub.on("down", () => {
      monsters.forEach(monster => {
        monster.y += 50;
      });
    });
  },
  drawScore: function() {
    context.fillStyle = "white";
    context.font = "20px serif";
    context.textBaseline = "hanging";
    context.fillText(`分数:${this.score}`, 10, 15);
  }
};
//怪兽
class Monster {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.src = opts.src;
    this.direction = opts.direction;
    this.die = opts.die;
    this.count = 0;
    this.boomed = false;
  }
  //怪兽移动
  move() {
    if (this.direction === "right") {
      if (this.x <= 620) {
        this.x += 1;
      } else {
        eventHub.emit("left");
        eventHub.emit("down");
      }
    } else {
      if (this.x >= 30) {
        this.x -= 1;
      } else {
        eventHub.emit("right");
        eventHub.emit("down");
      }
    }
  }
  //绘制怪兽
  draw() {
    //如果传值说明是爆炸
    if (this.boomed) {
      this.godie();
      let img = new Image();
      img.src = this.src;
      context.drawImage(img, this.x, this.y, 50, 50);
    } else {
      let img = new Image();
      img.src = this.src;
      context.drawImage(img, this.x, this.y, 50, 50);
    }
  }
  godie() {
    this.src = "https://i.loli.net/2018/05/30/5b0e8abcdb1cb.png";
    if (this.count < 10) {
      this.count += 1;
      return;
    }
    this.die = true;
  }
}
//飞机
class Plane {
  constructor(opts) {
    this.move = false;
    this.direction = "";
    this.x = opts.x;
    this.y = opts.y;
    this.src = opts.src;
    this.draw();
    this.bindEvent();
    this.timer = setInterval(() => {
      eventHub.on("over", () => {
        clearInterval(this.timer);
      });
      if (this.direction === "left" && this.x >= 30) {
        if (this.move) {
          this.x -= 5;
          this.draw();
        }
      } else if (this.direction === "right" && this.x <= 610) {
        if (this.move) {
          this.x += 5;
          this.draw();
        }
      }
    }, 16);
  }
  //绘制飞机
  draw() {
    let img = new Image();
    img.src = this.src;
    context.drawImage(img, this.x, this.y, 60, 100);
  }
  //监听按键
  bindEvent() {
    document.onkeydown = e => {
      // 获取被按下的键值 (兼容写法)
      var key = e.keyCode || e.which || e.charCode;
      switch (key) {
        // 点击左方向键
        case 37:
          this.move = true;
          this.direction = "left";
          break;
        // 点击右方向键
        case 39:
          this.move = true;
          this.direction = "right";
          break;
        // 点击空格
        case 32:
          this.makeBullet();
          break;
      }
    };
    document.onkeyup = () => {
      this.move = false;
    };
  }
  //发射子弹
  makeBullet() {
    bullets.push(
      new Bullet({
        x: this.x + 30,
        y: this.y,
        direction: "top"
      })
    );
  }
}
//子弹
class Bullet {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.direction = opts.direction;
    this.die = false;
  }
  //绘制子弹
  draw() {
    context.fillStyle = "white";
    context.fillRect(this.x, this.y, 1, 20);
  }
  //子弹移动
  move() {
    if (this.direction === "top") {
      this.y -= 10;
    }
  }
  boom() {
    this.die = true;
  }
}
// 游戏初始化
GAME.init();

//怪兽移动帧动画
function animate() {
  //检测子弹与怪兽碰撞
  for (let i = 0; i < monsters.length; i++) {
    for (let j = 0; j < bullets.length; j++) {
      if (
        monsters[i].y < bullets[j].y &&
        monsters[i].y + 50 > bullets[j].y &&
        monsters[i].x < bullets[j].x &&
        monsters[i].x + 50 > bullets[j].x
      ) {
        monsters[i].boomed = true;
        bullets.splice(j, 1);
        break;
      }
    }
  }
  for (let i = 0; i < monsters.length; i++) {
    if (monsters[i].y > 470) {
      GAME.setStatus("failed");
      console.log(123);
      return;
    }
  }
  //所有怪兽移动
  for (let i = 0; i < monsters.length; i++) {
    monsters[i].move();
  }
  //所有子弹移动
  for (let i = 0; i < bullets.length; i++) {
    //子弹跑出画布移除
    if (bullets[i].y <= 0) {
      bullets.splice(i, 1);
    } else {
      bullets[i].move();
    }
  }
  // 清除画布
  context.clearRect(0, 0, canvas.width, canvas.height);
  //怪兽死完游戏成功
  if (monsters.length === 0) {
    GAME.setStatus("all-success");
    return;
  }
  // 绘画所有怪兽
  for (let i = 0; i < monsters.length; i++) {
    if (monsters[i].die === true) {
      monsters.splice(i, 1);
      GAME.score += 1;
      continue;
    }
    monsters[i].draw();
  }
  // 绘画所有子弹
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].draw();
  }
  // 绘画飞机
  plane.draw();

  GAME.drawScore();
  // 使用requestAnimationFrame实现动画循环
  requestAnimationFrame(animate);
}
