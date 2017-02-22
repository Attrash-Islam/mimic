import React from 'react';
import styled from 'styled-components';
import mockedIcon from 'ui/assets/images/mocked@2x.png';
import unmockedIcon from 'ui/assets/images/unmocked@2x.png';
import { getHighlightedText } from 'ui/utils/string';
import { DragSource } from 'react-dnd';

const mockSource = {
  beginDrag(props) {
    return {
      id: props.id
    };
  }
};

function collect(connect) {
  return {
    connectDragSource: connect.dragSource()
  };
}

const mockContainerStyles = `
  padding: 4px;
  background-color: ${(props) => props.isSelected ? '#cbddf5' : 'white'};
  
  &:hover {
    cursor: ${(props) => props.isSelected ? 'default' : 'pointer'};
    background-color: #cbddf5;
  }
`;

const containerStyles = `
  display: flex;
  align-items: center;
`;

const MockContainer = styled.div`
  ${containerStyles}
  ${mockContainerStyles}
`;

const Container = styled.div`
  ${containerStyles}
  padding: 0 4px;
`;

const Method = styled.div`
  font-size: 11px;
  margin-right: 5px;
`;

const URL = styled.div`
  font-size: 12px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Icon = styled.img`
  height: 16px;
  user-select: none;
  margin-right: 5px;
`;

const MockRename = styled.input`
  border-width: 0 0 1px 0;
  display: block;
  width: 100%;
  padding: 4px 0;
  font-size: 12px;
  outline: none;
`;

const highlightedTextStyles = 'background-color: #f7f2d7; padding: 2px 0;';

export class Mock extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editing: false
    }
  }

  editMockName = () => {
    this.setState({ editing: true }, () => this.nameInput.base.focus());
  }

  undoRename = () => {
    this.setState({ editing: false });
  }

  handleKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        this.saveMockName(this.nameInput.base.value);
        break;
      case 'Escape':
        this.undoRename();
        break;
    }
  }

  saveMockName = (name) => {
    console.log(name);
  }

  _renderMock() {
    const { onClick, isSelected, active, method, url, searchTerm, toggleMock, name } = this.props;

    return (
      <MockContainer
        onClick={ onClick }
        isSelected={ isSelected }
        onDoubleClick={ this.editMockName }
        onContextMenu={ () => console.log('CONTEXT MENU') }>
        <Icon
          src={ active ? mockedIcon : unmockedIcon }
          alt={ active ? 'Unmock' : 'Mock' }
          onClick={ toggleMock }/>
        <Method>{ name || method }</Method>
        <URL dangerouslySetInnerHTML={{
          __html: getHighlightedText(url, searchTerm, highlightedTextStyles)
        }}/>
      </MockContainer>
    );
  }

  _renderMockRename() {
    const { name, url } = this.props;

    return (
      <Container>
        <MockRename type="text"
                    ref={ input => this.nameInput = input }
                    defaultValue={ name || url }
                    onBlur={ this.undoRename }
                    onKeyDown={ this.handleKeyDown } />
      </Container>
    );
  }

  render() {
    return this.props.connectDragSource(
      <div>
        {
          this.state.editing ? this._renderMockRename() : this._renderMock()
        }
      </div>
    );
  }
}

export default DragSource('mock', mockSource, collect)(Mock);
