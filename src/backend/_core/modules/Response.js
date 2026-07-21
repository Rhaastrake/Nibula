'use strict';

/**
 * Mirror of src/backend/_core/modules/Response.php
 *
 * In PHP the Response helper writes JSON and calls exit() to stop execution.
 * Node has no per-request exit, so each method writes to the response and then
 * throws the HALT sentinel. The front controller catches HALT and stops the
 * dispatch, reproducing the same "the endpoint stops here" behaviour.
 *
 * A fresh, response-bound helper is created per request via createResponse(res)
 * so overlapping async requests never clash (PHP was process-per-request).
 */

// Sentinel thrown to unwind execution after a response has been sent (≈ PHP exit).
const HALT = Symbol('RESPONSE_HALT');

function jsonEncode(obj) {
    // JSON.stringify already leaves unicode unescaped and does not escape slashes,
    // matching PHP's JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES.
    return JSON.stringify(obj);
}

function createResponse(res) {
    return {
        success(data = null, code = 200) {
            res.statusCode = code;
            res.setHeader('Content-Type', 'application/json; charset=UTF-8');
            res.end(jsonEncode({
                status: 'success',
                data: data,
            }));
            throw HALT;
        },

        error(message, code = 400, details = null) {
            res.statusCode = code;
            res.setHeader('Content-Type', 'application/json; charset=UTF-8');
            const body = {
                status: 'error',
                message: message,
                code: code,
            };
            if (details !== null) {
                body.details = details;
            }
            res.end(jsonEncode(body));
            throw HALT;
        },

        noContent() {
            res.statusCode = 204;
            res.end();
            throw HALT;
        },
    };
}

module.exports = { createResponse, HALT };
