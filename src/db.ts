// import { Pool } from 'pg'
// import dotenv from 'dotenv'

// dotenv.config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT || '5432'),
//   database: process.env.DB_NAME,
  
//   // Am adăugat această regulă de SSL obligatorie pentru Supabase / Cloud
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// pool.connect()
//   .then(() => console.log('Conexiune reușită la baza de date PostgreSQL!'))
//   .catch((err) => console.error('Eroare la conectarea cu baza de date:', err));

// export default pool;

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  // Folosim link-ul complet pe care tocmai l-am setat în .env
  connectionString: process.env.DATABASE_URL,
  
  // Asta rezolvă eroarea de SSL cu Supabase!
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;