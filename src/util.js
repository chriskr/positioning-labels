import { sum } from 'lodash';
console.log('sum', sum([1, 2]));

const NO_OVERLAP = {
  get left() {
    return 0;
  },
  get right() {
    return 0;
  },
  get top() {
    return 0;
  },
  get bottom() {
    return 0;
  }
};

/*
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

export const translate = ({ left, top, right, bottom }, deltaX, deltaY) => ({
  left: left + deltaX,
  right: right + deltaX,
  top: top + deltaY,
  bottom: bottom + deltaY
});
*/

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

export const addMargin = (
  { left, right, top, bottom },
  { left: leftMargin, right: rightMargin, top: topMargin, bottom: bottomMargin }
) => ({
  left: left - leftMargin,
  top: top - topMargin,
  right: right + rightMargin,
  bottom: bottom + bottomMargin
});

export const getDistance = (
  { left: left1, top: top1 },
  { left: left2, top: top2 }
) => ((left1 - left2) ** 2 + (top1 - top2) ** 2) ** 0.5;

export const getCenter = ({ left, right, top, bottom }) => {
  left += (right - left) / 2;
  top += (bottom - top) / 2;
  return {
    left,
    top,
    right: left,
    bottom: top
  };
};

export const isOvelapping = (
  { left: left1, right: right1, top: top1, bottom: bottom1 },
  { left: left2, right: right2, top: top2, bottom: bottom2 }
) => _isOvelapping(left1, left2, right1, right2, top1, top2, bottom1, bottom2);

const getOverlap = (
  { left: left1, right: right1, top: top1, bottom: bottom1 },
  { left: left2, right: right2, top: top2, bottom: bottom2 }
) =>
  _isOvelapping(left1, left2, right1, right2, top1, top2, bottom1, bottom2)
    ? {
        left: Math.max(left1, left2),
        right: Math.min(right1, right2),
        top: Math.max(top1, top2),
        bottom: Math.min(bottom1, bottom2)
      }
    : NO_OVERLAP;

export const deOverlapRects = (
  rects,
  labels,
  minMargin = { left: 5, top: 5, right: 5, bottom: 5 }
) => {
  const centerLeft =
    sum(rects.map(({ left, right }) => left + (right - left) / 2)) /
    rects.length;
  const centerTop =
    sum(rects.map(({ top, bottom }) => top + (bottom - top) / 2)) /
    rects.length;
  const center = {
    left: centerLeft,
    right: centerLeft,
    top: centerTop,
    bottom: centerTop
  };
  const withDistance = rects
    .map((rect, index) => ({
      centerDistance: getDistance(getCenter(rect), center),
      rect,
      rectWithMargin: addMargin(rect, minMargin),
      index,
      label: labels[index]
    }))
    .sort((a, b) => a.centerDistance - b.centerDistance);

  withDistance.forEach(
    (dict, index) => (dict.label = `${dict.label} - ${index}`)
  );

  const deOverlappedRects = [];

  withDistance.forEach(candidateRectDict => {
    let count = 10;
    while (
      deOverlappedRects.some(deoverlappedRectDict =>
        isOvelapping(
          candidateRectDict.rectWithMargin,
          deoverlappedRectDict.rectWithMargin
        )
      ) &&
      count-- > 0
    ) {
      console.log(count);
      deOverlappedRects.forEach(deoverlappedRectDict => {
        const overlap = getOverlap(
          candidateRectDict.rectWithMargin,
          deoverlappedRectDict.rectWithMargin
        );
        if (overlap !== NO_OVERLAP) {
          const candCenter = getCenter(candidateRectDict.rectWithMargin);
          const deltaLeft =
            candCenter.left > center.left
              ? // move right
                deoverlappedRectDict.rectWithMargin.right -
                candidateRectDict.rectWithMargin.left
              : // move left
                deoverlappedRectDict.rectWithMargin.left -
                candidateRectDict.rectWithMargin.right;
          const deltaTop =
            candCenter.top > center.top
              ? // move down
                deoverlappedRectDict.rectWithMargin.bottom -
                candidateRectDict.rectWithMargin.top
              : // move up
                deoverlappedRectDict.rectWithMargin.top -
                candidateRectDict.rectWithMargin.bottom;
          const isMoveLeft = Math.abs(deltaLeft) < Math.abs(deltaTop);
          const fixedRect = moveRect(
            candidateRectDict.rectWithMargin,
            isMoveLeft ? deltaLeft : 0,
            isMoveLeft ? 0 : deltaTop
          );
          const test = getOverlap(
            fixedRect,
            deoverlappedRectDict.rectWithMargin
          );
          if (test !== NO_OVERLAP) {
            debugger;
          }
          candidateRectDict.rectWithMargin = fixedRect;
        }
      });
    }
    deOverlappedRects.push(candidateRectDict);
  });
  const minusMargin = {
    left: -minMargin.left,
    right: -minMargin.right,
    top: -minMargin.top,
    bottom: -minMargin.bottom
  };
  const ret = deOverlappedRects
    .sort((a, b) => a.index - b.index)
    .map(({ rectWithMargin, label }) => [
      addMargin(rectWithMargin, minusMargin),
      label
    ]);

  const r1 = [];
  const r2 = [];
  ret.forEach(([rect, label]) => {
    r1.push(rect);
    r2.push(label);
  });
  return [r1, r2];

  console.log('>>', centerLeft, centerTop, withDistance);
};

const _isOvelapping = (
  left1,
  left2,
  right1,
  right2,
  top1,
  top2,
  bottom1,
  bottom2
) => left1 < right2 && left2 < right1 && top1 < bottom2 && top2 < bottom1;
