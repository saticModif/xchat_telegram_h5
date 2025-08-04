import type { FC } from '../../lib/teact/teact';
import React, { useEffect, useState } from '../../lib/teact/teact';
import { getActions, withGlobal, getGlobal } from '../../global';

import type { ApiChat, GlobalState } from '../../global/types';

import { selectChatByUsername } from '../../global/selectors';
import { fetchChatByUsername } from '../../global/actions/api/chats';
import useOldLang from '../../hooks/useOldLang';
import buildClassName from '../../util/buildClassName';

import Button from '../ui/Button';
import Avatar from './Avatar';
import Spinner from '../ui/Spinner';

import styles from './PrivateChannelPage.module.scss';

type StateProps = {
  chat?: ApiChat;
  isLoading?: boolean;
  error?: string;
};

type OwnProps = {
  username: string;
};

const PrivateChannelPage: FC<OwnProps & StateProps> = ({
  username,
  chat,
  isLoading,
  error,
}) => {
  const lang = useOldLang();
  const actions = getActions();
  const [isJoining, setIsJoining] = useState(false);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  useEffect(() => {
    // 当组件挂载时，尝试获取频道信息
    if (!chat && !isLoading && !localIsLoading) {
      handleFetchChannel();
    }
  }, [username, chat, isLoading, localIsLoading]);

  // 如果用户已经加入频道，自动跳转到频道页面
  useEffect(() => {
    if (chat && !chat.isNotJoined) {
      // 使用更直接的方法打开聊天，避免依赖processOpenChatOrThread
      const hashUrl = `#/c/${chat.id}`;
      window.location.hash = hashUrl;
    }
  }, [chat]);

  const handleFetchChannel = async () => {
    setLocalIsLoading(true);
    setLocalError(undefined);
    
    try {
      const global = getGlobal();
      const fetchedChat = await fetchChatByUsername(global, username);
      
      if (!fetchedChat) {
        setLocalError('ChannelNotFound');
      }
    } catch (err: any) {
      console.error('Failed to fetch channel:', err);
      setLocalError(err.message || 'ChannelAccessError');
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleJoinChannel = async () => {
    console.log('Join Channel clicked, chat:', chat);
    if (!chat || isJoining) {
      console.log('Cannot join: no chat or already joining');
      
      return;
    }

    console.log('Starting join process...');
    setIsJoining(true);
    try {
      console.log('Calling API with:', { channelId: chat.id, accessHash: chat.accessHash });
      // 直接调用API，避免所有action问题
      const { callApi } = await import('../../api/gramjs');
      await callApi('joinChannel', { 
        channelId: chat.id, 
        accessHash: chat.accessHash 
      });
      
      console.log('Join successful, redirecting to:', `#/c/${chat.id}`);
      // 直接跳转
      window.location.hash = `#/c/${chat.id}`;
    } catch (err: any) {
      console.error('Failed to join channel:', err);
    } finally {
      console.log('Join process finished');
      setIsJoining(false);
    }
  };

  const currentIsLoading = isLoading || localIsLoading;
  const currentError = error || localError;

  if (currentIsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spinner />
          <p>{lang('Loading')}</p>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="icon icon-error" />
          <h2>{lang('ChannelNotFound')}</h2>
          <p>{lang('ChannelNotFoundDescription')}</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="icon icon-error" />
          <h2>{lang('ChannelNotFound')}</h2>
          <p>{lang('ChannelNotFoundDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Avatar 
            chat={chat} 
            size="jumbo" 
            className={styles.avatar}
          />
          <div className={styles.info}>
            <h1 className={styles.title}>{chat.title}</h1>
            {chat.username && (
              <p className={styles.username}>@{chat.username}</p>
            )}
            {chat.about && (
              <p className={styles.description}>{chat.about}</p>
            )}
            {chat.membersCount && (
              <p className={styles.members}>
                {lang('ChannelMembers', chat.membersCount)}
              </p>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            size="large"
            color="primary"
            fluid
            ripple
            disabled={isJoining}
            onClick={handleJoinChannel}
            className={styles.joinButton}
          >
            {isJoining ? (
              <>
                <Spinner size="tiny" />
                {lang('Joining')}
              </>
            ) : (
              lang('ProfileJoinChannel')
            )}
          </Button>
        </div>

        <div className={styles.footer}>
          <p className={styles.disclaimer}>
            {lang('PrivateChannelDisclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global, { username }): StateProps => {
    const chat = selectChatByUsername(global, username);
    return {
      chat,
      isLoading: false,
      error: undefined,
    };
  },
)(PrivateChannelPage); 