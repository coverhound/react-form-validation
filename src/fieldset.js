import Field from './field';

export default class Fieldset {
  constructor({ validations, adapter }) {
    this.fieldsIndex = {};
    Object.keys(validations).forEach((name) => {
      this.fieldsIndex[name] = new Field({
        name,
        validation: adapter(validations[name])
      });
    });
  }

  get fields() {
    return Object.values(this.fieldsIndex);
  }

  triggerSubmit() {
    Object.values(this.fields).forEach((field) => field.blur());
  }

  triggerChange(name) {
    if (this.fieldsIndex[name]) this.fieldsIndex[name].change();
  }

  triggerBlur(name) {
    if (this.fieldsIndex[name]) this.fieldsIndex[name].blur();
  }

  get needsValidation() {
    return this.fields.some((field) => field.needsValidation);
  }

  validate(state) {
    const validationPromises = Object.values(this.fields).map((field) => (
      field.validate(state.values[field.name], state.values)
    ));

    return Promise.all(validationPromises).then((validationErrors) => (
      validationErrors.reduce((obj, errorSet = {}) => (
        { ...obj, ...errorSet }
      ), {})
    ));
  }
}
