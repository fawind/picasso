import 'babel-polyfill';
import { jsdom } from 'jsdom';
import { LocalStorage } from './testUtil';


global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = global.document.defaultView;
global.navigator = global.window.navigator;
global.localStorage = global.window.localStorage = new LocalStorage();
