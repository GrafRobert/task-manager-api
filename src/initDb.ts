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

    CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'TODO',
        priority VARCHAR(50) DEFAULT 'MEDIUM',
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_members (
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'MEMBER',
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (project_id, user_id)
    
    );

    CREATE TABLE IF NOT EXISTS task_assignees (
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, user_id)
    
    );

     CREATE TABLE task_reviews (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCE tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCE users(id),
        review_text NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    
    );

    ALTER TABLE tasks DROP COLUMN IF EXISTS assigned_to;


    INSERT INTO project_members (project_id, user_id, role)
    SELECT id, user_id, 'OWNER' FROM projects
    ON CONFLICT (project_id, user_id) DO NOTHING;


   


    `;

  try {
        console.log('Încercăm crearea și actualizarea tabelelor pentru colaborare...')
        await pool.query(createUsersTableQuery)
        console.log('Baza de date a fost actualizată cu succes!')
    } catch (error) {
        console.error('Eroare la crearea/actualizarea tabelelor:', error);
    } finally {
        pool.end()
    }
}
createTables()