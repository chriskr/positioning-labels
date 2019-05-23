import { sum } from 'lodash';

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
  },
};

export const moveRect = (
  { left, right, top, bottom },
  deltaLeft,
  deltaTop
) => ({
  left: left + deltaLeft,
  right: right + deltaLeft,
  top: top + deltaTop,
  bottom: bottom + deltaTop,
});

export const addMargin = (
  { left, right, top, bottom },
  { left: leftMargin, right: rightMargin, top: topMargin, bottom: bottomMargin }
) => ({
  left: left - leftMargin,
  top: top - topMargin,
  right: right + rightMargin,
  bottom: bottom + bottomMargin,
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
    bottom: top,
  };
};

export const isOverlapping = (
  { left: left1, right: right1, top: top1, bottom: bottom1 },
  { left: left2, right: right2, top: top2, bottom: bottom2 }
) => _isOverlapping(left1, left2, right1, right2, top1, top2, bottom1, bottom2);

const getOverlap = (
  { left: left1, right: right1, top: top1, bottom: bottom1 },
  { left: left2, right: right2, top: top2, bottom: bottom2 }
) =>
  _isOverlapping(left1, left2, right1, right2, top1, top2, bottom1, bottom2)
    ? {
        left: Math.max(left1, left2),
        right: Math.min(right1, right2),
        top: Math.max(top1, top2),
        bottom: Math.min(bottom1, bottom2),
      }
    : NO_OVERLAP;

export const layoutRects = (
  rects,
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
    bottom: centerTop,
  };

  const withDistance = rects
    .map((rect, index) => ({
      centerDistance: getDistance(getCenter(rect), center),
      rect,
      rectWithMargin: addMargin(rect, minMargin),
      index,
    }))
    .sort((a, b) => a.centerDistance - b.centerDistance);

  const layedOutRects = [];

  withDistance.forEach(rect => {
    let count = 10;
    while (
      layedOutRects.some(layedOutRect =>
        isOverlapping(rect.rectWithMargin, layedOutRect.rectWithMargin)
      ) &&
      count-- > 0
    ) {
      _layoutBox(rect, layedOutRects, center);
    }
    layedOutRects.push(rect);
  });

  const minusMargin = {
    left: -minMargin.left,
    right: -minMargin.right,
    top: -minMargin.top,
    bottom: -minMargin.bottom,
  };

  return layedOutRects
    .sort((a, b) => a.index - b.index)
    .map(({ rectWithMargin, label }) => addMargin(rectWithMargin, minusMargin));
};

const _layoutBox = (rect, layedOutRects, center) => {
  layedOutRects.forEach(layedOutRect => {
    if (isOverlapping(rect.rectWithMargin, layedOutRect.rectWithMargin)) {
      const centerRect = getCenter(rect.rectWithMargin);
      const deltaLeft =
        centerRect.left > center.left
          ? // move right
            layedOutRect.rectWithMargin.right - rect.rectWithMargin.left
          : // move left
            layedOutRect.rectWithMargin.left - rect.rectWithMargin.right;
      const deltaTop =
        centerRect.top > center.top
          ? // move down
            layedOutRect.rectWithMargin.bottom - rect.rectWithMargin.top
          : // move up
            layedOutRect.rectWithMargin.top - rect.rectWithMargin.bottom;
      const isMoveLeft = Math.abs(deltaLeft) < Math.abs(deltaTop);
      rect.rectWithMargin = moveRect(
        rect.rectWithMargin,
        isMoveLeft ? deltaLeft : 0,
        isMoveLeft ? 0 : deltaTop
      );
    }
  });
};

const _isOverlapping = (
  left1,
  left2,
  right1,
  right2,
  top1,
  top2,
  bottom1,
  bottom2
) => left1 < right2 && left2 < right1 && top1 < bottom2 && top2 < bottom1;
