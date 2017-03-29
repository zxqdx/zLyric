var Parser = Parser || {
  parsers: {}
};

Parser.parsers.netease = {
  name: "default",
  version: "0.0.1",
  parse: function (raw) {
    var rawJson = JSON.parse(raw);
    var json = {
      addInfo: []
    };
    if (rawJson.hasOwnProperty("addInfo")) {
      json.addInfo = rawJson.addInfo;
    }
    return json;
  }
};