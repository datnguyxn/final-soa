import {
    default as emailRoutes
} from './src/route/email.route.js';

const routes = (app) => {
    app.use('/api/email', emailRoutes)
}


export default routes;