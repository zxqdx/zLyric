var Player = Player || {
  current: null,
  setCurrent: function(json) {
    this.current = json;
  },
  background: 'green'
};

Player.constant = {
  /* Controls the internal refresh rate */
  INTERNAL_INTERVAL: 100
};