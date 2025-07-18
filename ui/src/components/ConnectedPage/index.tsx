import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Spinner from '@atlaskit/spinner';

import { FlagType, showFlag } from '@forge/bridge/out/flag/flag';
import { getCallBridge } from '@forge/bridge/out/bridge';
import { disconnectGroup, resyncConfigAsCode } from '../../services/invokes';
import { ConnectInfoPanel } from './ConnectInfoPanel';
import { ImportControls } from './ImportControls';
import { CenterWrapper } from '../styles';
import { DefaultErrorState } from '../DefaultErrorState';
import { ApplicationState } from '../../routes';
import { useAppContext } from '../../hooks/useAppContext';
import { AuthErrorTypes, ErrorTypes, GitlabAPIGroup, ResyncErrorTypes } from '../../resolverTypes';
import { useImportContext } from '../../hooks/useImportContext';
import { ImportResult } from '../ImportResult';
import { IncomingWebhookSectionMessage } from '../IncomingWebhookSectionMessage';
import { isRenderingInOnboardingFlow } from '../onboarding-flow-context-helper';

const showReSyncCaCFlag = (flagType: FlagType, groupName?: string, isResyncTimeLimitError?: boolean) => {
  if (flagType === 'success') {
    showFlag({
      id: 'success-sync-cac-flag',
      title: 'Config-as-code files being processed',
      type: 'success',
      // eslint-disable-next-line max-len
      description: `Your config-as-code files are being processed in the background. Wait a couple minutes for changes to be reflected on your components`,
      actions: [],
      isAutoDismiss: false,
    });
  }

  if (flagType === 'error') {
    showFlag({
      id: 'error-sync-cac-flag',
      title: "Couldn't sync CaC files",
      type: 'error',
      // eslint-disable-next-line max-len
      description: `We couldn't sync your config-as-code files for the ${groupName} group. Try again in a few seconds.`,
      actions: [],
      isAutoDismiss: false,
    });
  }

  if (flagType === 'info' && isResyncTimeLimitError) {
    showFlag({
      id: 'info-sync-cac-time-limit-flag',
      title: 'Re-sync time limit',
      type: 'info',
      description: `A resync of the config-as-code files in ${groupName} is already underway.`,
      isAutoDismiss: false,
    });
  }
};

export const ConnectedPage = () => {
  const [isDisconnectGroupInProgress, setDisconnectGroupInProgress] = useState(false);
  const [errorType, setErrorType] = useState<ErrorTypes>();
  const [groups, setGroups] = useState<GitlabAPIGroup[]>();
  const [isInOnboarding, setIsInOnboarding] = useState<boolean>(false);
  const [isResyncLoading, setIsResyncLoading] = useState(false);

  const navigate = useNavigate();
  const { features, getConnectedInfo, clearGroup, appId } = useAppContext();
  const { isImportInProgress } = useImportContext();

  const getIsInOnboarding = async () => {
    const isInOnboardingFlow = await isRenderingInOnboardingFlow();
    setIsInOnboarding(isInOnboardingFlow);
  };

  const handleDisconnectGroup = async (id: number) => {
    setDisconnectGroupInProgress(true);
    try {
      const { success, errors } = await disconnectGroup(id);
      clearGroup(id);

      if (success) {
        setDisconnectGroupInProgress(false);
        navigate(`..${ApplicationState.AUTH}`, { replace: true });
      }
      if (errors && errors.length > 0) {
        setDisconnectGroupInProgress(false);
        setErrorType(errors[0].errorType || AuthErrorTypes.UNEXPECTED_ERROR);
      }
    } catch (err) {
      setErrorType(AuthErrorTypes.UNEXPECTED_ERROR);
    } finally {
      setDisconnectGroupInProgress(false);
    }
  };

  useEffect(() => {
    getConnectedInfo()
      .then(setGroups)
      .catch((e) => {
        console.error('Error while getting connected info', e);
      });

    getIsInOnboarding().catch((e) => console.error(`Error fetching onboarding flow context: ${e}`));
  }, []);

  if (errorType) {
    return <DefaultErrorState errorType={errorType} />;
  }

  if (!groups?.length) {
    return (
      <CenterWrapper>
        <Spinner size='large' />
      </CenterWrapper>
    );
  }

  const handleCacResync = async (): Promise<void> => {
    const actionSubject = 'configAsCodeResync';
    const successAction = 'completed';
    const failedAction = 'failed';

    setIsResyncLoading(true);
    let hasNextPage = true;
    let currentPage = 1;

    while (hasNextPage) {
      try {
        const { success, errors, data } = await resyncConfigAsCode(groups[0].id, currentPage);

        if (errors?.length || !success) {
          console.error(`Error while syncing config-as-code file for the ${groups[0].name}:`, JSON.stringify(errors));

          const isResyncTimeLimitError =
            errors?.length && errors.some((error) => error.errorType === ResyncErrorTypes.RESYNC_TIME_LIMIT);

          await getCallBridge()('fireForgeAnalytic', {
            forgeAppId: appId,
            analyticEvent: `${actionSubject} ${isResyncTimeLimitError ? successAction : failedAction}`,
            attributes: {
              orgName: groups[0].name,
            },
          });

          setIsResyncLoading(false);

          if (!isResyncTimeLimitError) {
            showReSyncCaCFlag('error', groups[0].name);
          } else {
            showReSyncCaCFlag('info', groups[0].name, true);
          }
          return;
        }

        if (data && data.hasNextPage) {
          currentPage += 1;
        } else {
          hasNextPage = false;
        }
      } catch (e) {
        console.error('There was an error syncing CaC files for the group, please try again.', e);
        setIsResyncLoading(false);
        showReSyncCaCFlag('error', groups[0].name);
        await getCallBridge()('fireForgeAnalytic', {
          forgeAppId: appId,
          analyticEvent: `${actionSubject} ${failedAction}`,
          attributes: {
            orgName: groups[0].name,
          },
        });
        return;
      }

      setIsResyncLoading(false);
      showReSyncCaCFlag('success');
      await getCallBridge()('fireForgeAnalytic', {
        forgeAppId: appId,
        analyticEvent: `${actionSubject} ${successAction}`,
        attributes: {
          orgName: groups[0].name,
        },
      });
    }
  };

  return (
    <div data-testid='gitlab-connected-page'>
      <h4>Connected group</h4>
      <p>You can connect only one GitLab group to Compass at a time, and you must be an owner of that group.</p>
      <br />
      {!isInOnboarding && (
        <IncomingWebhookSectionMessage isMaintainerTokenEnabled={features.isGitlabMaintainerTokenEnabled} />
      )}
      <br />
      <ConnectInfoPanel
        connectedGroup={groups[0]}
        handleDisconnectGroup={handleDisconnectGroup}
        isDisconnectGroupInProgress={isDisconnectGroupInProgress}
        isLoadingResync={isResyncLoading}
        handleResyncCaC={handleCacResync}
        isResyncConfigAsCodeEnabled={features.isResyncConfigAsCodeEnabled}
      />

      <ImportControls />

      {!isImportInProgress ? <ImportResult /> : null}
    </div>
  );
};
