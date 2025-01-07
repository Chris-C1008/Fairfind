chrome.runtime.onInstalled.addListener(() => {
  console.log("FairFind Extension Installed! Ready to save ethically.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkAffiliate") {
    sendResponse({ status: "Affiliate link checked." });
  }
});