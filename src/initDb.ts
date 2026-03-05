import pool from './db.js'

const createTables = async () => {

    const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'Developer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
    );
    `;

    try {
        console.log('Incercam crearea tabelelor...')
        await pool.query(createUsersTableQuery)
        console.log('Tabelul "users" a fost creat cu succes (sau exista deja)!')
    }catch (error){
        console.error('Eroare la crearea tabelelor:', error);
    }finally{
        pool.end()
    }
}
createTables()