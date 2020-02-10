const server = require('http').createServer()
const io = require('socket.io')(server)
const { db } = require('./database')

const SOCKET_PORT = 8081

const initWebSocket = () => {
  io.on('connection', async client => {
    const usernameToWatch = client.handshake.query.username
    console.log(`Listening for changes to ${usernameToWatch}`)
    const pipeline = [
      {
        $match: {
          $and: [
            { 'fullDocument.between': { $all: [usernameToWatch] } }
            // { 'fullDocument.lastMessage.sender': { $ne: usernameToWatch } }
          ]
        }
      }
    ]
    const watchOptions = {
      fullDocument: 'updateLookup'
    }
    const conversations = await db.collection('conversations')
    const conversationStrem = await conversations.watch(pipeline, watchOptions)
    conversationStrem.on('change', updatedDocument => {
      console.log('CHANGED')
      const {
        updateDescription: { updatedFields, removedFields }
      } = updatedDocument
      const { lastMessage: newMessage } = updatedFields
      sendMessageToClient({ io, message: newMessage })
    })
    client.on('disconnect', () => {
      console.log('client disconnect...', client.id)
    })

    client.on('error', err => {
      console.log('received error from client:', client.id)
      console.log(err)
    })
  })

  server.listen(SOCKET_PORT, err => {
    if (err) throw err
    console.log(`listening on port ${SOCKET_PORT}`)
  })
}

const sendMessageToClient = ({ io, message }) => {
  io.sockets.emit('receiveMessage', {
    message
  })
}

module.exports = {
  initWebSocket
}
