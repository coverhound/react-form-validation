import Field from 'react-form-validation/field';

describe('Field', () => {
  let subject;
  let validation = () => Promise.resolve();
  let name = 'password';
  let errors = ['something went wrong'];
  beforeEach(() => subject = new Field({ name, validation }));

  describe('new', () => {
    test('sets its attributes', () => {
      expect(subject.name).toEqual(name);
      expect(subject.validation).toEqual(validation);
      expect(subject.needsValidation).toBe(false);
      expect(subject.canValidate).toBe(false);
    });
  });

  describe('.blur()', () => {
    test('enables validation', () => {
      expect(subject.shouldValidate).toBe(false);
      subject.blur();
      expect(subject.shouldValidate).toBe(true);
    });
  });

  describe('.change()', () => {
    test('flags the field for validation', () => {
      expect(subject.needsValidation).toBe(false);
      subject.change();
      expect(subject.needsValidation).toBe(true);
    });
  });

  describe('.validate()', () => {
    describe('when never blurred', () => {
      test('it doesn\'t run validation', () => {
        subject.validation = jest.fn();
        return subject.validate().then(() => (
          expect(subject.validation.mock.calls.length).toBe(0)
        ));
      });
    });

    describe('when blurred', () => {
      beforeEach(() => subject.blur());

      test('marks the field as validated', () => {
        expect(subject.needsValidation).toBe(true);
        return subject.validate('foo').then(() => (
          expect(subject.needsValidation).toBe(false)
        ));
      });

      describe('when validation passes', () => {
        test('resolves with undefined', () => {
          return subject.validate('foo').then((rval) => (
            expect(rval).toEqual({ [name]: undefined })
          ));
        });
      });

      describe('when validation fails', () => {
        beforeEach(() => subject.validation = () => Promise.reject(errors))

        test('resolves with errors', () => {
          return subject.validate('foo').then((rval) => (
            expect(rval).toEqual({ [name]: errors })
          ));
        });
      });
    });
  });
});
