// security.js - Sichere DOM-Manipulationen ohne innerHTML
class SecureDOM {
    static createSafeElement(tagName, className = '', textContent = '') {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    static createSafeHTML(template, data = {}) {
        // Template mit sicheren Ersetzungen
        const container = document.createElement('div');

        // Sichere Template-Engine ohne innerHTML
        const safeParts = template.split(/{{(\w+)}}/g);
        for (let i = 0; i < safeParts.length; i += 2) {
            if (safeParts[i]) {
                container.appendChild(document.createTextNode(safeParts[i]));
            }
            if (safeParts[i + 1] && data[safeParts[i + 1]]) {
                container.appendChild(document.createTextNode(data[safeParts[i + 1]]));
            }
        }

        return container;
    }

    static showNotification(message, type = 'info') {
        const notification = this.createSafeElement(
            'div',
            `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`,
        );

        const icon = this.createSafeElement('span', 'mr-2');
        icon.textContent = type === 'error' ? '⚠️' : 'ℹ️';

        const text = this.createSafeElement('span', '', message);

        notification.appendChild(icon);
        notification.appendChild(text);

        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
    }

    static createSecureTable(data, headers) {
        const table = this.createSafeElement('table', 'w-full border-collapse');
        const thead = this.createSafeElement('thead');
        const tbody = this.createSafeElement('tbody');

        // Header erstellen
        const headerRow = this.createSafeElement('tr');
        headers.forEach((header) => {
            const th = this.createSafeElement('th', 'border p-2 bg-gray-100', header);
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Daten-Rows erstellen
        data.forEach((row) => {
            const tr = this.createSafeElement('tr');
            Object.values(row).forEach((cell) => {
                const td = this.createSafeElement('td', 'border p-2', String(cell));
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        return table;
    }
}

// Globale sichere Funktionen
window.SecureDOM = SecureDOM;
