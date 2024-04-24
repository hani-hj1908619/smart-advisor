
const mockSessionMiddleware = (handler) => async (req, res) => {
    // Ensure that req.session is properly initialized
    if (!req.session) {
        req.session = {};
    }

    // Call the original handler
    return handler(req, res);
};

export default mockSessionMiddleware;
