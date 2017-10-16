const electron = require('electron')
const {ipcRenderer} = electron

const add_btn = document.querySelector('#add-button')
const close_btn = document.getElementById('close-btn')
const form = document.querySelector('form')
const list = document.querySelector('#item-list')

if (form !== null) {
  form.addEventListener('submit', submitForm)
}

if (list !== null) {
  add_btn.addEventListener('click', openForm)
  close_btn.addEventListener('click', function(e) {
    e.preventDefault()
    toggleShow()
  })
  list.addEventListener('dblclick', removeItem)
  list.addEventListener('click', toggleItem)
}

function submitForm(e) {
  e.preventDefault()
  const item = document.querySelector('#item').value.trim()
  if (item.length != 0) {
    ipcRenderer.send('item:add', item)
  } else {
    ipcRenderer.send('close:add')
  }
}

function openForm(e) {
  ipcRenderer.send('form:open', e)
}

ipcRenderer.on('app:ready', (event, message) => {
  document.getElementById('head').innerHTML = `${message}`
})

ipcRenderer.on('list:repopulate', (e, payload) => {
  let i = payload.rows.length

  list.innerHTML = ''

  for (item = 0; item < i; item++) {

    list.className = 'collection'
    let li = document.createElement('li')
    li.className = 'collection-item'
    let text = document.createTextNode(payload.rows[item].doc.title)
    li.appendChild(text)
    list.appendChild(li)
  }

})

ipcRenderer.on('item:clear', function() {
  list.innerHTML = ''
  list.classList.toggle('collection')
})

ipcRenderer.on('help:show', function() {
  toggleShow()
})

function toggleShow(e) {
  document.getElementById('help-screen').classList.toggle('no-show')
}

function toggleItem(e) {
  e.target.classList.toggle('done')
}

function removeItem(e) {
  let _item = e.target.innerHTML
  ipcRenderer.send('item:delete', _item)
  if (list.innerHTML.trim().length == 0) {
    list.classList.toggle('collection')
  }
}
