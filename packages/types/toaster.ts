export interface Toaster {
	/**
	 * The type of the toast
	 */
	content: string
	/**
	 * The duration in milliseconds to show the toast
	 */
	duration?: number

	/**
	 * The position of the toast
	 */
	position?: "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
	/**
	 * The type of the toast
	 */
	type?: "error" | "info" | "success" | "default" | "normal" | "warning" | "loading"
}
