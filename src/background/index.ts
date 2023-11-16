chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.create({
    url: 'index.html',
  })
})

// const app = firebase.initializeApp(config)
// const auth = app.auth()
// const signInWithPopup = () => {
//   const provider = new firebase.auth.GoogleAuthProvider()
//   return auth.signInWithPopup(provider).catch((error) => {
//     console.log(error)
//   })
// }
