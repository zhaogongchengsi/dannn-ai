

export function isIdValid(id: string) {
	const idPattern = /^[a-zA-Z0-9_-]+$/;
	return idPattern.test(id)
}
