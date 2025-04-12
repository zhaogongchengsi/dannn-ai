import { room } from '../../../app/base/index'

console.log('room', process.type)

room.onRoomCreated((rooms) => {
	console.log('Room created:', rooms)
})
