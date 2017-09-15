const electron = require('electron')
const {ipcRenderer} = electron

const form = document.querySelector('form')
const list = document.querySelector('#item-list')
if (form !== null) {
  form.addEventListener('submit', submitForm)
}

if (list !== null) {
  list.addEventListener('dblclick', removeItem)
  list.addEventListener('click', toggleItem)
}

function submitForm(e) {
  e.preventDefault()
  const item = document.querySelector('#item').value.trim()
  ipcRenderer.send('item:add', item)
}

ipcRenderer.on('item:add', function (e, item) {
  list.className = 'collection'
  let li = document.createElement('li')
  li.className = 'collection-item'
  let text = document.createTextNode(item)
  li.appendChild(text)
  list.appendChild(li)
})

ipcRenderer.on('item:clear', function () {
  list.innerHTML = ''
  list.classList.toggle('collection')
})

function toggleItem(e) {
  e.target.classList.toggle('done')
}

function removeItem(e) {
  e.target.remove()
  if (list.innerHTML.trim().length == 0) {
    list.classList.toggle('collection')
  }
}
