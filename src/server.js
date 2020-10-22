const app = require('./app');
const { PORT } = require('./config')

const NODE_ENV = process.env.NODE_ENV;

app.listen(PORT, () => {
    console.log(`Server listening in ${NODE_ENV} mode at http://localhost:${PORT}`);
    

    
});