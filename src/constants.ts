import { IBackOffOptions } from 'exponential-backoff';

export const BASE_URL = 'https://gitlab.com';
export const GITLAB_EVENT_WEBTRIGGER = 'gitlab-event-webtrigger';
export const DEFAULT_COMPONENT_TYPE_ID = 'SERVICE';

export const STORAGE_KEYS = {
  GROUP_KEY_PREFIX: 'group-',
  WEBHOOK_KEY_PREFIX: 'webhook-id-',
  WEBHOOK_SIGNATURE_PREFIX: 'webhook-sign-id-',
  LAST_SYNC_TIME: 'lastSyncTime',
  CURRENT_IMPORT_TOTAL_PROJECTS: 'currentImportTotalProjects',
  CURRENT_IMPORT_QUEUE_JOB_IDS: 'currentImportQueueJobIds',
  CURRENT_IMPORT_FAILED_PROJECT_PREFIX: 'currentImportFailedProject-',
};

export const STORAGE_SECRETS = {
  GROUP_TOKEN_KEY_PREFIX: 'groupToken-',
};

export const REQUIRED_SCOPES = ['api', 'write_repository'];
export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const EXTERNAL_SOURCE = 'gitlab-importer';
export const IMPORT_LABEL = 'source:gitlab';
export const MAX_LINKS_OF_TYPE = 5;
export const BACK_OFF: Partial<IBackOffOptions> = {
  startingDelay: 300,
  timeMultiple: 3,
  numOfAttempts: 4,
  jitter: 'full',
};
export const NON_DEFAULT_BRANCH_VARIABLE_KEY = 'COMPASS_BRANCH';

export const CLEAR_STORAGE_CHUNK_SIZE = 8;
export const CLEAR_STORAGE_DELAY = 1000;

export const DAYS_TO_CALC = 28;
export const MILLISEC_IN_DAY = 86400000;
export const DAYS_IN_WEEK = 7;

export const COMPASS_YML_BRANCH = 'compass-gitlab-importer';
export const MR_TITLE = 'Add a compass.yml file to manage this repository as a Compass component';
export const MR_DESCRIPTION = `This MR adds the compass.yml file and sets up config-as-code for your component. \
Upon merging, you'll be able to maintain this component's data via the compass.yml file that sits alongside its source code in the repository. \
[Learn more about managing components via config-as-code](https://developer.atlassian.com/cloud/compass/config-as-code/manage-components-with-config-as-code/).\
This PR is automatically generated by the integration of Compass with GitLab.
`;
export const COMMIT_MESSAGE = 'Compass.yml file for config-as-code';
export const DEFAULT_CONFIG_VERSION = 1;
export const TEAMS_AMOUNT = 30;
