const electron = require('electron')
const {ipcRenderer} = electron

const add_btn = document.querySelector('#add-button')
const close_btn = document.getElementById('close-btn')
const form = document.querySelector('form')
const list = document.querySelector('#item-list')
// const btn = document.querySelector('.delete-btn')

if (form !== null) {
  form.addEventListener('submit', submitForm)
}

if (list !== null) {
  add_btn.addEventListener('click', openForm)
  close_btn.addEventListener('click', function(e) {
    e.preventDefault()
    toggleShow()
  })
  // btn.addEventListener('click', removeItem)
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
    if (payload.rows[item].doc.completed == true) {
      li.classList.add('completed')
    } else {
      li.classList.remove('completed')
    }
    let text = document.createTextNode(payload.rows[item].doc.title)
    li.appendChild(text)
    let btn = document.createElement('span')
    btn.className = 'delete-btn'
    btn.appendChild(document.createTextNode('X'))
    btn.addEventListener('click', removeItem)
    li.appendChild(btn)
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
  let _item = e.target.textContent.slice(0,-1)
  ipcRenderer.send('item:toggle', _item)
}

function removeItem(e) {
  let _item = e.target.parentNode.textContent.slice(0, -1)
  ipcRenderer.send('item:delete', _item)
  if (list.innerHTML.trim().length == 0) {
    list.classList.toggle('collection')
  }
}
