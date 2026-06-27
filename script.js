const messagePage = document.getElementById('messagePage');
const invitationPage = document.getElementById('invitationPage');

messagePage.addEventListener('click', () => {
  messagePage.classList.add('hidden');
  invitationPage.classList.remove('hidden');
});
