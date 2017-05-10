export const yup = (validation) => (value, values = {}) =>
  validation.validate(value, { context: { values } }).catch((err) => Promise.reject(
    err.errors.map((error) => error.replace(/^this /, ''))
  ));

export const plain = (validation) => (value, values = {}) => (
  new Promise((resolve, reject) => {
    const { isValid, errors } = validation(value, values);
    if (isValid) return resolve();
    return reject(errors);
  })
);
