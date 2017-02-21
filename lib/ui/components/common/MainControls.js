import React from 'react';
import styled from 'styled-components';
import closeIcon from 'ui/assets/images/close@2x.png';
import settingsIcon from 'ui/assets/images/settings.svg';
import halfScreenIcon from 'ui/assets/images/half-screen.svg';
import fullScreenIcon from 'ui/assets/images/full-screen.svg';
import proIcon from 'ui/assets/images/pro@2x.png';
import helpIcon from 'ui/assets/images/help@2x.png';

const Icon = styled.img`
  height: 16px;
  user-select: none;
  cursor: pointer;
`;

const MainActions = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  align-items: center;
`;

const TeamSync = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Action = styled.div`
  margin-right: 10px;
`;

export const MainControls = ({ closeFullEditor, setEditorSize, editorSize }) => (
  <MainActions>
    <Action>
      <TeamSync>
        Team Sync <Icon src={ proIcon }/>
      </TeamSync>
    </Action>

    <Action>
      Import & Export
    </Action>

    <Action>
      <Icon
        src={ helpIcon }
        alt="Help"/>
    </Action>

    <Action>
      <Icon
        disabled={editorSize === 'half'}
        src={ halfScreenIcon }
        alt="Half Screen"
        onClick={() => setEditorSize('half')}/>
    </Action>

    <Action>
      <Icon
        disabled={editorSize === 'full'}
        src={ fullScreenIcon }
        alt="Full Screen"
        onClick={() => setEditorSize('full')}/>
    </Action>

    <Action>
      <Icon src={ settingsIcon } alt="Settings"/>
    </Action>

    <Action>
      <Icon src={ closeIcon } onClick={ closeFullEditor }/>
    </Action>
  </MainActions>
);

export default MainControls;