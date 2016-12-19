import expect from 'expect';

import { LocalStorage } from '../testUtil';
import Store from '../../src/js/store';


describe('Store', () => {
  const localStorageMock = new LocalStorage();
  const store = new Store(localStorageMock);

  beforeEach(() => {
    localStorage.clear();
  });

  describe('#set()', () => {
    let setItemSpy;

    beforeEach(() => {
      setItemSpy = expect.spyOn(localStorageMock, 'setItem');
    });

    it('should set the serialized value in the localStorage', () => {
      store.set('key', 'value');
      expect(setItemSpy).toHaveBeenCalledWith('key', '"value"');
      setItemSpy.reset();

      store.set('key2', [1, 2]);
      expect(setItemSpy).toHaveBeenCalledWith('key2', '[1,2]');
      setItemSpy.reset();

      store.set('key', { key: 'val' });
      expect(setItemSpy).toHaveBeenCalledWith('key', '{"key":"val"}');
      setItemSpy.reset();
    });
  });

  describe('#get()', () => {
    let storageSpy;

    beforeEach(() => {
      storageSpy = expect.spyOn(localStorageMock, 'getItem');
    });

    it('should return deserialized values from the local storage', () => {
      storageSpy.andReturn('"string"');
      expect(store.get('key')).toEqual('string');

      storageSpy.andReturn('{"key":"val"}');
      expect(store.get('key')).toEqual({ key: 'val' });

      storageSpy.andReturn('[1,{"key":"val"}]');
      expect(store.get('key')).toEqual([1, { key: 'val' }]);
    });
  });

  describe('#canSet()', () => {
    it('should return true if no error is thrown during set', () => {
      const removeItemSpy = expect.spyOn(localStorageMock, 'removeItem');
      expect(store.canSet(12)).toBe(true);
      expect(removeItemSpy).toHaveBeenCalled();
    });

    it('should return false if an error is thrown during set', () => {
      expect.spyOn(store, 'set').andThrow(new Error());
      expect(store.canSet(12)).toBe(false);
    });
  });

  describe('#_serialize()', () => {
    it('should serialize objects', () => {
      const obj = {
        keyA: 'KeyA',
        keyB: { keyBA: 'KeyBA', keyBB: [1, 2, true] },
      };
      const serializedObj = '{"keyA":"KeyA","keyB":{"keyBA":"KeyBA","keyBB":[1,2,true]}}';
      expect(store._serialize(obj)).toEqual(serializedObj);
    });

    it('should convert non objects to string', () => {
      expect(store._serialize('value')).toEqual('"value"');
      expect(store._serialize(13)).toEqual('13');
      expect(store._serialize(true)).toEqual('true');
    });
  });

  describe('#_deserialize', () => {
    it('should deserialize serialized objects', () => {
      const obj = {
        keyA: 'KeyA',
        keyB: { keyBA: 'KeyBA', keyBB: [1, 2, true] },
      };
      const serializedObj = '{"keyA":"KeyA","keyB":{"keyBA":"KeyBA","keyBB":[1,2,true]}}';
      expect(store._deserialize(serializedObj)).toEqual(obj);
    });

    it('should return undefined when the input is not a string', () => {
      expect(store._deserialize(12)).toBe(undefined);
      expect(store._deserialize(true)).toBe(undefined);
    });

    it('should return the input when input is a string and not an serialized object', () => {
      const invalidObj = '{"key":"value",}';
      expect(store._deserialize('value')).toEqual('value');
      expect(store._deserialize(invalidObj)).toEqual(invalidObj);
    });
  });
});
