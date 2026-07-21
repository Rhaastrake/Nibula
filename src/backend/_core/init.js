'use strict';

/**
 * Mirror of src/backend/_core/init.php
 *
 * init.php did three things:
 *   1. registered a global exception handler that turns any throwable into a
 *      500 JSON response (verbose in debug, generic in production);
 *   2. registered an error handler that promoted PHP warnings to exceptions;
 *   3. loaded config.php.
 *
 * In Node there is no per-request global handler, so the exception-to-500
 * translation lives in the front controller (index.js), which calls
 * handleException() below. Here we expose config loading and that helper.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load configuration. dirname(__dirname) in PHP pointed at the folder holding
 * config.php (the backend root). Here that is the parent of _core.
 * If config.js is missing (e.g. fresh clone) we fall back to example.config.js,
 * mirroring the "copy example.config to config" guidance.
 */
function loadConfig() {
    const backendRoot = path.join(__dirname, '..');
    const configPath = path.join(backendRoot, 'config.js');
    const examplePath = path.join(backendRoot, 'example.config.js');

    if (fs.existsSync(configPath)) {
        return require(configPath);
    }
    return require(examplePath);
}

/**
 * Turn any thrown error into a 500 response, mirroring set_exception_handler.
 * @param {Error} exception
 * @param {object} config
 * @param {object} Response request-bound helper
 */
function handleException(exception, config, Response) {
    const isDebug = (config.APP_ENV || 'production') !== 'production';
    Response.error(
        isDebug ? exception.message : 'Internal server error',
        500,
        isDebug ? { stack: exception.stack } : null
    );
}

module.exports = { loadConfig, handleException };
