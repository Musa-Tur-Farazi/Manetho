require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/neon-serverless');
const { neon } = require('@neondatabase/serverless');
const { sql } = require('drizzle-orm');

async function checkImages() {
  try {
    console.log('Connecting to database.....');

    const queryClient = neon(process.env.DATABASE_URL);
    const db = drizzle(queryClient);

    console.log('Connected! Querying for threads with images...');

    const result = await db.execute(sql`
      SELECT thread_id, title, images 
      FROM threads 
      WHERE images IS NOT NULL 
      LIMIT 5
    `);

    console.log('Found', result.rows.length, 'threads with images:');

    result.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. Thread ID: ${row.thread_id}`);
      console.log(`   Title: ${row.title}`);

      let images;
      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
      } catch (e) {
        images = row.images;
      }

      console.log(`   Images:`, images);

      if (Array.isArray(images)) {
        images.forEach((url, i) => {
          console.log(`   - Image ${i + 1}: ${url}`);
        });
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkImages(); 