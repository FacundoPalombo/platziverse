module.exports = function extend(obj, values) {
  const clone = Object.assign({}, obj);
  return Object.assign(clone, values);
};
