export function templateReplace(template: string, data: Record<string, string>) {
	return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
		return key in data ? data[key] : match;
	});
}
