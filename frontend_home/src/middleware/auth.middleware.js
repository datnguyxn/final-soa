function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect("http://localhost:3002/");
}

export default isAuthenticated;