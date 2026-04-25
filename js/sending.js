const EMAILJS_PUBLIC_KEY = '5_ikJo7yhP4ygQwQ8';
const EMAILJS_SERVICE_ID = 'service_5d8voct';
const EMAILJS_TEMPLATE_ID = 'template_qv1y2ic';

const phraseMap = {
    'happy-easter': 'Happy Easter!',
    'wishing-you': 'Wishing you a joyful Easter!',
    'warmest': 'Our warmest Easter greetings to you',
    'hi-name': 'Happy Easter, {customer name}!',
    'dear-name': 'Dear {customer name},',
    'from-company': 'From all of us at {company name},',
    'dear-name-from-company': 'Dear {customer name}, from all of us at {company name}'
};

const fileContent = sessionStorage.getItem('uploadedFile') || '';
const fileName = sessionStorage.getItem('uploadedFileName') || '';
const companyName = sessionStorage.getItem('companyName') || '';
const message = sessionStorage.getItem('message') || '';
const emailSubject = sessionStorage.getItem('emailSubject') || '';
const url = sessionStorage.getItem('url') || '';
const urlCaption = sessionStorage.getItem('urlCaption') || '';
const openingPhraseValue = sessionStorage.getItem('openingPhrase') || '';
const emailColumn = sessionStorage.getItem('emailColumn');
const nameColumn = sessionStorage.getItem('nameColumn');

function getRecipients() {
    const recipients = [];

    if (!fileContent) {
        return recipients;
    }

    const nameParts = fileName.split('.');
    const extension = nameParts[nameParts.length - 1].toLowerCase();

    if (extension === 'json') {
        const data = JSON.parse(fileContent);
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const email = row[emailColumn] ? String(row[emailColumn]).trim() : '';
            const name = nameColumn && row[nameColumn] ? String(row[nameColumn]).trim() : '';
            if (email !== '') {
                recipients.push({ email: email, name: name });
            }
        }
    } else {
        const lines = fileContent.split('\n');
        const startRow = fileName === 'manual' ? 0 : 1;

        for (let i = startRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line !== '') {
                const parts = line.split(',');
                const email = parts[emailColumn] ? parts[emailColumn].trim() : '';
                const name = nameColumn !== '' && parts[nameColumn] ? parts[nameColumn].trim() : '';
                if (email !== '') {
                    recipients.push({ email: email, name: name });
                }
            }
        }
    }

    return recipients;
}

function buildCardUrl(recipientName) {
    const base = window.location.origin + window.location.pathname.replace('sending.html', 'card.html');
    const params = new URLSearchParams();
    params.set('phrase', openingPhraseValue);
    params.set('message', message);
    params.set('companyName', companyName);
    if (recipientName !== '') {
        params.set('name', recipientName);
    }
    if (url !== '') {
        params.set('url', url);
    }
    if (urlCaption !== '') {
        params.set('urlCaption', urlCaption);
    }
    return base + '?' + params.toString();
}

function buildPhraseText(recipientName) {
    let phraseText = phraseMap[openingPhraseValue] || '';
    phraseText = phraseText.replace('{customer name}', recipientName || 'Customer');
    phraseText = phraseText.replace('{company name}', companyName);
    return phraseText;
}

function addResult(email, success) {
    const list = document.getElementById('sending-results');
    const item = document.createElement('li');
    item.textContent = email + ' — ' + (success ? 'Sent' : 'Failed');
    item.className = success ? 'sent' : 'failed';
    list.appendChild(item);
}

async function sendAll() {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

    const recipients = getRecipients();
    const statusEl = document.getElementById('sending-status');
    const progressContainer = document.getElementById('progress-container');
    const progressTrack = document.getElementById('progress-track');
    const progressFill = document.getElementById('progress-fill');
    const progressLabel = document.getElementById('progress-label');

    if (recipients.length === 0) {
        statusEl.textContent = 'No recipients found.';
        return;
    }

    // enhance accessibility
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');

    progressContainer.hidden = false;
    progressTrack.setAttribute('aria-valuemax', recipients.length);

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        const current = i + 1;

        statusEl.textContent = 'Sending email ' + current + ' of ' + recipients.length + '...';
        progressLabel.textContent = current + ' of ' + recipients.length;
        progressTrack.setAttribute('aria-valuenow', current);

        const cardUrl = buildCardUrl(recipient.name);
        const phraseText = buildPhraseText(recipient.name);

        const templateParams = {
            to_email: recipient.email,
            to_name: recipient.name,
            subject: emailSubject,
            phrase: phraseText,
            message: message,
            company_name: companyName,
            card_url: cardUrl,
            url: url,
            url_caption: urlCaption
        };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            addResult(recipient.email, true);
            sent++;
        } catch (error) {
            addResult(recipient.email, false);
            failed++;
        }

        progressFill.style.width = Math.round((current / recipients.length) * 100) + '%';
    }

    progressLabel.textContent = recipients.length + ' of ' + recipients.length;
    statusEl.textContent = 'Bulk send complete. ' + sent + ' successfully sent, ' + failed + ' failed.';
}

sendAll();
