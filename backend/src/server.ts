import express from 'express'
//import { createServer } from 'https'
import { createServer } from 'http'
import { config, connectDB } from './config'
import { configureRoutes } from './routes'
import { configureMiddleware } from './middlewares'
import cluster from 'cluster'
import { cpus } from 'os'
import fs from 'fs'
import { createNewReceipt } from './controllers/receipts'

// Connect and get reference to db
let db: any
;(async () => {
    db = await connectDB()
})()


//read in certificates
/*
let key = fs.readFileSync(__dirname +'/privkey.pem')
let cert = fs.readFileSync(__dirname + '/fullchain.pem')

var options = {
    key: key,
    cert: cert
}
*/
// Init express app
const app = express()

// Config Express middleware
configureMiddleware(app)

// Set-up routes
configureRoutes(app)

// Start server and listen for connections
const httpServer = createServer(app)

// Get number of CPUs
const numCPUs = cpus().length

if (cluster.isPrimary) {
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        // create a new worker process
        cluster.fork()
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
        // fork a new worker process
        cluster.fork()
    })
} else {
    httpServer.listen(config.PORT || 5000, () => {
        console.info(
            `GEMA \`/api/v1/\` Server started on `,
            httpServer.address(),
            `PID ${process.pid}\n`
        )
    })
}

export { app }
