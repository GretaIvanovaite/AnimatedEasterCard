function getColumns() {
    const fileContent = sessionStorage.getItem('uploadedFile');
    const fileName = sessionStorage.getItem('uploadedFileName');
    const columns = [];

    if (!fileContent) {
        return columns;
    }

    const nameParts = fileName.split('.');
    const extension = nameParts[nameParts.length - 1].toLowerCase();

    if (extension === 'json') {
        const data = JSON.parse(fileContent);
        const firstRow = data[0];
        const keys = Object.keys(firstRow);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const example = firstRow[key];
            columns.push({ label: key + ' (' + example + ')', value: key });
        }
    } else {
        const lines = fileContent.split('\n');

        if (fileName === 'manual') {
            const exampleParts = lines[0].split(',');

            for (let i = 0; i < exampleParts.length; i++) {
                const example = exampleParts[i].trim();
                columns.push({ label: 'Column ' + (i + 1) + ' (' + example + ')', value: i });
            }
        } else {
            const headers = lines[0].split(',');
            const exampleParts = lines.length > 1 ? lines[1].split(',') : [];

            for (let i = 0; i < headers.length; i++) {
                const header = headers[i].trim();
                const example = exampleParts[i] ? exampleParts[i].trim() : '';

                if (example !== '') {
                    columns.push({ label: header + ' (' + example + ')', value: i });
                } else {
                    columns.push({ label: header, value: i });
                }
            }
        }
    }

    return columns;
}

function populateDropdowns() {
    const columns = getColumns();
    const emailSelect = document.getElementById('emailColumn');
    const nameSelect = document.getElementById('nameColumn');

    for (let i = 0; i < columns.length; i++) {
        const emailOption = document.createElement('option');
        emailOption.value = columns[i].value;
        emailOption.textContent = columns[i].label;
        emailSelect.appendChild(emailOption);

        const nameOption = document.createElement('option');
        nameOption.value = columns[i].value;
        nameOption.textContent = columns[i].label;
        nameSelect.appendChild(nameOption);
    }
}

populateDropdowns();

const params = new URLSearchParams(window.location.search);
const companyName = params.get('companyName') || '{company name}';

const openingPhrase = document.getElementById('openingPhrase');
const customerNameOptions = [];

for (let i = 0; i < openingPhrase.options.length; i++) {
    const option = openingPhrase.options[i];
    option.textContent = option.textContent.replace('{company name}', companyName);

    if (option.textContent.indexOf('{customer name}') !== -1) {
        customerNameOptions.push(option);
    }
}

for (let i = 0; i < customerNameOptions.length; i++) {
    openingPhrase.removeChild(customerNameOptions[i]);
}

function nameColumnChange() {
    const nameSelected = document.getElementById('nameColumn').value;

    if (nameSelected !== '') {
        for (let i = 0; i < customerNameOptions.length; i++) {
            openingPhrase.appendChild(customerNameOptions[i]);
        }
    } else {
        for (let i = 0; i < customerNameOptions.length; i++) {
            if (customerNameOptions[i].parentNode === openingPhrase) {
                openingPhrase.removeChild(customerNameOptions[i]);
            }
        }

        const currentValue = openingPhrase.value;
        let currentStillExists = false;
        for (let i = 0; i < openingPhrase.options.length; i++) {
            if (openingPhrase.options[i].value === currentValue) {
                currentStillExists = true;
                break;
            }
        }
        if (!currentStillExists) {
            openingPhrase.selectedIndex = 0;
        }
    }
}

document.getElementById('nameColumn').addEventListener('change', nameColumnChange);

document.querySelector('form').addEventListener('submit', function() {
    sessionStorage.setItem('openingPhrase', document.getElementById('openingPhrase').value);
    sessionStorage.setItem('emailColumn', document.getElementById('emailColumn').value);
    sessionStorage.setItem('nameColumn', document.getElementById('nameColumn').value);
});

function getColumnValues(columnValue) {
    const fileContent = sessionStorage.getItem('uploadedFile');
    const fileName = sessionStorage.getItem('uploadedFileName');
    const values = [];

    if (!fileContent) {
        return values;
    }

    const nameParts = fileName.split('.');
    const extension = nameParts[nameParts.length - 1].toLowerCase();

    if (extension === 'json') {
        const data = JSON.parse(fileContent);
        for (let i = 0; i < data.length; i++) {
            const value = data[i][columnValue];
            if (value !== undefined && value !== '') {
                values.push(String(value).trim());
            }
        }
    } else {
        const lines = fileContent.split('\n');
        const startRow = fileName === 'manual' ? 0 : 1;

        for (let i = startRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line !== '') {
                const parts = line.split(',');
                const value = parts[columnValue] ? parts[columnValue].trim() : '';
                if (value !== '') {
                    values.push(value);
                }
            }
        }
    }

    return values;
}

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

function emailColumnValidation() {
    const columnValue = document.getElementById('emailColumn').value;
    const error = document.getElementById('emailColumn-error');

    if (columnValue === '') {
        error.hidden = true;
        return false;
    }

    const values = getColumnValues(columnValue);
    let allValid = true;

    for (let i = 0; i < values.length; i++) {
        if (!isValidEmail(values[i])) {
            allValid = false;
            break;
        }
    }

    if (!allValid || values.length === 0) {
        error.hidden = false;
        return false;
    }

    error.hidden = true;
    return true;
}

document.getElementById('emailColumn').addEventListener('change', emailColumnValidation);

document.querySelector('form').addEventListener('submit', function(submitEvent) {
    const emailSelected = document.getElementById('emailColumn').value;
    let valid = true;

    if (emailSelected === '') {
        document.getElementById('emailColumn-error').hidden = false;
        document.getElementById('emailColumn-error').textContent = 'Please select an email column.';
        valid = false;
    } else {
        if (!emailColumnValidation()) {
            valid = false;
        }
    }

    if (!valid) {
        submitEvent.preventDefault();
    }
});
