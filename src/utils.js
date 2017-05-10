export function noop() {}
export const valuesFalsy = (errors) => !Object.values(errors).find(Boolean);
export const deepEquals = (obj1, obj2) => (
  JSON.stringify(obj1) === JSON.stringify(obj2)
);
export const curryEvent = (fn, target) => function curriedFunction(state) {
  fn({ target, ...state });
};
