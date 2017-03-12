var Player = Player || {
  background: 'green',
  current: null,
  currentTime: 0,
  currentIndex: -1,
  currentLock: false,
  constant: {
    /* Controls the internal refresh rate */
    INTERNAL_INTERVAL: 100,
    /* Controls the duration of additional info */
    ADD_INFO_DURATION: 2000,
    /* Estimation of the duration of last line of lyric */
    LYRIC_LAST_LINE_DURATION: 5000
  },
  interval: -1,
  reset: () => {
    if (Player.interval != -1) {
      clearInterval(Player.interval);
    }
    Player.interval = -1;
    Player.currentTime = 0;
    Player.currentIndex = -1;
    Player.currentLock = false;
    $('#stage div').html('');
  },
  play: () => {
    if (Player.current === null) {
      return;
    }

    // Initializes lyric.
    if (Player.current.lyric[0].time > 0) {
      Player.current.lyric.unshift({
        time: 0,
        content: ''
      });
    }

    // DONE: Adds info.
    var totalInfoCount = Player.current.addInfo.length;
    var currentInfoIndex = 0;
    var rLyric = [];
    for (var i = 0, len = Player.current.length; i < len; i++) {
      rLyric.push(Player.current[i]);
      // Adds carryover info to the end of lyric.
      if (i == len - 1) {
        var currentTime = Player.current.lyric[i].time + Player.constant.LYRIC_LAST_LINE_DURATION;
        while (currentInfoIndex < totalInfoCount) {
          rLyric.push({
            content: Player.current.addInfo[currentInfoIndex],
            time: currentTime
          });
          currentInfoIndex++;
          currentTime += Player.constant.ADD_INFO_DURATION;
        }
        break loopI;
      }
      // Attemps to sneak in info for empty lyrics whose durations are long enough.
      if (Player.current.lyric[i].content) {
        continue;
      }
      var k = i + 1;
      while (!(Player.current.lyric[k].content)) { // Combines consecutive empty lyrics.
        k++;
      }
      var duration = Player.current.lyric[i + k].time - Player.current.lyric[i].time;
      var infoCount = Math.floor(duration / Player.constant.ADD_INFO_DURATION);
      for (var j = 0; j < infoCount; j++) {
        if (currentInfoIndex >= totalInfoCount) {
          break;
        }
        rLyric.push({
          content: Player.current.addInfo[currentInfoIndex],
          time: Player.current.lyric[i].time + Player.constant.ADD_INFO_DURATION * j;
        })
        currentInfoIndex++;
      }
      i = k - 1;
    }

    // Resets player.
    Player.reset();

    // TODO: Starts animation.
    Player.interval = window.setInterval(() => {
      if (Player.currentLock) {
        return;
      }
      Player.currentLock = true;
      Player.currentTime += Player.constant.INTERNAL_INTERVAL;
      var nextIndex = Player.currentIndex + 1;
      while (nextIndex < Player.current.length && Player.current[nextIndex] <= Player.currentTime) {
        nextIndex++;
      }
      

      Player.currentLock = false;
    }, Player.constant.INTERNAL_INTERVAL);
  },
  setCurrent: json => {
    Player.current = json;
  },
};

$(document).ready(() => {
  $('#btn-play').click(() => {
    var title = $('#song-title').val().trim();
    if (title !== '') {
      Player.current.addInfo.unshift();
    }
    Player.play();
  });
});