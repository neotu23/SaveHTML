document.getElementById('exportBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) {
    document.getElementById('status').textContent = 'No active tab found.';
    return;
  }

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Get the full HTML content including doctype
        let html = document.documentElement.outerHTML;
        if (document.doctype) {
          html = new XMLSerializer().serializeToString(document.doctype) + '\n' + html;
        }
        // Get the title for filename
        const title = document.title || 'page';
        return { html, title };
      },
    });

    if (result && result[0] && result[0].result) {
      const { html, title } = result[0].result;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      // Simple sanitization for filename
      const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '_');
      a.download = `${safeTitle}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      document.getElementById('status').textContent = 'Export successful!';
    } else {
      document.getElementById('status').textContent = 'Failed to retrieve HTML.';
    }
  } catch (err) {
    console.error(err);
    document.getElementById('status').textContent = 'Error: ' + err.message;
  }
});
