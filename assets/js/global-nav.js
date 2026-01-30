(function () {
    // 1. Injects Global CSS
    const linkPath = '/assets/css/global.css';
    if (!document.querySelector(`link[href="${linkPath}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = linkPath;
        document.head.appendChild(link);
    }

    // 2. Defines Header HTML
    const headerHTML = `
        <div class="gh-container">
            <a href="/" class="gh-logo">Apexia <span>Lab</span></a>
            <nav class="gh-nav">
                <a href="/" class="gh-link">Home</a>
                <a href="/char-count/" class="gh-link">文字数</a>
                <a href="/garapon/" class="gh-link">ガラポン</a>
            </nav>
        </div>
    `;

    // 3. Injects Header at top of body or before existing header
    const headerElement = document.createElement('header');
    headerElement.id = 'global-header';
    headerElement.innerHTML = headerHTML;

    // Insert as the very first element of body
    document.body.insertBefore(headerElement, document.body.firstChild);
})();
