// Function to generate XPath for a DOM node
function generateXpath(el) {
    let xpath = '';
    let pos, tempItem = el;
    while (tempItem) {
        pos = 0;
        if (tempItem.nodeType === 1) {
            let sibling = tempItem.previousSibling;
            while (sibling) {
                if (sibling.nodeType === 1 && sibling.tagName === tempItem.tagName) {
                    pos += 1;
                }
                sibling = sibling.previousSibling;
            }
            xpath = `/${tempItem.tagName}[${pos + 1}]${xpath}`;
            tempItem = tempItem.parentNode;
        } else {
            xpath = '';
            tempItem = null;
        }
    }
    return xpath;
}

document.addEventListener('keydown', function (e) {
    if ((e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') && e.key === 'Enter') {
        let xpath = generateXpath(e.target);
        chrome.runtime.sendMessage({ method: 'saveInput', xpath: xpath, data: e.target.value });
    } else if ((e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        let xpath = generateXpath(e.target);
        chrome.runtime.sendMessage({ method: 'getInput', xpath: xpath, direction: e.key === 'ArrowUp' ? 'up' : 'down' }, function (response) {
            if (response && response.status !== 'excluded' && response.data !== null) {  // Check status and if data is not null
                e.target.value = response.data;
            }
        });
        return false;  // Prevent the default action
    }
});
