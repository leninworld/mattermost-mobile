// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {loadChannelsByTeamName, setChannelDisplayName} from '@actions/views/channel';
import {getChannelStats} from '@mm-redux/actions/channels';
import {getCustomEmojisInText} from '@mm-redux/actions/emojis';
import {selectFocusedPostId} from '@mm-redux/actions/posts';
import {General} from '@mm-redux/constants';
import {getTeammateNameDisplaySetting, getTheme} from '@mm-redux/selectors/entities/preferences';
import {getCurrentChannel, getCurrentChannelStats} from '@mm-redux/selectors/entities/channels';
import {getCurrentUserId, getUser, getStatusForUserId} from '@mm-redux/selectors/entities/users';
import {getUserIdFromChannelName} from '@mm-redux/utils/channel_utils';
import {displayUsername} from '@mm-redux/utils/user_utils';
import {isLandscape} from '@selectors/device';
import {isGuest} from '@utils/users';

import ChannelInfo from './channel_info';

function mapStateToProps(state) {
    const currentChannel = getCurrentChannel(state) || {};
    const currentChannelCreator = getUser(state, currentChannel.creator_id);
    const teammateNameDisplay = getTeammateNameDisplaySetting(state);
    const currentChannelCreatorName = displayUsername(currentChannelCreator, teammateNameDisplay);
    const currentChannelStats = getCurrentChannelStats(state);
    const currentChannelMemberCount = currentChannelStats && currentChannelStats.member_count;
    let currentChannelGuestCount = (currentChannelStats && currentChannelStats.guest_count) || 0;
    const currentUserId = getCurrentUserId(state);

    let status;
    let isBot = false;
    let isTeammateGuest = false;
    if (currentChannel.type === General.DM_CHANNEL) {
        const teammateId = getUserIdFromChannelName(currentUserId, currentChannel.name);
        const teammate = getUser(state, teammateId);
        status = getStatusForUserId(state, teammateId);
        if (teammate && teammate.is_bot) {
            isBot = true;
        }
        if (isGuest(teammate)) {
            isTeammateGuest = true;
            currentChannelGuestCount = 1;
        }
    }

    return {
        currentChannel,
        currentChannelCreatorName,
        currentChannelGuestCount,
        currentChannelMemberCount,
        currentUserId,
        isBot,
        isLandscape: isLandscape(state),
        isTeammateGuest,
        status,
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannelStats,
            loadChannelsByTeamName,
            getCustomEmojisInText,
            selectFocusedPostId,
            setChannelDisplayName,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelInfo);
