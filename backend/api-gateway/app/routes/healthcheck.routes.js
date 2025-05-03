const healthcheck = (req, res) => {
    res.status(200)
    .json({
        message: 'OK',
        string: 'Finternet is future',
        timestamp: new Date().toISOString(),
    })
}

export default healthcheck;