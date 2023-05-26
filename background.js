let textHistory = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "storeText") {
        textHistory.push(request.text);
        console.log("--->   textHistory:", textHistory)
    } else if (request.action === "getTextHistory") {
        sendResponse(textHistory);
    }
});
