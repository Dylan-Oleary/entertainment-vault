exports.show = (req, res) => {
    const path = req.path === "/" ? "/home" : req.path;

    res.render(`pages${path}`);
};