import express from 'express'
// Nu mai avem nevoie de importul 'cors', folosim propria noastră soluție
import userRouter from './routes/userRouter.js'
import projectRouter from './routes/projectRoutes.js'
import taskRouter from './routes/taskRoutes.js'

const app = express()

// --- FIX DEFINITIV PENTRU CORS PE VERCEL ---
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173', 
    'https://task-manager-ui-chi.vercel.app'
  ];
  
  const origin = req.headers.origin as string;
  
  if (allowedOrigins.includes(origin)) {
     res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Orice cerere OPTIONS (preflight) primește instant status 200 OK!
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json())

// --- RUTELE CORECTATE ---
// Am scos '/api' pentru că frontend-ul tău cere direct '/users', '/projects', etc.
app.use('/users', userRouter)
app.use('/projects', projectRouter)
app.use('/tasks', taskRouter)

app.get('/', (req, res) => {
    res.send('Serverul Express pentru Task Manager funcționează!');
})

// Pornirea serverului (pe Vercel se ignoră, local merge pe portul 3000)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Serverul rulează pe adresa http://localhost:${PORT}`);
    });
}

// Exportul magic pentru Vercel
export default app;
