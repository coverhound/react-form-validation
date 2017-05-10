import Field from 'react-form-validation/field';
import Fieldset from 'react-form-validation/fieldset';

describe('Fieldset', () => {
  let subject;
  const name = 'password';
  const adapter = (fn) => fn;
  const validation = () => Promise.resolve();
  const validations = { [name]: validation, general: validation };
  beforeEach(() => {
    subject = new Fieldset({ validations, adapter });
  });

  describe('new', () => {
    test('creates fields from the validations object', () => {
      expect(subject.fields[0]).toBeInstanceOf(Field);
    });

    test('wraps validations with the adapter', () => {
      expect(subject.fields[0].validation).toEqual(adapter(validation));
    });
  });

  describe('triggers', () => {
    let mockFn;
    let fields;

    beforeEach(() => {
      mockFn = jest.fn();
      fields = subject.fields;
    });

    describe('.triggerSubmit()', () => {
      test('blurs all fields', () => {
        fields.forEach((field) => { field.blur = mockFn; });
        subject.triggerSubmit();
        expect(mockFn.mock.calls.length).toBe(fields.length);
      });
    });

    describe('.triggerChange()', () => {
      test('changes the field', () => {
        fields.forEach((field) => { field.change = mockFn; });
        subject.triggerChange(name);
        expect(mockFn.mock.calls.length).toBe(1);
      });
    });

    describe('.triggerBlur()', () => {
      test('blurs the field', () => {
        fields.forEach((field) => { field.blur = mockFn; });
        subject.triggerBlur(name);
        expect(mockFn.mock.calls.length).toBe(1);
      });
    });
  });


  describe('.needsValidation', () => {
    test('checks if any fields require validation', () => {
      expect(subject.needsValidation).toBe(false);
      subject.triggerSubmit();
      expect(subject.needsValidation).toBe(true);
    });
  });

  describe('.validate()', () => {
    const state = { values: {} };
    const errorMessages = ['nope'];
    const expectedErrors = { [name]: errorMessages, general: errorMessages };
    beforeEach(() => {
      subject.fields.forEach((field) => {
        field.validation = () => Promise.reject(errorMessages);
      });
    });

    test('returns a merged error object', () => {
      subject.triggerSubmit();
      return subject.validate(state).then((errors) => {
        expect(errors).toEqual(expectedErrors);
      });
    });
  });
});
