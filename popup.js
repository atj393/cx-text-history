document.addEventListener('DOMContentLoaded', function() {
  var toggleButton = document.getElementById('toggleButton');
  var statusDiv = document.getElementById('status');
  var isCapturing = false;

  toggleButton.addEventListener('click', function() {
    isCapturing = !isCapturing;
    toggleButton.textContent = isCapturing ? 'Stop Capture' : 'Start Capture';
    statusDiv.textContent = isCapturing ? 'Capture enabled.' : 'Capture disabled.';
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleCapture', isCapturing: isCapturing });
    });
  });
});
