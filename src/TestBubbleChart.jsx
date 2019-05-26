import React from 'react';
import { range, throttle } from 'lodash';
import styled, { css } from 'styled-components';
import { names as labels } from './testLabels';
import { layoutRects, moveRect } from './util';
import Input from './Input';

const WIDTH = 800;
const HEIGHT = 500;
const MAX_RADIUS = 50;
const MIN_RADIUS = 10;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 24;

const DEFAULT_BUBBLE_COUNT = 50;

const getFontSize = radius => {
  return (
    MIN_FONT_SIZE +
    ((radius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) *
      (MAX_FONT_SIZE - MIN_FONT_SIZE)
  );
};

const Circle = styled.circle`
  stroke-width: 1;
  stroke: hsla(0, 0%, 0%, 0.15);
  cursor: pointer;
`;

const View = styled.div`
  padding: 100px;
`;

const Container = styled.div`
  position: relative;
  & circle,
  & .label {
    transition: opacity 0.25s;
  }
  ${props => (
    console.log(props.isHover),
    props.isHover &&
      css`
        & circle {
          opacity: 0.1;
        }
        & .label {
          opacity: 0;
        }
      `
  )}
`;

const Label = styled.div`
  white-space: nowrap;
  position: absolute;
  top: 0;
  left: 0;
  line-height: 1;
  font-size: 10px;
  font-weight: 300;
  pointer-events: none;
  text-align: center;
`;

const Svg = styled.svg`
  border: 1px solid hsla(0, 0%, 0%, 0.1);
`;

const Controls = styled.div`
  margin-top: 100px;
`;

const InputLabel = styled.label`
  margin: 0 20px;
`;

const getRandomLabel = () =>
  range((1 + Math.random() * 3) | 0)
    .map(() => labels[(Math.random() * labels.length) | 0])
    .join(' ');

const buildExampleData = (n = 50) => {
  return range(n).map(() => {
    const radius = (MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS)) | 0;
    const left = (MAX_RADIUS + Math.random() * (WIDTH - 2 * MAX_RADIUS)) | 0;
    const top = (MAX_RADIUS + Math.random() * (HEIGHT - 2 * MAX_RADIUS)) | 0;
    const color = `hsla(${(Math.random() * 360) | 0}, 100%, 50%, .3)`;
    const label = {
      label: getRandomLabel(),
      left: 0,
      top: 0,
    };
    return { radius, left, top, color, label };
  });
};

class TestBubbleChart extends React.Component {
  setExampleData = () => {
    const data = buildExampleData(this.state.bubbleCount).sort(
      (a, b) => b.radius - a.radius
    );
    this.setState({ data, mode: 0, hoverIndex: -1 });
  };
  state = {
    data: buildExampleData(DEFAULT_BUBBLE_COUNT).sort(
      (a, b) => b.radius - a.radius
    ),
    mode: 0,
    bubbleCount: DEFAULT_BUBBLE_COUNT,
    hoverIndex: -1,
  };
  svgRef = React.createRef();
  containerRef = React.createRef();
  hoverCircle = null;
  _event = null;
  onMouseOver = event => {
    this._event = event.nativeEvent;
    this.hanleMouseOver();
  };
  hanleMouseOver = throttle(() => {
    if (!this._event) return;
    const circle = this._event.target.closest('circle');
    if (circle !== this.hoverCircle) {
      this.hoverCircle = circle;
      const hoverIndex = circle
        ? Array.from(circle.parentElement.children).indexOf(circle)
        : -1;
      this.setState({ hoverIndex });
    }
    this._event = null;
  }, 64);
  render() {
    const style = {
      width: `$WIDTH}px`,
      height: `${HEIGHT}px`,
    };
    return (
      <View>
        <Container
          ref={this.containerRef}
          isHover={this.state.hoverIndex > -1}
          onMouseOver={this.onMouseOver}
        >
          <Svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={style}
            ref={this.svgRef}
          >
            {this.state.data.map(
              ({ radius: r, left: cx, top: cy, color }, index) => {
                const style =
                  index === this.state.hoverIndex ? { opacity: 1 } : {};
                return (
                  <Circle r={r} cx={cx} cy={cy} fill={color} style={style} />
                );
              }
            )}
          </Svg>
          {this.state.data.map(
            ({ label: { label, top, left }, radius }, index) => {
              const style = {
                left: `${left}px`,
                top: `${top}px`,
                fontSize: `${getFontSize(radius)}px`,
              };
              if (index === this.state.hoverIndex) {
                style.opacity = 1;
              }
              return (
                <Label style={style} className="label">
                  {label}
                </Label>
              );
            }
          )}
        </Container>
        <Controls>
          <button onClick={this.setExampleData}>Set example data</button>
          <InputLabel>bubble count</InputLabel>
          <Input
            value={this.state.bubbleCount}
            onChange={bubbleCount =>
              this.setState({
                bubbleCount,
                data: buildExampleData(bubbleCount).sort(
                  (a, b) => b.radius - a.radius
                ),
                mode: 0,
                hoverIndex: -1,
              })
            }
          />
        </Controls>
      </View>
    );
  }

  positionLabels() {
    if (!this.containerRef.current) {
      return;
    }
    if (this.state.mode === 0) {
      const currentData = this.state.data;
      const containerRect = this.containerRef.current.getBoundingClientRect();
      const { left: offsetLeft, top: offsetTop } = containerRect;
      const labelRects = Array.from(
        this.containerRef.current.querySelectorAll('.label')
      ).map((ele, index) => {
        const rect = ele.getBoundingClientRect();
        const { left, top } = currentData[index];
        const deltaLeft = left - offsetLeft - (rect.right - rect.left) / 2;
        const deltaTop = top - offsetTop - (rect.bottom - rect.top) / 2;
        return moveRect(rect, deltaLeft, deltaTop);
      });
      const bubbles = this.state.data.map(({ radius, left, top }) => ({
        radius,
        left,
        top,
      }));
      const borderWidth = 20;
      const constraints = [
        {
          left: -borderWidth,
          right: 0,
          top: -borderWidth,
          bottom: HEIGHT + 2 * borderWidth,
        },
        {
          left: WIDTH,
          right: WIDTH + borderWidth,
          top: -borderWidth,
          bottom: HEIGHT + 2 * borderWidth,
        },
        { left: 0, right: WIDTH, top: -borderWidth, bottom: 0 },
        { left: 0, right: WIDTH, top: HEIGHT, bottom: HEIGHT + borderWidth },
      ];
      const layedOutLabels = layoutRects(labelRects, bubbles, constraints);
      const data = this.state.data.map(
        ({ label: { label }, ...rest }, index) => {
          const rect = layedOutLabels[index];
          return {
            ...rest,
            label: {
              label,
              ...rect,
            },
          };
        }
      );
      this.setState({ data, mode: 1, hoverIndex: -1 });
    }
  }

  componentDidMount() {
    this.positionLabels();
  }

  componentDidUpdate() {
    this.positionLabels();
  }
}

export default TestBubbleChart;
