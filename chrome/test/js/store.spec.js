import expect from 'expect';

import Store from '../../src/js/store';


describe('Store', () => {
  describe('#set()', () => {
    let setItemSpy;

    beforeEach(() => {
      setItemSpy = expect.spyOn(localStorage, 'setItem');
    });

    it('should set the serialized value in the localStorage', () => {
      Store.set('key', 'value');
      expect(setItemSpy).toHaveBeenCalledWith('key', '"value"');
      setItemSpy.reset();

      Store.set('key2', [1, 2]);
      expect(setItemSpy).toHaveBeenCalledWith('key2', '[1,2]');
      setItemSpy.reset();

      Store.set('key', { key: 'val' });
      expect(setItemSpy).toHaveBeenCalledWith('key', '{"key":"val"}');
      setItemSpy.reset();
    });
  });

  describe('#get()', () => {
    let storageSpy;

    beforeEach(() => {
      storageSpy = expect.spyOn(localStorage, 'getItem');
    });

    it('should return deserialized values from the local storage', () => {
      storageSpy.andReturn('"string"');
      expect(Store.get('key')).toEqual('string');

      storageSpy.andReturn('{"key":"val"}');
      expect(Store.get('key')).toEqual({ key: 'val' });

      storageSpy.andReturn('[1,{"key":"val"}]');
      expect(Store.get('key')).toEqual([1, { key: 'val' }]);
    });
  });

  describe('#canSet()', () => {
    it('should return true if no error is thrown during set', () => {
      const removeItemSpy = expect.spyOn(localStorage, 'removeItem');
      expect(Store.canSet(12)).toBe(true);
      expect(removeItemSpy).toHaveBeenCalled();
    });

    it('should return false if an error is thrown during set', () => {
      expect.spyOn(Store, 'set').andThrow(new Error());
      expect(Store.canSet(12)).toBe(false);
    });
  });

  describe('#_serialize()', () => {
    it('should serialize objects', () => {
      const obj = {
        keyA: 'KeyA',
        keyB: { keyBA: 'KeyBA', keyBB: [1, 2, true] },
      };
      const serializedObj = '{"keyA":"KeyA","keyB":{"keyBA":"KeyBA","keyBB":[1,2,true]}}';
      expect(Store._serialize(obj)).toEqual(serializedObj);
    });

    it('should convert non objects to string', () => {
      expect(Store._serialize('value')).toEqual('"value"');
      expect(Store._serialize(13)).toEqual('13');
      expect(Store._serialize(true)).toEqual('true');
    });
  });

  describe('#_deserialize', () => {
    it('should deserialize serialized objects', () => {
      const obj = {
        keyA: 'KeyA',
        keyB: { keyBA: 'KeyBA', keyBB: [1, 2, true] },
      };
      const serializedObj = '{"keyA":"KeyA","keyB":{"keyBA":"KeyBA","keyBB":[1,2,true]}}';
      expect(Store._deserialize(serializedObj)).toEqual(obj);
    });

    it('should return undefined when the input is not a string', () => {
      expect(Store._deserialize(12)).toBe(undefined);
      expect(Store._deserialize(true)).toBe(undefined);
    });

    it('should return the input when input is a string and not an serialized object', () => {
      const invalidObj = '{"key":"value",}';
      expect(Store._deserialize('value')).toEqual('value');
      expect(Store._deserialize(invalidObj)).toEqual(invalidObj);
    });
  });
});
