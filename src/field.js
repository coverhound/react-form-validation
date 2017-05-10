export default class Field {
  constructor({ name, validation }) {
    this.name = name;
    this.validation = validation;
    this.needsValidation = false;
    this.canValidate = false;
  }

  blur() {
    this.needsValidation = true;
    this.canValidate = true;
  }

  change() {
    this.needsValidation = true;
  }

  validate(value, values) {
    const { shouldValidate } = this;
    this.needsValidation = false;
    if (!shouldValidate) return Promise.resolve(this.error);

    return this.validation(value, values).then(() => {
      this.error = undefined;
    }).catch((errors) => {
      this.error = errors;
    }).then(() => this.error);
  }

  get shouldValidate() {
    return this.needsValidation && this.canValidate;
  }

  get error() {
    return { [this.name]: this.errorMessages };
  }

  set error(value) {
    this.errorMessages = value;
  }
}
