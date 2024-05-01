import {
    default as authRoutes,
} from './src/route/auth.route.js'
import {
    default as userRoutes,
} from './src/route/user.route.js'

import Table from "ascii-table";

const table = new Table('Route Table');

const routes = (app) => {

// Apply the rate limiting middleware to all requests
    app.use('/api/v1/auth', authRoutes)
    app.use((err, req, res, next) => {
        console.log(err);
        res.status(500).json({error: err.message})
    })
    app.use((req, res) => {
        res.status(404).json({error: "404", message: "Not Found"})
    })

    app.use((req, res, next) => {
        res.status(403).json({error: "403", message: "Forbidden"})
    })

    const COLUMNS_NAME = ['Root Path', 'Method', 'Path'];
    table.setHeading(...COLUMNS_NAME);

    [
        {name: '/auth', route: authRoutes},
        {name: '/user', route: userRoutes},
    ].forEach(router => {
        router.route.stack.forEach(layer => {
            if (layer.route) {
                const {path, methods} = layer.route;
                Object.keys(methods).forEach(method => {
                    table.addRow(router.name, method.toUpperCase(), path);
                })
            }
        })

        //     set empty row
        table.addRow();
    })

    console.log(table.toString());
}


export default routes;