import { ClockElement } from './domElements';

export default class Clock {

  static constitute() { return [ClockElement]; }

  constructor(clockElement) {
    this.clockElement = clockElement;
    this.refreshInterval = 60000;
  }

  run() {
    this._updateClock();
    setTimeout(this.run.bind(this), this.refreshInterval);
  }

  _updateClock() {
    this.clockElement.textContent = this._getTime();
  }

  _formatTime(time) {
    return time < 10 ? `0${time}` : time;
  }

  _getTime() {
    const date = new Date();
    return [
      this._formatTime(date.getHours()),
      this._formatTime(date.getMinutes()),
    ].join(':');
  }
}
