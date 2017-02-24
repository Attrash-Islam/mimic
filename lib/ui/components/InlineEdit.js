import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  font-size: 13px;
  line-height: 20px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EditInput = styled.input`
  display: block;
  width: 100%;
  background-color: inherit;
  font-size: inherit;
  line-height: inherit;
  outline: none;
  border: none;
  padding: 0;
`;

class InlineEdit extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillReceiveProps({ editing }) {
    if (editing && this.nameInput) setTimeout(() => this.nameInput.base.focus());
  }

  handleKeyDown = (e) => {
    const { onCancel, onSave } = this.props;

    switch (e.key) {
      case 'Enter':
        onSave(this.nameInput.base.value);
        onCancel();
        break;
      case 'Escape':
        onCancel();
        break;
    }
  };

  render() {
    const { defaultValue, onCancel, editing, children } = this.props;
    return (
      <Container>
        { editing &&
          <EditInput type="text"
                     ref={ input => this.nameInput = input }
                     defaultValue={ defaultValue }
                     onBlur={ onCancel }
                     onKeyDown={ this.handleKeyDown } />
        }
        { !editing && children }
      </Container>
    );
  }

}

export default InlineEdit;
