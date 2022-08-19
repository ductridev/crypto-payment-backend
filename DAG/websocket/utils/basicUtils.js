function heartbeatWSS() {
  this.isAlive = true;
}

function heartbeatWS() {
  // console.log(this);
  clearTimeout(this.pingTimeout);

  // Use `WebSocket#terminate()`, which immediately destroys the connection,
  // instead of `WebSocket#close()`, which waits for the close timer.
  // Delay should be equal to the interval at which your server
  // sends out pings plus a conservative assumption of the latency.
  this.pingTimeout = setTimeout(() => {
    console.log(this);
    this.terminate();
  }, 30000 + 2000);
}


module.exports = {
  heartbeatWSS,
  heartbeatWS
};