import React from 'react';
import styled from 'styled-components';
import MethodLabel from 'ui/components/styled/MethodLabel';
import InlineEdit from 'ui/components/InlineEdit';
import API from 'api';
import UIState, { UIStateListener } from 'ui/UIState';
import Icon from 'ui/components/Icon';
import { getHighlightedText } from 'ui/utils/string';
import { DragSource } from 'react-dnd';

const mockSource = {
  beginDrag(props) {
    return {
      id: props.mock.id
    };
  }
};

function collect(connect) {
  return {
    connectDragSource: connect.dragSource()
  };
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px;
  background-color: ${(props) => props.isSelected ? '#cbddf5' : 'white'};

  &:hover {
    cursor: ${(props) => props.isSelected ? 'default' : 'pointer'};
    background-color: #cbddf5;
  }
`;

const DisplayName = URL = styled.div``;

const Status = styled.div`
  width: 28px;
  color: ${(props) => props.children > 400 ? '#ba3a00' : 'black'};
  margin-left: 5px;
`;

export class Mock extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editing: false
    }
  }

  toggleMock = (event) => {
    event.stopPropagation();
    API.toggleMock(this.props.mock.id);
  };

  editMockName = (e) => {
    e.preventDefault();
    this.setState({ editing: true });
  };

  leaveEditMode = () => {
    this.setState({ editing: false });
  };

  saveMockName = (name) => {
    const { mock } = this.props;
    const newMock = {...mock, name };

    API.updateMock(mock.id, newMock);
  };

  _renderDisplayName() {
    const { mock, searchTerm } = this.props;

    return mock.name ? mock.name : (
      <URL dangerouslySetInnerHTML={{
        __html: getHighlightedText(mock.url, searchTerm)
      }}/>);
  }

  render() {
    const { mock, onClick, onContextMenu } = this.props;
    const { editing } = this.state;

    return this.props.connectDragSource(
      <div>
        <Container onClick={ onClick }
                   onContextMenu={ onContextMenu }
                   isSelected={ UIState.selectedMocks.includes(mock) }
                   onDoubleClick={ this.editMockName }>

          <Icon src={ mock.isActive ? 'mocked' : 'unmocked' }
                style={{ marginRight: 5 }}
                onClick={ this.toggleMock }/>

          <MethodLabel>{ mock.method }</MethodLabel>

          <InlineEdit onSave={ this.saveMockName }
                      onCancel={ this.leaveEditMode }
                      editing={ editing }
                      defaultValue={ mock.name || mock.url }>
            <DisplayName>
              { this._renderDisplayName() }
            </DisplayName>
          </InlineEdit>

          <Status>{ mock.response.status }</Status>
        </Container>
      </div>
    )
  }
}

export default DragSource('mock', mockSource, collect)(UIStateListener(Mock));
