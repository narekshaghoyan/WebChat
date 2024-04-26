document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search)
  const messageContainer = document.getElementById("displayMessage")
  const msg = params.get('message')
  const status = params.get('status')

  if (msg) {
    if (status === 'success') {
      messageContainer.style.color = 'green'

    } else {
      messageContainer.style.color = 'red'
    }
    messageContainer.innerText = msg
    setTimeout(() => {
      messageContainer.innerText = ''
    }, 3000)
  }
  
})
