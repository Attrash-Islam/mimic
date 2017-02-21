import React from 'react';
import styled from 'styled-components';
import get from 'lodash/get';
import values from 'lodash/values';
import HttpStatus from 'http-status-codes';
import { getHeaderPreset } from 'api/utils/headers';
import stopwatchIcon from 'ui/assets/images/stopwatch@2x.png';
import unmockedIcon from 'ui/assets/images/unmocked@2x.png';
import mockedIcon from 'ui/assets/images/mocked@2x.png';
import Select from 'ui/components/common/Select';
import RequestOption from 'ui/components/common/RequestOption';
import RequestOptionValue from 'ui/components/common/RequestOptionValue';
import MimicControls from 'ui/components/MimicControls';
import withAPI from 'ui/components/withAPI';

const PASTE_CHARACTER_LIMIT = 115;

const ResponseEditor = styled.input`
  border: none;
  width: 100%;
  height: 100%;
  fontSize: 12px;
  padding: 0 6px;
  outline: 0;
  
  &:focus {
     box-shadow: inset 0 0 0px 2px #b2caef;
  }
`;

const Container = styled.div`
  display: flex;
  height: 25px;
  border-top: 1px solid #d8d8d8;
  width: calc(100% - 95px);
  margin-left: 95px;
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  border-right: 1px solid #e7e7e7;
  height: 100%;
`;

const MockSection = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  width: 100%;
`;

const ResponseBodySection = styled(Section)`
  padding: 0;
  flex-grow: 1;
`;

const BlueButton = styled.div`
  color: white;
  background-color: #2d7bd1;
  display: inline-block;
  padding: 3px 8px;
  margin-left: 3px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
`;

const Icon = styled.img`
  height: 16px;
  margin-left: 5px;
  user-select: none;
`;

const delayPreset = [
  { value: 500, label: '0.5s' },
  { value: 1000, label: '1s' },
  { value: 2000, label: '2s' },
  { value: 5000, label: '5s' }
];

const headersPresetsOptions = [
  { value: 'JSON', label: 'JSON' },
  { value: 'XML', label: 'XML' },
  { value: 'TEXT', label: 'TEXT' }
];

class QuickEdit extends React.Component {

  componentDidMount() {
    this.setState(this.initRequest(this.props));

    window.addEventListener('keyup', this.closeOnEscape);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedRequestId !== nextProps.selectedRequestId) {
      this.setState(this.initRequest(nextProps));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.closeOnEscape);
  }

  closeOnEscape = (event) => {
    if (event.keyCode === 27) {
      this.props.onSave();
    }
  };

  initRequest = (props) => {
    const latestRequest = props.latestRequest;
    const mock = this.props.API.getMock(latestRequest.mockId);
    const delay = get(mock, 'response.delay') || get(latestRequest, 'response.delay', 0);

    let delayOptions = delayPreset;
    const delayOption = find(delayPreset, { value: delay });
    if (!delayOption) {
      delayOptions = [
        { value: delay, label: `${(delay / 1000).toFixed(2)}s` },
        ...delayPreset
      ];
    }

    return {
      status: get(mock, 'response.status') || get(latestRequest, 'response.status', 200),
      headerPreset: 'JSON',
      responseBody: get(mock, 'response.body') || get(latestRequest, 'response.body'),
      active: get(mock, 'active') || latestRequest.active || true,
      delay,
      delayOptions
    };
  };

  selectRequest = (value) => {
    this.props.onSelectRequest(value);
  };

  onChange = (key) => (value) => {
    this.setState({ [key]: value });
  };

  onRequestBodyChange = (event) => {
    this.setState({ responseBody: event.target.value });
  };

  toggleActive = () => {
    this.setState({ active: !this.state.active });
  };

  onResponseEnter = (event) => {
    if (event.key === 'Enter') {
      this.props.switchToFullEdit();
    }
  };

  onSave = () => {
    const { latestRequest }                                     = this.props;
    const { delay, status, headerPreset, responseBody, active } = this.state;

    const request = Object.assign({}, latestRequest, {
      active,
      response: {
        delay,
        status,
        headers: getHeaderPreset(headerPreset),
        body: responseBody
      }
    });

    if (latestRequest.mockId) {
      this.props.API.updateMock(latestRequest.mockId, request);
    } else {
      this.props.API.mockRequest(request);
    }

    this.props.onSave();
  };

  onPaste = (event) => {
    const content = event.nativeEvent.clipboardData.getData('text');

    if (content.length > PASTE_CHARACTER_LIMIT) {
      this.props.switchToFullEdit();
    }
  };

  renderNotMocked = () => (
    <MockSection>
      <ResponseBodySection>
        <ResponseEditor type="text"
                        placeholder="Not mocked"
                        readOnly/>
      </ResponseBodySection>
    </MockSection>
  );

  renderMocked = () => (
    <MockSection>
      <Section>
        <Select
          valueIcon={ null }
          onChange={ this.onChange('status') }
          value={ this.state.status }
          options={ values(HttpStatus).sort().map((statusCode) => ({
            value: statusCode,
            label: statusCode
          })) }/>
      </Section>

      <Section>
        <Select
          onChange={ this.onChange('headerPreset') }
          value={ this.state.headerPreset }
          options={ headersPresetsOptions }/>
      </Section>

      <ResponseBodySection>
        <ResponseEditor type="text"
                        onChange={ this.onRequestBodyChange }
                        onKeyPress={ this.onResponseEnter }
                        onPaste={ this.onPaste }
                        value={ this.state.responseBody }
                        placeholder="Response Body"/>
      </ResponseBodySection>

      <Section>
        <Select
          valueIcon={ stopwatchIcon }
          onChange={ this.onChange('delay') }
          value={ this.state.delay }
          options={ this.state.delayOptions }/>
      </Section>
    </MockSection>
  );

  renderQuickEdit = () => {
    const capturedRequests = this.props.API.capturedRequests.map((request) => ({
      value: request.id,
      label: request.url,
      method: request.method,
      isMocked: !!request.mockId,
      response: request.response
    }));

    return (
      <Container>
        <Section>
          <Icon
            src={ this.state.active ? mockedIcon : unmockedIcon }
            alt={ this.state.active ? 'Unmock' : 'Mock' }
            onClick={ this.toggleActive }/>
          <Select
            autoOpen={ this.props.autoShowRequestLog }
            applySecialStyleForRequestLog={ true }
            autoScrollToEnd={ true }
            showDropdownIcon={ false }
            optionComponent={ RequestOption }
            valueComponent={ RequestOptionValue }
            onChange={ this.selectRequest }
            value={ this.props.selectedRequestId }
            options={ capturedRequests }/>
        </Section>

        { this.state.active ? this.renderMocked() : this.renderNotMocked() }

        <Section>
          <BlueButton onClick={ this.props.switchToFullEdit }>
            Tune...
          </BlueButton>

          <BlueButton onClick={ this.onSave }>
            Apply
          </BlueButton>
        </Section>
      </Container>
    );
  };

  render() {
    return (
      <div style={{ width: '100%' }}>
        <MimicControls
          showLogs={ this.props.showLogs }
          showMocks={ this.props.showMocks }/>
        { this.renderQuickEdit() }
      </div>

    );
  }
}

export default withAPI(QuickEdit);