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
  bubbles,
  constraints,
  minMargin = { left: 2, top: 1, right: 2, bottom: 1 }
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
      bubble: bubbles[index],
    }))
    .sort((a, b) => b.bubble.radius - a.bubble.radius);

  let layedOutRects = [...constraints.map(rect => ({ rectWithMargin: rect }))];

  withDistance.forEach(rect => {
    const candRects = [
      [center, {}],
      [null, { moveRight: false, moveDown: false }],
      [null, { moveRight: true, moveDown: false }],
      [null, { moveRight: false, moveDown: true }],
      [null, { moveRight: true, moveDown: true }],
    ].map(([center, strategy]) =>
      _getCandidate(rect, layedOutRects, center, strategy)
    );
    const startPoint = {
      left: rect.bubble.left,
      right: rect.bubble.left,
      top: rect.bubble.top,
      bottom: rect.bubble.top,
    };
    const bestCandidate = _getBestCandidate(startPoint, candRects);
    rect.rectWithMargin = bestCandidate;
    layedOutRects.push(rect);
  });

  layedOutRects = layedOutRects.slice(constraints.length);

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

const _getCandidate = (rect, layedOutRects, center, strategy) => {
  let count = 16;
  let candRect = { ...rect.rectWithMargin };
  while (
    layedOutRects.some(layedOutRect =>
      isOverlapping(candRect, layedOutRect.rectWithMargin)
    ) &&
    count-- > 0
  ) {
    candRect = _layoutBox({ rect: candRect, layedOutRects, center, strategy });
  }
  return candRect;
};

const _getBestCandidate = (startPoint, candidates) => {
  const withDistance = candidates
    .map(candidate => ({
      candidate,
      pysicalDistance: getPysicalDistance(startPoint, candidate),
      distance: getDistance(startPoint, getCenter(candidate)),
    }))
    .sort((a, b) =>
      a.pysicalDistance === 0 && b.pysicalDistance === 0
        ? a.distance - b.distance
        : a.pysicalDistance - b.pysicalDistance
    );
  const [{ candidate }] = withDistance;
  return candidate;
};

const getPysicalDistance = (center, rect) => {
  const { left: centerLeft, top: centerTop } = center;
  const {
    left: rectLeft,
    top: rectTop,
    right: rectRight,
    bottom: rectBottom,
  } = rect;

  const horizontalDistance =
    rectLeft <= centerLeft && rectRight >= centerLeft
      ? 0
      : rectLeft > centerLeft
      ? rectLeft - centerLeft
      : centerLeft - rectRight;
  const verticalDistance =
    rectTop <= centerTop && rectBottom >= centerTop
      ? 0
      : rectTop > centerTop
      ? rectTop - centerTop
      : centerTop - rectBottom;

  return (horizontalDistance ** 2 + verticalDistance ** 2) ** 0.5;
};

const _layoutBox = ({ rect, layedOutRects, center = null, strategy = {} }) => {
  layedOutRects.forEach(layedOutRect => {
    if (isOverlapping(rect, layedOutRect.rectWithMargin)) {
      const centerRect = getCenter(rect);
      const moveRight = center
        ? centerRect.left > center.left
        : strategy.moveRight;
      const deltaLeft = moveRight
        ? // move right
          layedOutRect.rectWithMargin.right - rect.left
        : // move left
          layedOutRect.rectWithMargin.left - rect.right;
      const moveDown = center ? centerRect.top > center.top : strategy.moveDown;
      const deltaTop = moveDown
        ? // move down
          layedOutRect.rectWithMargin.bottom - rect.top
        : // move up
          layedOutRect.rectWithMargin.top - rect.bottom;

      rect = _getBestCandidate(centerRect, [
        moveRect(rect, deltaLeft, 0),
        moveRect(rect, 0, deltaTop),
      ]);
    }
  });
  return rect;
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
