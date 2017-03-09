Parser = Parser || {
  parsers: {}
};

Parser.parsers.netease = {
  name: "netease",
  version: "0.0.1",
  parse: function (raw) {
    var rawJson = JSON.parse(raw);
    var json = {
      addInfo: [
        "翻译：" + rawJson.transUser.nickname,
        "歌词：" + rawJson.lyricUser.nickname
      ]
    };
    if (rawJson.hasOwnProperty("lrc")) {
      rawJson.lrc.lyric.split("\n").map(line => {
        var re = /^\[(\d+):(\d+)\.(\d+)\](.*)$/g;
        var match = re.exec(line);
        if (match !== null) {
          var minute = parseInt(match[0]);
          var second = parseInt(match[1]);
          var millis = parseInt(match[2]);
          var decimal = match[2].length;
          var content = match[3];
          return {
            time: minute * 600 + second
          };
        }
      });
    }
  }
};