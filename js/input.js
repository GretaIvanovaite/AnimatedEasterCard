function inputOption() {
    const dropdownChoice = document.getElementById('inputType').value;
    const fileOptions = ['csv', 'json', 'xls', 'xlsx'];

    if (fileOptions.includes(dropdownChoice)) {
        const acceptTypes = {
            csv: '.csv,.txt,text/csv,text/plain',
            json: '.json,application/json',
            xls: '.xls,application/vnd.ms-excel',
            xlsx: '.xlsx,.xlsm,.xlsb,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        document.getElementById('fileOptions').hidden = false;
        document.getElementById('fileUpload').required = true;
        document.getElementById('fileUpload').accept = acceptTypes[dropdownChoice];
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
window.addEventListener('pageshow', inputOption);

function fileUpload() {
    const file = document.getElementById('fileUpload').files[0];
    const fileName = file.name;
    const nameParts = fileName.split('.');
    const extension = nameParts[nameParts.length - 1].toLowerCase();
    const reader = new FileReader();

    if (extension === 'xls' || extension === 'xlsx') {
        reader.onload = function(fileEvent) {
            const workbook = XLSX.read(fileEvent.target.result, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const firstSheet = workbook.Sheets[firstSheetName];
            const csv = XLSX.utils.sheet_to_csv(firstSheet);
            sessionStorage.setItem('uploadedFile', csv);
            sessionStorage.setItem('uploadedFileName', fileName);
        };
        reader.readAsArrayBuffer(file);
    } else {
        reader.onload = function(fileEvent) {
            sessionStorage.setItem('uploadedFile', fileEvent.target.result);
            sessionStorage.setItem('uploadedFileName', fileName);
        };
        reader.readAsText(file);
    }
}

document.getElementById('fileUpload').addEventListener('change', fileUpload);

function logoUpload() {
    const file = document.getElementById('companyLogo').files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(fileEvent) {
        sessionStorage.setItem('companyLogo', fileEvent.target.result);
    };
    reader.readAsDataURL(file);
}

document.getElementById('companyLogo').addEventListener('change', logoUpload);

function isValidEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2) {
        return false;
    }
    if (parts[0] === '' || parts[1] === '') {
        return false;
    }
    if (parts[1].indexOf('.') === -1) {
        return false;
    }
    return true;
}

function formSubmit(submitEvent) {
    submitEvent.preventDefault();
    const fileOptions = ['csv', 'json', 'xls', 'xlsx'];
    const dropdownChoice = document.getElementById('inputType').value;
    const message = document.getElementById('message').value.trim();
    const companyName = document.getElementById('companyName').value.trim();
    const statusEl = document.getElementById('form-status-announcer');
    let valid = true;

    // reset validation state
    const inputs = ['inputType', 'fileUpload', 'manualData', 'message', 'companyName', 'emailSubject', 'url'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.removeAttribute('aria-invalid');
            el.removeAttribute('aria-describedby');
        }
    });

    if (!fileOptions.includes(dropdownChoice) && dropdownChoice !== 'manual') {
        const err = document.getElementById('inputType-error');
        err.hidden = false;
        document.getElementById('inputType').setAttribute('aria-invalid', 'true');
        document.getElementById('inputType').setAttribute('aria-describedby', 'inputType-error');
        valid = false;
    } else {
        document.getElementById('inputType-error').hidden = true;
    }

    if (fileOptions.includes(dropdownChoice)) {
        const file = document.getElementById('fileUpload').files[0];
        if (!file) {
            const err = document.getElementById('fileUpload-error');
            err.hidden = false;
            document.getElementById('fileUpload').setAttribute('aria-invalid', 'true');
            document.getElementById('fileUpload').setAttribute('aria-describedby', 'fileUpload-error');
            valid = false;
        } else {
            document.getElementById('fileUpload-error').hidden = true;
        }
    }

    if (dropdownChoice === 'manual') {
        const text = document.getElementById('manualData').value;
        const lines = text.split('\n');
        const validLines = [];
        let manualValid = true;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line !== '') {
                const parts = line.split(',');
                const email = parts[0] ? parts[0].trim() : '';
                if (!isValidEmail(email)) {
                    manualValid = false;
                } else {
                    validLines.push(line);
                }
            }
        }

        if (!manualValid || validLines.length === 0) {
            const err = document.getElementById('manualData-error');
            if (err) err.hidden = false;
            document.getElementById('manualData').setAttribute('aria-invalid', 'true');
            document.getElementById('manualData').setAttribute('aria-describedby', 'manualData-error');
            valid = false;
        } else {
            const err = document.getElementById('manualData-error');
            if (err) err.hidden = true;
            sessionStorage.setItem('uploadedFile', validLines.join('\n'));
            sessionStorage.setItem('uploadedFileName', 'manual');
        }
    } else {
        // If not manual, ensure we haven't accidentally left 'manual' in the filename
        // if the user switched back to file upload
        const fileInput = document.getElementById('fileUpload');
        if (fileInput && fileInput.files.length > 0) {
            sessionStorage.setItem('uploadedFileName', fileInput.files[0].name);
        }
    }

    if (message === '' || message.length > 300) {
        const err = document.getElementById('message-error');
        err.hidden = false;
        document.getElementById('message').setAttribute('aria-invalid', 'true');
        document.getElementById('message').setAttribute('aria-describedby', 'message-error');
        valid = false;
    } else {
        document.getElementById('message-error').hidden = true;
    }

    if (companyName === '' || companyName.length > 60) {
        const err = document.getElementById('companyName-error');
        err.hidden = false;
        document.getElementById('companyName').setAttribute('aria-invalid', 'true');
        document.getElementById('companyName').setAttribute('aria-describedby', 'companyName-error');
        valid = false;
    } else {
        document.getElementById('companyName-error').hidden = true;
    }

    const emailSubject = document.getElementById('emailSubject').value.trim();
    if (emailSubject === '' || emailSubject.length > 80) {
        const err = document.getElementById('emailSubject-error');
        err.hidden = false;
        document.getElementById('emailSubject').setAttribute('aria-invalid', 'true');
        document.getElementById('emailSubject').setAttribute('aria-describedby', 'emailSubject-error');
        valid = false;
    } else {
        document.getElementById('emailSubject-error').hidden = true;
    }

    const url = document.getElementById('url').value.trim();
    if (url !== '' && !url.startsWith('https://')) {
        const err = document.getElementById('url-error');
        err.hidden = false;
        document.getElementById('url').setAttribute('aria-invalid', 'true');
        document.getElementById('url').setAttribute('aria-describedby', 'url-error');
        valid = false;
    } else {
        document.getElementById('url-error').hidden = true;
    }

    if (!valid) {
        if (statusEl) {
            statusEl.textContent = 'Form has errors. Please check the highlighted fields.';
        }
        return;
    }

    if (valid) {
        // Ensure manual data is saved one last time if manual was chosen
        if (dropdownChoice === 'manual') {
            const text = document.getElementById('manualData').value;
            const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
            sessionStorage.setItem('uploadedFile', lines.join('\n'));
            sessionStorage.setItem('uploadedFileName', 'manual');
        }

        sessionStorage.setItem('companyName', companyName);
        sessionStorage.setItem('message', message);
        sessionStorage.setItem('emailSubject', emailSubject);
        sessionStorage.setItem('url', url);
        sessionStorage.setItem('urlCaption', document.getElementById('urlCaption').value.trim());
        
        if (statusEl) {
            statusEl.textContent = 'Details saved successfully! Proceeding to personalisation...';
        }
        
        setTimeout(function() {
            // Remove the event listener so we can submit naturally and pass GET params
            document.getElementById('inputForm').removeEventListener('submit', formSubmit);
            document.getElementById('inputForm').submit();
        }, 1000);
    }
}

document.getElementById('inputForm').addEventListener('submit', formSubmit);
