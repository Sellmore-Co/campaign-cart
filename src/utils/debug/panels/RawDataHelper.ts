/**
 * Helper for generating raw data content with copy functionality
 */

export class RawDataHelper {
  public static generateRawDataContent(data: any): string {
    const dataStr = JSON.stringify(data, null, 2);
    // Generate a unique ID for this instance to avoid conflicts
    const uniqueId = `copy-btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return `
      <style>
        .raw-data-wrapper {
          position: relative;
          height: auto;
          background: #0f0f0f;
        }
        .copy-button-fixed {
          position: sticky;
          top: 12px;
          float: right;
          margin: 12px;
          background: rgba(60, 125, 255, 0.9);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          z-index: 100;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(10px);
        }
        .copy-button-fixed:hover {
          background: rgba(60, 125, 255, 1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(60, 125, 255, 0.3);
        }
        .copy-button-fixed:active {
          transform: translateY(0);
        }
        .copy-button-fixed.copied {
          background: rgba(76, 175, 80, 0.9);
        }
        .copy-button-fixed.copied:hover {
          background: rgba(76, 175, 80, 1);
        }
        .json-content {
          padding: 20px;
          padding-top: 1rem;
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          font-size: 12px;
          line-height: 1.6;
          color: #e6e6e6;
          white-space: pre;
          word-break: break-all;
        }
      </style>
      <div class="raw-data-wrapper">
        <button id="${uniqueId}" class="copy-button-fixed" onclick="
          (function() {
            const btn = document.getElementById('${uniqueId}');
            const dataToCopy = ${JSON.stringify(dataStr).replace(/"/g, '&quot;').replace(/'/g, '\\\'')};
            navigator.clipboard.writeText(dataToCopy).then(() => {
              btn.innerHTML = '<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\'><path d=\\'M9,5H7A2,2 0 0,0 5,7V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V7A2,2 0 0,0 17,5H15M12,2L14,5H10L12,2M10,18L7,15L8.41,13.59L10,15.17L15.59,9.59L17,11L10,18Z\\'/></svg> Copied!';
              btn.classList.add('copied');
              setTimeout(() => {
                btn.innerHTML = '<svg width=\\'14\\' height=\\'14\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\'><path d=\\'M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z\\'/></svg> Copy';
                btn.classList.remove('copied');
              }, 2000);
            }).catch(err => {
              console.error('Failed to copy:', err);
            });
          })();
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
          </svg>
          Copy
        </button>
        <div class="json-content">${dataStr}</div>
      </div>
    `;
  }
}