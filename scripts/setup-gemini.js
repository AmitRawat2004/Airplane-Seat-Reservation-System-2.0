#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Gemini API Integration Setup\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupGemini() {
  try {
    console.log('This script will help you set up Gemini API integration for your Airplane Seat Reservation System.\n');

    // Check if .env file exists
    const envPath = path.join(__dirname, '..', 'backend', '.env');
    const envExamplePath = path.join(__dirname, '..', 'backend', '.env.example');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found in backend directory');
      
      if (fs.existsSync(envExamplePath)) {
        const copyExample = await askQuestion('Would you like to copy .env.example to .env? (y/n): ');
        if (copyExample.toLowerCase() === 'y') {
          fs.copyFileSync(envExamplePath, envPath);
          console.log('✅ Created .env file from .env.example');
        } else {
          console.log('Please create a .env file in the backend directory with your configuration.');
          process.exit(1);
        }
      } else {
        console.log('Please create a .env file in the backend directory with your configuration.');
        process.exit(1);
      }
    }

    // Get Gemini API key
    console.log('\n📝 Gemini API Key Setup:');
    console.log('1. Visit https://aistudio.google.com/');
    console.log('2. Sign in with your Google account');
    console.log('3. Click "Get API key" to generate a new key');
    console.log('4. Copy the generated API key\n');

    const apiKey = await askQuestion('Enter your Gemini API key: ');
    
    if (!apiKey || apiKey.trim() === '') {
      console.log('❌ API key is required');
      process.exit(1);
    }

    // Update .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${apiKey.trim()}`);
    } else {
      envContent += `\n# AI Configuration\nGEMINI_API_KEY=${apiKey.trim()}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env file with Gemini API key');

    // Check if dependencies are installed
    const packageJsonPath = path.join(__dirname, '..', 'backend', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.dependencies['@google/generative-ai']) {
      console.log('\n📦 Installing Gemini AI dependency...');
      const { execSync } = require('child_process');
      try {
        execSync('npm install @google/generative-ai', { 
          cwd: path.join(__dirname, '..', 'backend'),
          stdio: 'inherit' 
        });
        console.log('✅ Installed @google/generative-ai package');
      } catch (error) {
        console.log('❌ Failed to install dependency. Please run: npm install @google/generative-ai');
      }
    } else {
      console.log('✅ @google/generative-ai dependency already installed');
    }

    // Test API connection
    console.log('\n🧪 Testing Gemini API connection...');
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent("Hello, this is a test message.");
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini API connection successful!');
      console.log(`Test response: ${text.substring(0, 100)}...`);
    } catch (error) {
      console.log('❌ Gemini API connection failed:', error.message);
      console.log('Please check your API key and try again.');
    }

    console.log('\n🎉 Setup Complete!');
    console.log('\nNext steps:');
    console.log('1. Start your backend server: cd backend && npm run dev');
    console.log('2. Test the AI endpoints using the Postman collection');
    console.log('3. Integrate the AI components into your frontend');
    console.log('4. Check the GEMINI_INTEGRATION_GUIDE.md for detailed usage instructions');
    
    console.log('\n📚 Available AI Features:');
    console.log('• Dynamic pricing recommendations');
    console.log('• Intelligent flight recommendations');
    console.log('• Smart seat selection assistance');
    console.log('• AI customer support chatbot');
    console.log('• Flight delay predictions');
    console.log('• Automated customer messaging');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupGemini();
