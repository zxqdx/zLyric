var Parser = Parser || {
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
    json.lyric = !(rawJson.hasOwnProperty("lrc")) ? false :
      rawJson.lrc.lyric.split("\n").map(line => {
        var re = /^\[(\d+):(\d+)\.(\d+)\](.*)$/g;
        var match = re.exec(line);
        if (match !== null) {
          var minute = parseInt(match[1]);
          var second = parseInt(match[2]);
          var millis = parseInt(match[3]);
          var decimal = match[3].length;
          var content = match[4].trim();
          return {
            time: minute * 60 * 1000 + second * 1000 +
                  millis * 1000 / Math.pow(10, decimal),
            content: content
          };
        }
        return null;
      }).filter(line => {
        return line !== null;
      });
    json.tlyric = !(rawJson.hasOwnProperty("tlyric")) ? false :
      rawJson.tlyric.lyric.split("\n").map(line => {
        var re = /^\[(\d+):(\d+)\.(\d+)\](.*)$/g;
        var match = re.exec(line);
        if (match !== null) {
          var minute = parseInt(match[1]);
          var second = parseInt(match[2]);
          var millis = parseInt(match[3]);
          var decimal = match[3].length;
          var content = match[4].trim();
          return {
            time: minute * 60 * 1000 + second * 1000 +
                  millis * 1000 / Math.pow(10, decimal),
            content: content
          };
        }
        return null;
      }).filter(line => {
        return line !== null;
      });
    return json;
  }
};