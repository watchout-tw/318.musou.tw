var canvas;
var options = {
  maxWidth: 500,
  maxDataValue: 5,
  offset: 0.2,
};

var data = {
  "行政院": {"兩岸關係定位": 0, "公投": 0, "資訊揭露": 1, "國會事前參與": 1, "國會事後修正": 0, color: 'blue'},
  "李應元": {"兩岸關係定位": 0, "公投": 0, "資訊揭露": 2, "國會事前參與": 2, "國會事後修正": 0, color: 'springgreen'},
  "尤美女": {"兩岸關係定位": 3, "公投": 1, "資訊揭露": 3, "國會事前參與": 3, "國會事後修正": 1, color: 'green'},
  "時代力量": {"兩岸關係定位": 4, "公投": 1, "資訊揭露": 3, "國會事前參與": 3, "國會事後修正": 1, color: 'gold'},
  "李俊俋": {"兩岸關係定位": 5, "公投": 5, "資訊揭露": 5, "國會事前參與": 5, "國會事後修正": 1, color: 'darkgreen'},
  "蘇巧慧": {"兩岸關係定位": 5, "公投": 5, "資訊揭露": 4, "國會事前參與": 5, "國會事後修正": 1, color: 'teal'},
};
var axes = ["兩岸關係定位", "公投", "資訊揭露", "國會事前參與", "國會事後修正"];
var flags = {};
for(var i = 0; i < axes.length; i++) {
  var arr = [];
  for(var j = 0; j <= options.maxDataValue; j++)
    arr[j] = 0;
  flags[axes[i]] = arr;
}
var step = {x: 50, y: 50};

function setup() {
  canvas = createCanvas(options.maxWidth, (axes.length + 1)*step.y);
  canvas.parent('p5CanvasContainer');
  for(var i = 0; i < axes.length; i++) {
    var y = (i + 1)*step.y;
    strokeWeight(3);
    line(0, y, width, y);
    textAlign(RIGHT);
    textSize(14);
    text(axes[i], width, y-14/2);
  }
  var d = 10;
  for(var k in data) {
    var last = {x: -1, y: -1};
    var color = data[k].color;
    for(var i = 0; i < axes.length; i++) {
      var axis = axes[i];
      var v = data[k][axis];
      var current = {x: (v + 1 + flags[axis][v]*options.offset)*step.x, y: (i + 1)*step.y};
      fill(color);
      noStroke();
      ellipse(current.x, current.y, d, d);
      flags[axis][v]++;
      if(last.x != -1 && last.y != -1) {
        noFill();
        stroke(color);
        strokeWeight(3);
        line(last.x, last.y, current.x, current.y);
      }
      last.x = current.x;
      last.y = current.y;
    }
  }
  noLoop();
}

function draw() {
}
