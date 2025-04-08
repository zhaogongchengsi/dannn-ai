console.log('server')

setInterval(() => {
	console.log('server interval')
	process.send?.('server interval')
	// process.exit(0)
}, 1000 * 3)