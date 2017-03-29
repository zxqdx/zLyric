var Player = Player || {
  background: 'green',
  current: null,
  animation: {
    time: 0,
    index: {},
    lock: {},
    intervalId: -1
  },
  constant: {
    /* Controls the internal refresh rate */
    INTERNAL_INTERVAL: 10,
    /* Controls the duration of additional info */
    ADD_INFO_DURATION: 2000,
    /* Estimation of the duration of last line of lyric */
    LYRIC_LAST_LINE_DURATION: 5000,
    /* Supported lyric types */
    SUPPORTED_LYRIC_TYPES: ['rLyric', 'tLyric'],
  },
  calcFadeInDuration(lyricDuration) {
    var result = 0;
    if (lyricDuration < 1000) {
      result = lyricDuration * 0.1 + 10;
    } else if (lyricDuration < 3000) {
      result = 300;
    } else if (lyricDuration < 10000) {
      result = lyricDuration * 0.1;
    } else {
      result = 1000;
    }
    return Math.floor(result);
  },
  calcFadeOutDuration(lyricDuration) {
    return Math.ceil(this.calcFadeInDuration(lyricDuration) / 2);
  },
  init() {
    this.index = {};
    this.constant.SUPPORTED_LYRIC_TYPES.forEach(TYPE => {
      this.animation.index[TYPE] = -1;
      this.animation.lock[TYPE] = false;
      $('#stage div#stage-' + TYPE.toLowerCase()).html('&nbsp;');
    }, this);
    this.animation.time = 0;
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
    if (!this.current.hasOwnProperty("lyric")) {
      this.current.lyric = [{
        time: 100000,
        content: ''
      }];
    }
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
      if (this.current.lyric[i].content) {
        rLyric.push(this.current.lyric[i]);
      }
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
      var k = i;
      while ((k < len - 1) && !(this.current.lyric[k].content)) { // Combines consecutive empty lyrics.
        k++;
      }
      var duration = this.current.lyric[k].time - this.current.lyric[i].time;
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
      if (gapTime < this.current.lyric[k].time) {
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

    // DONE: Starts animation.
    this.animation.intervalId = window.setInterval(() => {
      this.animation.time += this.constant.INTERNAL_INTERVAL;
      
      this.constant.SUPPORTED_LYRIC_TYPES.forEach(TYPE => {
        if (!this.current.hasOwnProperty(TYPE)) {
          return;
        }
        if (this.animation.lock[TYPE]) {
          return;
        }
        let currentStage = '#stage div#stage-' + TYPE.toLowerCase();
        
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
        
        this.animation.lock[TYPE] = true;
        let currentLyric = current[nextIndex].content ? current[nextIndex].content : "&nbsp;";
        let currentDuration = (nextIndex === current.length - 1) ?
            this.constant.LYRIC_LAST_LINE_DURATION :
            current[nextIndex + 1].time - current[nextIndex].time;
        let currentFadeIn = this.calcFadeInDuration(currentDuration);
        let currentFadeOut = this.calcFadeOutDuration(currentDuration);
        
        $(currentStage).clearQueue();
        $(currentStage).css('opacity', 0);
        $(currentStage).html(currentLyric);
        $(currentStage).animate({opacity: 1}, currentFadeIn);
        window.setTimeout(() => {
          $(currentStage).animate({opacity: 0}, currentFadeOut, () => {
            this.animation.index[TYPE] = nextIndex;
            this.animation.lock[TYPE] = false;
          });
        }, currentDuration - currentFadeOut);
      }, this);
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