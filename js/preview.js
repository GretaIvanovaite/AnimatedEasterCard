const params = new URLSearchParams(window.location.search);
const openingPhraseValue = params.get('openingPhrase') || sessionStorage.getItem('openingPhrase') || 'happy-easter';
const customPhrase = params.get('customPhrase') || sessionStorage.getItem('customPhrase') || '';
const nameColumn = params.get('nameColumn') || sessionStorage.getItem('nameColumn');
const orderParam = params.get('order') || sessionStorage.getItem('messageOrder') || 'phrase,message,company';

const companyName = sessionStorage.getItem('companyName') || '';
const message = sessionStorage.getItem('message') || '';
const url = sessionStorage.getItem('url') || '';
const urlCaption = sessionStorage.getItem('urlCaption') || '';
const logoDataUrl = sessionStorage.getItem('companyLogo') || '';
const fileContent = sessionStorage.getItem('uploadedFile') || '';
const fileName = sessionStorage.getItem('uploadedFileName') || '';

const phraseMap = {
    'happy-easter': 'Happy Easter!',
    'wishing-you': 'Wishing you a joyful Easter!',
    'warmest': 'Our warmest Easter greetings to you',
    'hi-name': 'Happy Easter, {customer name}!',
    'dear-name': 'Dear {customer name},',
    'from-company': 'From all of us at {company name},',
    'dear-name-from-company': 'Dear {customer name}, from all of us at {company name}'
};

function getExampleName() {
    if (!nameColumn || nameColumn === '') {
        return '';
    }

    const nameParts = fileName.split('.');
    const extension = nameParts[nameParts.length - 1].toLowerCase();

    if (extension === 'json') {
        const data = JSON.parse(fileContent);
        if (data.length > 0) {
            return String(data[0][nameColumn]).trim();
        }
        return '';
    }

    const lines = fileContent.split('\n');
    const startRow = fileName === 'manual' ? 0 : 1;

    for (let i = startRow; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line !== '') {
            const parts = line.split(',');
            const value = parts[nameColumn] ? parts[nameColumn].trim() : '';
            if (value !== '') {
                return value;
            }
        }
    }

    return '';
}

let phraseText = '';
if (openingPhraseValue === 'custom') {
    phraseText = customPhrase;
} else {
    phraseText = phraseMap[openingPhraseValue] || '';
}

phraseText = phraseText.replace(/{company name}/g, companyName);
phraseText = phraseText.replace(/{customer name}/g, getExampleName() || 'Customer');

const lines = [];
const order = orderParam.split(',');

order.forEach(id => {
    if (id === 'phrase' && phraseText !== '') {
        lines.push(phraseText);
    } else if (id === 'message' && message !== '') {
        lines.push(message);
    } else if (id === 'company' && companyName !== '') {
        lines.push(companyName);
    }
});
document.getElementById('card-message').textContent = lines.join('\n');

const cardLink = document.getElementById('card-link');
if (url !== '') {
    cardLink.href = url;
    cardLink.textContent = urlCaption !== '' ? urlCaption : url;
} else {
    cardLink.hidden = true;
}

const logoImg = document.getElementById('card-logo');
if (logoDataUrl !== '') {
    logoImg.src = logoDataUrl;
    logoImg.hidden = false;
}

const skipBtn = document.getElementById('btn-skip-anim');
if (skipBtn) {
    skipBtn.addEventListener('click', function() {
        document.getElementById('card-stage').classList.add('skip-animations');
        skipBtn.hidden = true;
    });
}

