import express from 'express'

const app = express()

app.get('/api1', (req, res) => {
  res.setHeader('Set-cookie', 'ayou=1')
  res.end()
})

app.get('/api2', (req, res) => {
  console.log(req.headers.get('set-cookie'))
  res.end()
})

app.listen(8888)
