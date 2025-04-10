import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { io } from "socket.io-client";
import type { AppRouter } from '../../../app/main/server/router'

const host = `127.0.0.1`;

export function createClient() {
	if (
		typeof process === 'undefined' ||
		typeof process.env === 'undefined' ||
		typeof process.env.PORT === 'undefined'
	) {
		throw new Error('PORT is not defined')
	}

	const port = process.env.PORT

	const url = `http://${host}:${port}/`
	const ws = `ws://${host}:${port}/`

	const trpc = createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url,
			}),
		],
	});

	const socket = io(ws, {
		reconnectionDelayMax: 10000,
	});

	return {
		trpc,
		socket,
	}
}
