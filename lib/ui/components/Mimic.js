import React from 'react';
import EVENTS from 'api/constants/events';
import LatestRequestNotifications from 'ui/components/LatestRequestNotifications';
import QuickEdit from 'ui/components/QuickEdit';
import FullEdit from 'ui/components/FullEdit';
import RequestLog from 'ui/components/RequestLog';
import styled from 'styled-components';
import MimicProvider from 'ui/components/MimicProvider';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

const Container = styled.div`
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 999999999999;
  background-color: white;
  font-size: 14px;
  font-family: Arial, sans-serif;
`;


class Mimic extends React.Component {

  state = {
    uiState: 'closed',
    selectedRequestId: null,
    showRequestLogOnQuickEdit: false,
    latestRequest: null,
    editorSize: null,
  };

  onEdit = (requestId, options = {}) => {
    this.setState({
      uiState: 'quickEdit',
      selectedRequestId: requestId,
      showRequestLogOnQuickEdit: Boolean(options.openRequestLog)
    });
  };

  selectRequest = (requestId) => {
    this.setState({ selectedRequestId: requestId });
    this.setLatestRequest({ requestId });
  };

  onSave = () => {
    this.setState({ uiState: 'closed' });
    this.setLatestRequest({ requestId: this.state.selectedRequestId });
  };

  switchToFullEdit = () => {
    this.setState({ uiState: 'mocks' });
  };

  switchToLog = () => {
    this.setState({ uiState: 'requests' })
  };

  closeFullEditor = () => {
    this.setState({ uiState: 'closed' });
  };

  setEditorSize = (editorSize) => {
    this.setState({ editorSize });
  };

  setLatestRequest = ({ requestId }) => {
    this.setState({ latestRequest: this.props.API.getCapturedRequest(requestId) });
  };

  componentDidMount() {
    this.props.API.on(EVENTS.REQUEST_CAPTURED, this.setLatestRequest);
    this.props.API.on(EVENTS.RESPONSE_RECEIVED, this.setLatestRequest);
  }

  componentWillUnmount() {
    this.props.API.off(EVENTS.REQUEST_CAPTURED, this.setLatestRequest);
    this.props.API.off(EVENTS.RESPONSE_RECEIVED, this.setLatestRequest);
  }

  componentDidUpdate() {
    if (this.state.showRequestLogOnQuickEdit) {
      this.setState({ showRequestLogOnQuickEdit: false });
    }
  }

  render() {
    return (
      <MimicProvider API={ this.props.API }>
        <Container>
          {
            this.state.uiState === 'closed' &&
            <LatestRequestNotifications
              onEdit={ this.onEdit }
              showLogs={ this.switchToLog }
              showMocks={ this.switchToFullEdit }/>
          }

          {
            this.state.uiState === 'quickEdit' &&
            <QuickEdit
              selectedRequestId={ this.state.selectedRequestId }
              latestRequest={ this.state.latestRequest }
              onSelectRequest={ this.selectRequest }
              autoShowRequestLog={ this.state.showRequestLogOnQuickEdit }
              switchToFullEdit={ this.switchToFullEdit }
              onSave={ this.onSave }
              showLogs={ this.switchToLog }
              showMocks={ this.switchToFullEdit }/>
          }

          {
            this.state.uiState === 'mocks' &&
            <FullEdit
              closeFullEditor={ this.closeFullEditor }
              setEditorSize={ this.setEditorSize }
              editorSize={ this.state.editorSize }
              showLogs={ this.switchToLog }
              showMocks={ this.switchToFullEdit }
              activeTab={ this.state.uiState }/>
          }

          {
            this.state.uiState === 'requests' &&
            <RequestLog
              showLogs={ this.switchToLog }
              showMocks={ this.switchToFullEdit }
              closeFullEditor={ this.closeFullEditor }
              setEditorSize={ this.setEditorSize }
              editorSize={ this.state.editorSize }
              activeTab={ this.state.uiState }/>
          }
        </Container>
      </MimicProvider>
    );
  }
}

export default DragDropContext(HTML5Backend)(Mimic);