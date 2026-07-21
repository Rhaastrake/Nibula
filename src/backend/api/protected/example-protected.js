'use strict';

/**
 * Mirror of src/backend/api/protected/example-protected.php
 *
 * Protected endpoint: the API key check (X-Api-Key header) runs automatically in
 * the front controller before this file is loaded, so here we just handle logic.
 */

module.exports = ({ method, requestParams, Response }) => {
    if (method !== 'GET') {
        Response.error('Method not allowed', 405);
    }

    //
    // Your endpoint logic here. You can access route parameters in requestParams
    //

    Response.success({
        message: 'Protected endpoint is working',
        params: requestParams,
    });
};
