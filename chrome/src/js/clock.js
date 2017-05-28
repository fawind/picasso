import { HoursElement, MinutesElement, SeparatorElement } from './domElements';

export default class Clock {

  static constitute() {
    return [HoursElement, MinutesElement, SeparatorElement];
  }

  constructor(hoursElement, minutesElement, separatorElement, refreshInterval = 60000) {
    this.hoursElement = hoursElement;
    this.minutesElement = minutesElement;
    this.separatorElement = separatorElement;
    this.refreshInterval = refreshInterval;
  }

  run() {
    this._updateClock();
    setTimeout(this.run.bind(this), this.refreshInterval);
  }

  _updateClock() {
    const date = new Date();
    this.hoursElement.textContent = this._formatTime(date.getHours());
    this.minutesElement.textContent = this._formatTime(date.getMinutes());
    this.separatorElement.textContent = ':';
  }

  _formatTime(time) {
    return time < 10 ? `0${time}` : time;
  }
}
