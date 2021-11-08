/* global chrome */

const { pageIsSupported } = require("./pageRules");

const showT71Page = (page) => {
  chrome.runtime.sendMessage({ type: 'SHOW_T71_PAGE', page });
};

const launchT71 = (url) => {
  chrome.runtime.sendMessage({ type: 'LAUNCH_T71', source: url });
};

document.addEventListener(
  'DOMContentLoaded',
  async () => {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const supported = await pageIsSupported(currentTab.url);

    document.querySelectorAll('[data-t71-supported-page]').forEach(
      (thing) => {
        const shouldShow = !!thing.dataset.t71SupportedPage === supported;
        thing.style.display = shouldShow ? 'unset' : 'none';

        if (thing.dataset.t71Launch) {
          thing.onclick = () => launchT71(currentTab.url);
        }
      }
    );
    document.querySelectorAll('[data-t71-page]').forEach(
      (clickyThing) => {
        clickyThing.onclick = () => showT71Page(clickyThing.dataset.t71Page);
      }
    );
  }
);
