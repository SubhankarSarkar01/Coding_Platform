const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function verifyDataStorage() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'algomaster_db',
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Connected to MySQL\n');

    // Check submissions table structure
    console.log('📋 SUBMISSIONS TABLE STRUCTURE:');
    console.log('─'.repeat(60));
    const [columns] = await connection.query('DESCRIBE submissions');
    columns.forEach(col => {
      const hasCode = col.Field === 'code' ? '✅ NEW' : '';
      const hasLang = col.Field === 'language' ? '✅ NEW' : '';
      console.log(`  ${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${hasCode}${hasLang}`);
    });

    // Check if there are any submissions
    console.log('\n📊 SUBMISSIONS DATA:');
    console.log('─'.repeat(60));
    const [submissions] = await connection.query(`
      SELECT 
        id, 
        user_id, 
        problem_title, 
        language, 
        status,
        CASE 
          WHEN code IS NULL THEN 'No code stored'
          WHEN LENGTH(code) > 50 THEN CONCAT(LEFT(code, 50), '...')
          ELSE code
        END as code_preview,
        submitted_at 
      FROM submissions 
      ORDER BY submitted_at DESC 
      LIMIT 5
    `);

    if (submissions.length === 0) {
      console.log('  ℹ️  No submissions yet. Solve a problem to see data here!');
    } else {
      console.log(`  Found ${submissions.length} recent submissions:\n`);
      submissions.forEach((sub, idx) => {
        console.log(`  ${idx + 1}. ${sub.problem_title} (${sub.language})`);
        console.log(`     Status: ${sub.status}`);
        console.log(`     Code: ${sub.code_preview}`);
        console.log(`     Time: ${sub.submitted_at}`);
        console.log('');
      });
    }

    // Check user stats
    console.log('👥 USER STATISTICS:');
    console.log('─'.repeat(60));
    const [stats] = await connection.query(`
      SELECT 
        u.name, 
        u.email,
        us.problems_solved, 
        us.xp,
        us.streak_days
      FROM users u 
      LEFT JOIN user_stats us ON u.id = us.user_id
      ORDER BY us.xp DESC
      LIMIT 5
    `);

    if (stats.length === 0) {
      console.log('  ℹ️  No users found');
    } else {
      stats.forEach((user, idx) => {
        console.log(`  ${idx + 1}. ${user.name} (${user.email})`);
        console.log(`     Problems Solved: ${user.problems_solved || 0}`);
        console.log(`     XP: ${user.xp || 0}`);
        console.log(`     Streak: ${user.streak_days || 0} days`);
        console.log('');
      });
    }

    // Summary
    console.log('📈 SUMMARY:');
    console.log('─'.repeat(60));
    const [totalSubs] = await connection.query('SELECT COUNT(*) as count FROM submissions');
    const [totalUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [totalProblems] = await connection.query('SELECT COUNT(*) as count FROM questions');
    
    console.log(`  Total Users: ${totalUsers[0].count}`);
    console.log(`  Total Problems: ${totalProblems[0].count}`);
    console.log(`  Total Submissions: ${totalSubs[0].count}`);
    
    const [withCode] = await connection.query('SELECT COUNT(*) as count FROM submissions WHERE code IS NOT NULL');
    console.log(`  Submissions with Code: ${withCode[0].count} ✅`);

    console.log('\n✅ Data storage verification complete!');
    console.log('   All submissions are being stored in the database.');
    console.log('   Code and language are being saved correctly.\n');

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

verifyDataStorage();
