'use strict';

/**
 * Mirror of src/backend/api/public/example-public.php
 *
 * Public endpoint: no API key required. Receives the request context and calls
 * the request-bound Response helper, exactly like the PHP file used the global
 * Response class and $method / $requestParams.
 */

module.exports = ({ method, requestParams, Response }) => {
    if (method !== 'GET') {
        Response.error('Method not allowed', 405);
    }

    //
    // Your endpoint logic here. You can access route parameters in requestParams
    //

    Response.success({
        message: 'Public endpoint is working',
        params: requestParams,
    });
};
