import { Player } from '../../server/entity/player';
import assert from 'assert';

describe('Player', () => {
	describe('lastActive', () => {
		it('should update every time the Player is modified', async () => {
			const player = new Player();
			player.connectionId = 'a';
			player.name = 'b';

			await player.save();

			const oldLastActive = player.lastActive;

			await player.save();
			await player.reload();

			const newLastActive = player.lastActive;

			assert.notStrictEqual(oldLastActive, newLastActive);
		});
	});
});
