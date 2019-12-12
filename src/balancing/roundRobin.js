class RoundRobin {
	constructor(pool) {
        this._pool = pool
		this._poolSize = pool.length
		this._currentIndex = 0
	}

	getUpstream() {
		let currentUpstream = this._pool[this._currentIndex++]
		this._currentIndex = this._currentIndex % this._poolSize
		return currentUpstream
	}
}


module.exports = RoundRobin