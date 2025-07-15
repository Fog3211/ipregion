/**
 * Shared IP utility functions
 * Used across API endpoints and import scripts
 */

/**
 * Convert IP address string to bigint integer
 * @param ip IP address in format "192.168.1.1"
 * @returns BigInt representation of the IP
 */
export function ipToInt(ip: string): bigint {
	const parts = ip.split('.').map(Number);
	if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
		throw new Error('Invalid IP address format');
	}
	return BigInt(parts[0]! * 256 * 256 * 256 + parts[1]! * 256 * 256 + parts[2]! * 256 + parts[3]!);
}

/**
 * Convert bigint integer to IP address string
 * @param int BigInt representation of IP
 * @returns IP address in format "192.168.1.1"
 */
export function intToIp(int: bigint): string {
	const num = Number(int);
	return [
		Math.floor(num / (256 * 256 * 256)) % 256,
		Math.floor(num / (256 * 256)) % 256,
		Math.floor(num / 256) % 256,
		num % 256
	].join('.');
}

/**
 * Generate random IP address within specified range
 * @param startIp Start IP address (e.g., "192.168.1.0")
 * @param endIp End IP address (e.g., "192.168.1.255")
 * @returns Random IP within the range
 */
export function generateRandomIpInRange(startIp: string, endIp: string): string {
	const startInt = ipToInt(startIp);
	const endInt = ipToInt(endIp);
	
	// Generate random integer within range
	const range = endInt - startInt;
	const randomOffset = BigInt(Math.floor(Math.random() * Number(range + 1n)));
	const randomIpInt = startInt + randomOffset;
	
	return intToIp(randomIpInt);
} 