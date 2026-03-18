function inputOption() {
    const dropdownChoice = document.getElementById('inputType').value;
    const fileOptions = ['csv', 'json', 'xls', 'xlsx'];

    if (fileOptions.includes(dropdownChoice)) {
        document.getElementById('fileOptions').hidden = false;
        document.getElementById('fileUpload').required = true;
        document.getElementById('manualOptions').hidden = true;
        document.getElementById('manualData').required = false;
    } else if (dropdownChoice === 'manual') {
        document.getElementById('manualOptions').hidden = false;
        document.getElementById('manualData').required = true;
        document.getElementById('fileOptions').hidden = true;
        document.getElementById('fileUpload').required = false;
    } else {
        document.getElementById('fileOptions').hidden = true;
        document.getElementById('fileUpload').required = false;
        document.getElementById('manualOptions').hidden = true;
        document.getElementById('manualData').required = false;
    }
}

const optionsDropdown = document.getElementById('inputType');
optionsDropdown.addEventListener('change', inputOption);
