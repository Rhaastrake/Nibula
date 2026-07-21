'use strict';

/**
 * Mirror of src/backend/_core/modules/RateLimiter.php
 *
 * Same algorithm and same on-disk format: one JSON file per IP under ../../cache,
 * holding an array of request timestamps. Old timestamps outside the window are
 * pruned, the current one appended, and if the count exceeds the limit a 429 is
 * returned (with a Retry-After header) through the request-bound Response helper.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class RateLimiter {
    /**
     * @param {string} ip
     * @param {number} maxRequests
     * @param {number} windowSeconds
     * @param {object} Response  request-bound helper from createResponse(res)
     * @param {object} res       raw http response (to set Retry-After)
     */
    static check(ip, maxRequests = 60, windowSeconds = 60, Response, res) {
        const cacheDir = path.join(__dirname, '..', '..', 'cache');

        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true, mode: 0o755 });
        }

        const hash = crypto.createHash('md5').update(ip).digest('hex');
        const cacheFile = path.join(cacheDir, 'rl_' + hash + '.json');
        const now = Math.floor(Date.now() / 1000);
        let data = [];

        if (fs.existsSync(cacheFile)) {
            try {
                data = JSON.parse(fs.readFileSync(cacheFile, 'utf8')) || [];
            } catch (e) {
                data = [];
            }
        }

        data = data.filter((ts) => ts > (now - windowSeconds));
        data.push(now);

        // LOCK_EX equivalent: an exclusive write. Node's writeFileSync is atomic
        // enough for this single-process model.
        fs.writeFileSync(cacheFile, JSON.stringify(data));

        if (data.length > maxRequests) {
            res.setHeader('Retry-After', String(windowSeconds));
            Response.error('Too Many Requests', 429);
        }
    }
}

module.exports = RateLimiter;
