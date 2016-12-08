import expect from 'expect';

import Store from '../../src/js/store';


describe('Store', () => {
  describe('#set()', () => {
    let storageSpy;

    beforeEach(() => {
      storageSpy = expect.spyOn(localStorage, 'setItem');
    });

    it('should set the serialized value in the localStorage', () => {
      Store.set('key', 'value');
      expect(storageSpy).toHaveBeenCalledWith('key', '"value"');
      storageSpy.reset();

      Store.set('key2', [1, 2]);
      expect(storageSpy).toHaveBeenCalledWith('key2', '[1,2]');
      storageSpy.reset();

      Store.set('key', { key: 'val' });
      expect(storageSpy).toHaveBeenCalledWith('key', '{"key":"val"}');
      storageSpy.reset();
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
