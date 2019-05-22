export const centerRect = ({ left, top, right, bottom }) => {
  const width = right - left;
  const height = bottom - top;
  return {
    left: left + width / 2,
    right: right + width / 2,
    top: top + height / 2,
    bottom: bottom + height / 2
  };
};

export const moveRect = (
  { left, right, top, bottom },
  deltaLeft,
  deltaTop
) => ({
  left: left + deltaLeft,
  right: right + deltaLeft,
  top: top + deltaTop,
  bottom: bottom + deltaTop
});
