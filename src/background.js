/* global chrome */
import { createPageURL, createStartURL, getConfig, objectFromEntries } from "./config";
import { purge } from "./services";

const showT71Page = (page, devMode) => {
  return chrome.windows.create({ type: 'popup', url: createPageURL(page, devMode) });
};

const launchTiming71 = (sourceURL, devMode) => {
  chrome.windows.create({ type: 'popup', url: createStartURL(sourceURL, devMode) }).then(
    window => chrome.tabs.update(window.tabs[0].id, { autoDiscardable: false })
  );
};

chrome.runtime.onInstalled.addListener(getConfig);
chrome.runtime.onStartup.addListener(getConfig);

const PURGE_SERVICES_ALARM = 'purgeServices';

const installAlarm = () => {
  chrome.alarms.create(
    PURGE_SERVICES_ALARM,
    {
      periodInMinutes: 60
    }
  );
  purge();
};

chrome.runtime.onInstalled.addListener(installAlarm);
chrome.runtime.onStartup.addListener(purge);

chrome.alarms.onAlarm.addListener(
  (alarm) => {
    switch (alarm.name) {
      case PURGE_SERVICES_ALARM:
        purge();
        break;
      default:
        // Nothing here
    }
  }
);

chrome.runtime.onMessage.addListener(
  (msg, _, sendResponse) => {
    switch (msg.type) {

      case 'LAUNCH_T71':
        launchTiming71(msg.source, msg.devMode);
        break;

      case 'SHOW_T71_PAGE':
        showT71Page(msg.page, msg.devMode);
        break;

      case 'GET_CONFIG':
        getConfig().then(
          config => sendResponse(config)
        );
        return true;

      case 'INSECURE_FETCH':
        fetch(msg.url, msg.options).then(
          r => {
            r.text().then(
              t => sendResponse(t, r.headers && objectFromEntries(r.headers.entries()))
            );
          }
        ).catch(
          (e) => {
            // We can't pass the exception object through serialisation
            sendResponse({ error: e.message, originalMessage: msg });
          }
        );
        return true;

      default:
    }
  }
);
