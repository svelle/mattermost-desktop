// Copyright (c) 2015-2016 Yuya Ochiai
// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Glyphicon, Nav, NavItem, Overlay} from 'react-bootstrap';

import {remote} from 'electron';

import PermissionRequestDialog from './PermissionRequestDialog.jsx';

function closeWindow () {
  const window = remote.BrowserWindow.getFocusedWindow();
  window.close();
}

function minimizeWindow() {
  const window = remote.BrowserWindow.getFocusedWindow();
  window.minimize();
}

function maximizeWindow() {
  const window = remote.BrowserWindow.getFocusedWindow();
  window.isMaximized() ? window.unmaximize() : window.maximize();
}

export default class NavBar extends React.Component { // need "this"
  render() {
    const tabs = this.props.teams.map((team, index) => {
      const sessionExpired = this.props.sessionsExpired[index];

      let unreadCount = 0;
      if (this.props.unreadCounts[index] > 0) {
        unreadCount = this.props.unreadCounts[index];
      }
      if (this.props.unreadAtActive[index]) {
        unreadCount += 1;
      }

      let mentionCount = 0;
      if (this.props.mentionCounts[index] > 0) {
        mentionCount = this.props.mentionCounts[index];
      }
      if (this.props.mentionAtActiveCounts[index] > 0) {
        mentionCount += this.props.mentionAtActiveCounts[index];
      }

      let badgeDiv;
      if (sessionExpired) {
        badgeDiv = (
          <div className='TabBar-badge TabBar-badge-noMention'>{'•'}</div>
        );
      } else if (mentionCount !== 0) {
        badgeDiv = (
          <div className='TabBar-badge'>
            {mentionCount}
          </div>
        );
      }
      const id = 'teamTabItem' + index;
      const requestingPermission = this.props.requestingPermission[index];
      const permissionOverlay = (
        <Overlay
          className='TabBar-permissionOverlay'
          placement='bottom'
          show={requestingPermission && this.props.activeKey === index}
          target={() => this.refs[id]}
        >
          <PermissionRequestDialog
            id={`${id}-permissionDialog`}
            origin={requestingPermission ? requestingPermission.origin : null}
            permission={requestingPermission ? requestingPermission.permission : null}
            onClickAllow={this.props.onClickPermissionDialog.bind(null, index, 'allow')}
            onClickBlock={this.props.onClickPermissionDialog.bind(null, index, 'block')}
            onClickClose={this.props.onClickPermissionDialog.bind(null, index, 'close')}
          />
        </Overlay>
      );

      // draggable=false is a workaround for https://github.com/mattermost/desktop/issues/667
      // It would obstruct https://github.com/mattermost/desktop/issues/478
      return (
        <NavItem
          className='teamTabItem'
          key={id}
          id={id}
          eventKey={index}
          ref={id}
          draggable={false}
        >
          <span
            title={team.name}
            className={unreadCount === 0 ? '' : 'teamTabItem-unread'}
          >
            {team.name}
          </span>
          { ' ' }
          { badgeDiv }
          {permissionOverlay}
        </NavItem>);
    });
    if (this.props.showAddServerButton === true) {
      tabs.push(
        <NavItem
          className='TabBar-addServerButton'
          key='addServerButton'
          id='addServerButton'
          eventKey='addServerButton'
          title='Add new server'
          draggable={false}
        >
          <Glyphicon glyph='plus'/>
        </NavItem>
      );
    }
    return (
    <div 
    className='NavBarFlexBox'>
      <Nav
        className='NavBar TabBar'
        id={this.props.id}
        bsStyle='tabs'
        activeKey={this.props.activeKey}
        onSelect={(eventKey) => {
          if (eventKey === 'addServerButton') {
            this.props.onAddServer();
          } else {
            this.props.onSelect(eventKey);
          }
        }}
      >
        <NavItem
          className='menuBarItem'
        >
          <img 
            src='../assets/appicon.png'
            height='22px'
          />
        </NavItem>
        { tabs }
      </Nav>
      <Nav
      className='NavBar MenuBar'
      bsStyle='tabs'
      >
          <NavItem
            className='menuBarItem'
            onClick={() => {
              minimizeWindow();
            }}
          >
            <Glyphicon glyph='minus'/>
          </NavItem>
          <NavItem
            className='menuBarItem'
            onClick={() => {
              maximizeWindow();
            }}
          >
            <Glyphicon glyph='unchecked'/>
          </NavItem>
          <NavItem
            className='menuBarItem'
            onClick={() => {
              closeWindow();
            }}
          >
            <Glyphicon glyph='remove'/>
          </NavItem>
        </Nav>
    </div>);
  }
}

NavBar.propTypes = {
  activeKey: PropTypes.number,
  id: PropTypes.string,
  onSelect: PropTypes.func,
  teams: PropTypes.array,
  sessionsExpired: PropTypes.array,
  unreadCounts: PropTypes.array,
  unreadAtActive: PropTypes.array,
  mentionCounts: PropTypes.array,
  mentionAtActiveCounts: PropTypes.array,
  showAddServerButton: PropTypes.bool,
  requestingPermission: PropTypes.arrayOf(PropTypes.shape({
    origin: PropTypes.string,
    permission: PropTypes.string,
  })),
  onAddServer: PropTypes.func,
  onClickPermissionDialog: PropTypes.func,
};