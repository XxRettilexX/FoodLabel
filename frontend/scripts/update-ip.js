const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const ip = getLocalIp();
const envPath = path.join(__dirname, '..', '.env');
const apiPath = `http://${ip}:8000/api/v1`;

let content = '';
if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
}

const regex = /^EXPO_PUBLIC_API_URL=.*$/m;
const newLine = `EXPO_PUBLIC_API_URL=${apiPath}`;

if (regex.test(content)) {
    content = content.replace(regex, newLine);
} else {
    content += (content.endsWith('\n') ? '' : '\n') + newLine + '\n';
}

fs.writeFileSync(envPath, content);
console.log(`✅ EXPO_PUBLIC_API_URL updated to: ${apiPath}`);
