const formatter = new Intl.DateTimeFormat('it-IT', {
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit'
});

export function formatTime(value: number | Date): string {
	return formatter.format(value instanceof Date ? value : new Date(value));
}
