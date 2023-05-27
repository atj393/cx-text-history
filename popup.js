document.getElementById('exclude-button').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let url = new URL(tabs[0].url);
        let domain = url.hostname;
        chrome.runtime.sendMessage({ method: 'excludeDomain', domain: domain });
    });
});
