let inputValues = JSON.parse(localStorage.getItem('textHistory')) || {};

// Function to generate XPath expression for an element
function getXPath(element) {
    const idx = (sib, name) => sib
        ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name)
        : 1;
    const segs = elm => !elm || elm.nodeType !== 1
        ? ['']
        : elm.id && document.getElementById(elm.id) === elm
            ? [`id("${elm.id}")`]
            : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
    return segs(element).join('/');
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        let activeElement = document.activeElement;

        // Exclude password fields
        if (activeElement.type === 'password') {
            return;
        }
        
        // Exclude the value '---'
        if (activeElement.value === '---') {
            return;
        }

        let key = window.location.hostname + getXPath(activeElement); // Add the website URL domain to the XPath expression

        // Check if the key already exists in the main object
        if (inputValues.hasOwnProperty(key)) {
            if(inputValues[key].length > (20 + 1)) { // 20 is the max number of history items and 1 is the '---' line
                inputValues[key].pop(); // Remove the last element from the array
            }
            // Append the value to the existing array
            inputValues[key].splice(-1, 0, activeElement.value); // Insert the new value before the '---' line
        } else {
            // Create a new array with the value
            inputValues[key] = [activeElement.value, '---'];
        }

        inputValues[key] = [...new Set(inputValues[key])]

        // activeElement.value = ''; // Clear the input field or textarea
        localStorage.setItem('textHistory', JSON.stringify(inputValues));
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        let activeElement = document.activeElement;
        let key = window.location.hostname + getXPath(activeElement); // Add the website URL domain to the XPath expression

        // Check if the key exists in the main object
        if (inputValues.hasOwnProperty(key)) {
            event.preventDefault(); // Prevent the default behavior of arrow keys

            let values = inputValues[key];
            let currentIndex = values.indexOf(activeElement.value);

            if (event.key === 'ArrowUp') {
                // Move to the previous value in the array
                let newIndex = (currentIndex - 1 + values.length) % values.length;
                activeElement.value = values[newIndex];
            } else if (event.key === 'ArrowDown') {
                // Move to the next value in the array
                let newIndex = (currentIndex + 1) % values.length;
                activeElement.value = values[newIndex];
            }
        }
    }
});
