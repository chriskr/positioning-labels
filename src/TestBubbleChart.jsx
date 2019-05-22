import React from 'react';
import { range } from 'lodash';
import styled from 'styled-components';
import { names as labels } from './testLabels';
import { centerRect, moveRect } from './util';
import Input from './Input';

const WIDTH = 800;
const HEIGHT = 500;
const MAX_RADIUS = 50;
const MIN_RADIUS = 10;

const DEFAULT_BUBBLE_COUNT = 50;

const Circle = styled.circle`
  stroke-width: 1;
  stroke: hsla(0, 0%, 0%, 0.15);
`;

const View = styled.div`
  padding: 100px;
`;

const Container = styled.div`
  position: relative;
`;

const Label = styled.div`
  white-space: nowrap;
  position: absolute;
  top: 0;
  left: 0;
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
    const color = `hsla(${(Math.random() * 360) | 0}, 100%, 50%, .4)`;
    const label = {
      label: getRandomLabel(),
      left: 0,
      top: 0
    };
    return { radius, left, top, color, label };
  });
};

class TestBubbleChart extends React.Component {
  setExampleData = () => {
    const data = buildExampleData(this.state.bubbleCount);
    this.setState({ data, mode: 0 });
  };
  state = {
    data: buildExampleData(DEFAULT_BUBBLE_COUNT),
    mode: 0,
    bubbleCount: DEFAULT_BUBBLE_COUNT
  };
  svgRef = React.createRef();
  containerRef = React.createRef();
  render() {
    const style = {
      width: `$WIDTH}px`,
      height: `${HEIGHT}px`
    };
    console.log(this.state.data);
    return (
      <View>
        <Container ref={this.containerRef}>
          <Svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={style}
            ref={this.svgRef}
          >
            {this.state.data.map(({ radius: r, left: cx, top: cy, color }) => (
              <Circle r={r} cx={cx} cy={cy} fill={color} />
            ))}
          </Svg>
          {this.state.data.map(({ label: { label, top, left } }) => {
            const style = {
              left: `${left}px`,
              top: `${top}px`
            };
            return (
              <Label style={style} className="label">
                {label}
              </Label>
            );
          })}
        </Container>
        <Controls>
          <button onClick={this.setExampleData}>Set example data</button>
          <InputLabel>bubble count</InputLabel>
          <Input
            value={this.state.bubbleCount}
            onChange={bubbleCount =>
              this.setState({
                bubbleCount,
                data: buildExampleData(bubbleCount),
                mode: 0
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
      const data = this.state.data.map(
        ({ label: { label }, ...rest }, index) => {
          const rect = labelRects[index];
          return {
            ...rest,
            label: {
              label,
              ...rect
            }
          };
        }
      );
      console.log('>>', data);
      this.setState({ data, mode: 1 });
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
