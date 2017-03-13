var Player = Player || {
  background: 'green',
  current: null,
  animation: {
    time: 0,
    index: {},
    lock: false,
    intervalId: -1
  },
  constant: {
    /* Controls the internal refresh rate */
    INTERNAL_INTERVAL: 100,
    /* Controls the duration of additional info */
    ADD_INFO_DURATION: 2000,
    /* Estimation of the duration of last line of lyric */
    LYRIC_LAST_LINE_DURATION: 5000,
    /* Supported lyric types */
    SUPPORTED_LYRIC_TYPES: ['rLyric', 'tLyric'],
  },
  init() {
    this.index = {};
    this.constant.SUPPORTED_LYRIC_TYPES.forEach(TYPE => {
      this.animation.index[TYPE] = -1;
      $('#stage div#stage-' + TYPE.toLowerCase()).html('');
    }, this);
    this.animation.time = 0;
    this.animation.lock = false;
  },
  reset() {
    this.stop();
    this.init();
  },
  stop() {
    if (this.animation.intervalId != -1) {
      clearInterval(this.animation.intervalId);
      this.animation.intervalId = -1;
    }
  },
  play() {
    if (this.current === null) {
      return;
    }

    // Initializes lyric.
    if (this.current.lyric[0].time > 0) {
      this.current.lyric.unshift({
        time: 0,
        content: ''
      });
    }

    // DONE: Adds info.
    var totalInfoCount = this.current.addInfo.length;
    var currentInfoIndex = 0;
    var rLyric = [];
    for (var i = 0, len = this.current.lyric.length; i < len; i++) {
      rLyric.push(this.current.lyric[i]);
      // Adds carryover info to the end of lyric.
      if (i == len - 1) {
        var currentTime = this.current.lyric[i].time + this.constant.LYRIC_LAST_LINE_DURATION;
        while (currentInfoIndex < totalInfoCount) {
          rLyric.push({
            content: this.current.addInfo[currentInfoIndex],
            time: currentTime
          });
          currentInfoIndex++;
          currentTime += this.constant.ADD_INFO_DURATION;
        }
        break;
      }
      // Attemps to sneak in info for empty lyrics whose durations are long enough.
      if (this.current.lyric[i].content) {
        continue;
      }
      var k = i + 1;
      while (!(this.current.lyric[k].content)) { // Combines consecutive empty lyrics.
        k++;
      }
      var duration = this.current.lyric[i + k].time - this.current.lyric[i].time;
      var infoCount = Math.floor(duration / this.constant.ADD_INFO_DURATION);
      for (var j = 0; j < infoCount; j++) {
        if (currentInfoIndex >= totalInfoCount) {
          break;
        }
        rLyric.push({
          content: this.current.addInfo[currentInfoIndex],
          time: this.current.lyric[i].time + this.constant.ADD_INFO_DURATION * j
        });
        currentInfoIndex++;
      }
      var gapTime = this.current.lyric[i].time + this.constant.ADD_INFO_DURATION * j;
      if (gapTime < this.current.lyric[i + k].time) {
        rLyric.push({
          content: '',
          time: gapTime
        });
      }
      i = k - 1;
    }
    if (rLyric[0].time === 0 && !(rLyric[0].content)) {
      rLyric.splice(0, 1);
    }
    this.current.rLyric = rLyric;

    // Resets this.
    this.reset();

    // TODO: Starts animation.
    this.animation.intervalId = window.setInterval(() => {
      this.animation.time += this.constant.INTERNAL_INTERVAL;
      if (this.animation.lock) {
        return;
      }
      this.animation.lock = true;
      
      this.constant.SUPPORTED_LYRIC_TYPES.forEach(TYPE => {
        let currentIndex = this.animation.index[TYPE];
        let nextIndex = currentIndex + 1;
        let current = this.current[TYPE];
        while (nextIndex < current.length && current[nextIndex].time <= this.animation.time) {
          nextIndex++;
        }
        nextIndex--;
        if (currentIndex === nextIndex) {
          // No new lyric. Exit.
          return;
        }
        
        let currentLyric = current[nextIndex].content;
        let currentDuration = (nextIndex === current.length - 1) ?
            this.constant.LYRIC_LAST_LINE_DURATION :
            current[nextIndex + 1].time - current[nextIndex].time;
        
        $('#stage div#stage-' + TYPE.toLowerCase()).html(currentLyric + "|" + currentDuration);
      }, this);

      this.animation.lock = false;
    }, this.constant.INTERNAL_INTERVAL);
  },
  setCurrent(json) {
    this.current = json;
  },
};

$(document).ready(() => {
  $('#btn-play').click(() => {
    var title = $('#song-title').val().trim();
    if (title !== '') {
      Player.current.addInfo.unshift("歌名：" + title);
    }
    Player.play();
  });
});