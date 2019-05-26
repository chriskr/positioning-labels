import React, { Component } from 'react';

const nop = () => null;

class Input extends React.Component {
  onInput = ({ target: { value } }) => this.setState({ value });
  state = {
    value: '',
  };

  submit = () => this.props.onChange && this.props.onChange(this.state.value);

  onKeyDown = event => {
    switch (event.key) {
      case 'Enter':
        this.submit();
        break;
    }
  };

  ref = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  render() {
    const { onChange, placeholder } = this.props;

    return (
      <input
        type="text"
        value={this.state.value}
        placeholder={placeholder}
        onInput={this.onInput}
        onChange={nop}
        onKeyDown={this.onKeyDown}
      />
    );
  }
}

export default Input;
