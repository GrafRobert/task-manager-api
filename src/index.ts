import express from 'express'
import cors from 'cors'
import userRouter from './routes/userRouter.js'
import projectRouter from './routes/projectRoutes.js'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.use('/api/users', userRouter)
app.use('/api/projects', projectRouter)

app.get('/', (req, res) => {
    res.send('Serverul Express pentru Task Manager funcționează!');

})

app.listen(port, () => {
    console.log(`Serverul rulează la adresa http://localhost:${port}`);
})