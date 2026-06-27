const GAS_WEB_APP_URL = 'ここにGASのウェブアプリURLを貼る';

const GUEST_ID = 'taro';
const GUEST_KEY = 'taro-20270321';

const weddingDate = new Date('2027-03-21T10:00:00+09:00');

const messagePage = document.getElementById('messagePage');
const invitationPage = document.getElementById('invitationPage');
const countdown = document.getElementById('countdown');
const rsvpForm = document.getElementById('rsvpForm');
const formArea = document.getElementById('formArea');
const submittedMessage = document.getElementById('submittedMessage');
const formMessage = document.getElementById('formMessage');
const guestName = document.getElementById('guestName');

messagePage.addEventListener('click', () => {
  messagePage.classList.add('hidden');
  invitationPage.classList.remove('hidden');
});

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    countdown.textContent = '本日です';
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdown.innerHTML = `${days}日<br>${hours}時間 ${minutes}分 ${seconds}秒`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

function jsonp(params) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonpCallback_' + Date.now() + Math.floor(Math.random() * 10000);

    params.callback = callbackName;

    const query = new URLSearchParams(params).toString();
    const script = document.createElement('script');

    window[callbackName] = data => {
      resolve(data);
      delete window[callbackName];
      script.remove();
    };

    script.src = `${https://script.google.com/macros/s/AKfycby5b-0mifuB6BwE-fnKc7fnByFx-7T71wyA4E7EC1ESsijOgMlDkR1iLsRJlRayoKLv/exec}?${query}`;
    script.onerror = () => {
      reject(new Error('通信に失敗しました。'));
      delete window[callbackName];
      script.remove();
    };

    document.body.appendChild(script);
  });
}

async function checkSubmission() {
  const result = await jsonp({
    action: 'check',
    guestId: GUEST_ID,
    key: GUEST_KEY
  });

  if (!result.ok) {
    alert(result.message);
    return;
  }

  guestName.textContent = result.guestName;

  if (result.submitted) {
    formArea.classList.add('hidden');
    submittedMessage.classList.remove('hidden');
  }
}

rsvpForm.addEventListener('submit', async event => {
  event.preventDefault();

  const submitButton = rsvpForm.querySelector('button');
  submitButton.disabled = true;
  formMessage.textContent = '送信中です...';

  try {
    const result = await jsonp({
      action: 'submit',
      guestId: GUEST_ID,
      key: GUEST_KEY,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      status: document.getElementById('status').value
    });

    if (!result.ok) {
      throw new Error(result.message);
    }

    formArea.classList.add('hidden');
    submittedMessage.classList.remove('hidden');
  } catch (err) {
    formMessage.textContent = err.message;
    submitButton.disabled = false;
  }
});

checkSubmission();
