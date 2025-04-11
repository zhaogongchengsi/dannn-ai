import { room } from '../../../app/base/index'

room.onRoomCreated((rooms) => {
	console.log('Room created:', rooms)
})
