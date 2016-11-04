export default class Clock {

  constructor(clockElement, refreshInterval = 60000) {
    this.clockElement = clockElement;
    this.refreshInterval = refreshInterval;
  }

  run() {
    this.updateClock();
    setTimeout(this.run.bind(this), this.refreshInterval);
  }

  updateClock() {
    this.clockElement.html(Clock._getTime());
  }

  static _formatTime(time) {
    return time < 10 ? `0${time}` : time;
  }

  static _getTime() {
    const date = new Date();
    return [
      Clock._formatTime(date.getHours()),
      Clock._formatTime(date.getMinutes()),
    ].join(':');
  }

}
