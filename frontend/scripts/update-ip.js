const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    const candidates = [];

    for (const name of Object.keys(interfaces)) {
        const lowerName = name.toLowerCase();
        // Ignore virtual adapters (WSL, Hyper-V, VirtualBox, VMware, VPN, Loopback)
        if (
            lowerName.includes('virtual') ||
            lowerName.includes('vethernet') ||
            lowerName.includes('vmware') ||
            lowerName.includes('wsl') ||
            lowerName.includes('loopback') ||
            lowerName.includes('npcap') ||
            lowerName.includes('bluetooth') ||
            lowerName.includes('vbox')
        ) {
            continue;
        }

        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                candidates.push({ name, address: iface.address });
            }
        }
    }

    if (candidates.length > 0) {
        // Prefer Wi-Fi or Wireless or Ethernet interfaces
        const preferred = candidates.find(
            (c) =>
                c.name.toLowerCase().includes('wi-fi') ||
                c.name.toLowerCase().includes('wifi') ||
                c.name.toLowerCase().includes('ethernet') ||
                c.name.toLowerCase().includes('eth') ||
                c.name.toLowerCase().includes('wlan')
        );
        return preferred ? preferred.address : candidates[0].address;
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

