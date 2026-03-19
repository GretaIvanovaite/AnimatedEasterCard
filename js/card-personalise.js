const phraseMap = {
    'happy-easter': 'Happy Easter!',
    'wishing-you': 'Wishing you a joyful Easter!',
    'warmest': 'Our warmest Easter greetings to you',
    'hi-name': 'Happy Easter, {customer name}!',
    'dear-name': 'Dear {customer name},',
    'from-company': 'From all of us at {company name},',
    'dear-name-from-company': 'Dear {customer name}, from all of us at {company name}'
};

const params = new URLSearchParams(window.location.search);
const openingPhraseValue = params.get('phrase') || '';
const customerName = params.get('name') || '';
const companyName = params.get('companyName') || '';
const message = params.get('message') || '';
const url = params.get('url') || '';
const urlCaption = params.get('urlCaption') || '';

let phraseText = phraseMap[openingPhraseValue] || '';
phraseText = phraseText.replace('{customer name}', customerName);
phraseText = phraseText.replace('{company name}', companyName);

const lines = [];
if (phraseText !== '') {
    lines.push(phraseText);
}
if (message !== '') {
    lines.push(message);
}
if (companyName !== '') {
    lines.push(companyName);
}

document.getElementById('card-message').textContent = lines.join('\n');

const cardLink = document.getElementById('card-link');
if (url !== '') {
    cardLink.href = url;
    cardLink.textContent = urlCaption !== '' ? urlCaption : url;
} else {
    cardLink.hidden = true;
}
