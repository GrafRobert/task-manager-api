import express from 'express'
import cors from 'cors'
import userRouter from './routes/userRouter.js'
import projectRouter from './routes/projectRoutes.js'
import taskRouter from './routes/taskRoutes.js'

const app = express()
//const port = 3000
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://task-manager-ui-chi.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json())

app.use('/api/users', userRouter)
app.use('/api/projects', projectRouter)
app.use('/api/tasks', taskRouter)

app.get('/', (req, res) => {
    res.send('Serverul Express pentru Task Manager funcționează!');

})

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Serverul rulează pe adresa http://localhost:${PORT}`);
    });
}

export default app
module.exports = app