import { Application } from 'express'

export const configureRoutes = (app: Application) => {
    app.use('/api/v1/auth', require('./api/auth'))
    app.use('/api/v1/profile', require('./api/profile'))
    app.use('/api/v1/brands', require('./api/brands'))
    app.use('/api/v1/notifications', require('./api/notifications'))

    // Health Check Endpoint
    app.use('/api/v1/status', (req, res) => {
        res.status(200).send(`Ok ${process.pid}`)
    })

    // Fallback Endpoint
    app.use('/', (req, res) => {
        res.status(200).send(`Ok ${process.pid}`)
    })
}
