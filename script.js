const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw2WrFuXIV-TPbjK-ifO41FmRghgK7LW6ks_4DUL1g-7GNBYft7ksG57bpDtlK1fOk/exec';

const messagePage = document.getElementById('messagePage');
const invitationPage = document.getElementById('invitationPage');

messagePage.addEventListener('click', () => {
  messagePage.classList.add('hidden');
  invitationPage.classList.remove('hidden');
});

const params = new URLSearchParams(location.search);
const guestId = params.get('guest') || 'taro';
const guestKey = params.get('key') || 'taro-20270321';

const weddingDate = new Date('2027-03-21T10:00:00+09:00');

const guestName = document.getElementById('guestName');
const countdown = document.getElementById('countdown');
const formArea = document.getElementById('formArea');
const submittedMessage = document.getElementById('submittedMessage');
const form = document.getElementById('rsvpForm');
const formMessage = document.getElementById('formMessage');

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    countdown.textContent = '本日です';
    return;
  }

  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  countdown.innerHTML = `${d}日<br>${h}時間 ${m}分 ${s}秒`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

function jsonp(data) {
  return new Promise((resolve, reject) => {
    const callbackName = 'callback_' + Date.now();

    data.callback = callbackName;

    const script = document.createElement('script');
    script.src = GAS_WEB_APP_URL + '?' + new URLSearchParams(data).toString();

    window[callbackName] = result => {
      resolve(result);
      delete window[callbackName];
      script.remove();
    };

    script.onerror = () => {
      reject(new Error('通信に失敗しました'));
    };

    document.body.appendChild(script);
  });
}

async function checkGuest() {
  if (GAS_WEB_APP_URL.includes('ここに')) return;

  const result = await jsonp({
    action: 'check',
    guestId,
    key: guestKey
  });

  if (!result.ok) {
    alert(result.message);
    return;
  }

  guestName.textContent = result.guestName;
  document.getElementById('name').value = result.guestName;

  if (result.submitted) {
    formArea.classList.add('hidden');
    submittedMessage.classList.remove('hidden');
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  if (GAS_WEB_APP_URL.includes('ここに')) {
    formMessage.textContent = 'GASのURLを設定してください。';
    return;
  }

  const button = form.querySelector('button');
  button.disabled = true;
  formMessage.textContent = '送信中です...';

  try {
    const result = await jsonp({
      action: 'submit',
      guestId,
      key: guestKey,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      status: document.getElementById('status').value
    });

    if (!result.ok) throw new Error(result.message);

    formArea.classList.add('hidden');
    submittedMessage.classList.remove('hidden');
  } catch (error) {
    formMessage.textContent = error.message;
    button.disabled = false;
  }
});

checkGuest();
