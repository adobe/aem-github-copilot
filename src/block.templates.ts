export const blockTemplates = {
  Tabs: {
    tree: {
      name: "tabs",
      type: "directory",
      children: [
        {
          name: "tabs.js",
          type: "file",
        },
        {
          name: "tabs.css",
          type: "file",
        },
      ],
    },
    files: [
      {
        type: "javascript",
        path: "blocks/tabs/tabs.js",
        content: `
      // eslint-disable-next-line import/no-unresolved

      function hasWrapper(el) {
        return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
      }

      export default async function decorate(block) {
        // build tablist
        const tablist = document.createElement('div');
        tablist.className = 'tabs-list';
        tablist.setAttribute('role', 'tablist');

        // decorate tabs and tabpanels
        const tabs = [...block.children].map((child) => child.firstElementChild);
        tabs.forEach((tab, i) => {
          const id = "tab-" + i;

          // decorate tabpanel
          const tabpanel = block.children[i];
          tabpanel.className = 'tabs-panel';
          tabpanel.id = \`tabpanel-\${id}\`;
          tabpanel.setAttribute('aria-hidden', !!i);
          tabpanel.setAttribute('aria-labelledby', \`tab-\${id}\`);
          tabpanel.setAttribute('role', 'tabpanel');
          if (!hasWrapper(tabpanel.lastElementChild)) {
            tabpanel.lastElementChild.innerHTML = \`<p>\${tabpanel.lastElementChild.innerHTML}</p>\`;
          }

          // build tab button
          const button = document.createElement('button');
          button.className = 'tabs-tab';
          button.id = \`tab-\${id}\`;
          button.innerHTML = tab.innerHTML;
          button.setAttribute('aria-controls', \`tabpanel-\${id}\`);
          button.setAttribute('aria-selected', !i);
          button.setAttribute('role', 'tab');
          button.setAttribute('type', 'button');
          button.addEventListener('click', () => {
            block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
              panel.setAttribute('aria-hidden', true);
            });
            tablist.querySelectorAll('button').forEach((btn) => {
              btn.setAttribute('aria-selected', false);
            });
            tabpanel.setAttribute('aria-hidden', false);
            button.setAttribute('aria-selected', true);
          });
          tablist.append(button);
          tab.remove();
        });

        block.prepend(tablist);
      }
    `,
        name: "tabs.js",
      },
      {
        type: "css",
        path: "blocks/tabs/tabs.css",
        content: `
      .tabs .tabs-list {
        display: flex;
        gap: 8px;
        max-width: 100%;
        overflow-x: auto;
      }

      .tabs .tabs-list button {
        flex: 0 0 max-content;
        margin: 0;
        border: 1px solid black;
        border-radius: 0;
        padding: 8px 16px;
        background-color: white;
        color: initial;
        transition: background-color 0.2s;
      }

      .tabs .tabs-list button[aria-selected="true"] {
        border-bottom: 1px solid black;
        background-color: white;
        cursor: initial;
      }
      
      .tabs .tabs-panel {
        margin-top: -1px;
        padding: 0 16px;
        border: 1px solid black;
        overflow: auto;
      }

      .tabs .tabs-panel[aria-hidden="true"] {
        display: none;
      }
    `,
        name: "tabs.css",
      },
    ],
    mdtable: `
| tabs       |              |
|----------- |--------------|
| Tab One    | tab one text | 
| Tab Two    | tab two text |
`,
    inputHtml: `
<div class="tabs block" data-block-name="tabs" data-block-status="loaded">
  <div>
    <div>Tab One</div>
    <div>tab one text</div>
  </div>
  <div>
    <div>Tab Two</div>
    <div>tab two text</div>
  </div>
</div>
  `,
  },
  Table: {
    tree: {
      name: "table",
      type: "directory",
      children: [
        {
          name: "table.js",
          type: "file",
        },
        {
          name: "table.css",
          type: "file",
        },
      ],
    },
    files: [
      {
        type: "javascript",
        path: "blocks/table/table.js",
        content: `
function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) {
    table.append(thead);
  }
  table.append(tbody);

  [...block.children].forEach((child, i) => {
    const row = document.createElement('tr');
    if (header && i === 0) thead.append(row);
    else tbody.append(row);
    [...child.children].forEach((col) => {
      const cell = buildCell(header ? i : i + 1);
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
  });
  block.innerHTML = '';
  block.append(table);
}
    `,
        name: "table.js",
      },
      {
        type: "css",
        path: "blocks/table/table.css",
        content: `
.table {
  width: 100%;
  overflow-x: auto;
}

.table table {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.table table thead tr {
  border-top: 2px solid;
  border-bottom: 2px solid;
}

.table table tbody tr {
  border-bottom: 1px solid;
}

.table table th {
  font-weight: 700;
}

.table table th,
.table table td {
  padding: 8px 16px;
  text-align: left;
}

/* no header variant */
.table.no-header table tbody tr {
  border-top: 1px solid;
}

.table.striped tbody tr:nth-child(odd) {
  background-color: white;
}

.table.bordered table th,
.table.bordered table td {
  border: 1px solid;
}
    `,
        name: "table.css",
      },
    ],
    mdtable: `
| table    |         |
|----------|---------|
| Header1  | Header2 |
| value1   | value2  |
`,
    inputHtml: `
  <div class="table">
          <div>
            <div>Header1</div>
            <div>Header2</div>
          </div>
          <div>
            <div>value1</div>
            <div>value2</div>
          </div>
    </div>
      `,
  },
  Quote: {
    tree: {
      name: "quote",
      type: "directory",
      children: [
        {
          name: "quote.js",
          type: "file",
        },
        {
          name: "quote.css",
          type: "file",
        },
      ],
    },
    files: [
      {
        type: "javascript",
        path: "blocks/quote/quote.js",
        content: `
        function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

export default async function decorate(block) {
  const [quotation, attribution] = [...block.children].map((c) => c.firstElementChild);
  const blockquote = document.createElement('blockquote');
  // decorate quotation
  quotation.className = 'quote-quotation';
  if (!hasWrapper(quotation)) {
    quotation.innerHTML = \`<p>$\{quotation.innerHTML}</p>\`;
  }
  blockquote.append(quotation);
  // decoration attribution
  if (attribution) {
    attribution.className = 'quote-attribution';
    if (!hasWrapper(attribution)) {
      attribution.innerHTML = \`<p>\${attribution.innerHTML}</p>\`;
    }
    blockquote.append(attribution);
    const ems = attribution.querySelectorAll('em');
    ems.forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = em.innerHTML;
      em.replaceWith(cite);
    });
  }
  block.innerHTML = '';
  block.append(blockquote);
}
`,
        name: "quote.js",
      },
      {
        type: "css",
        path: "blocks/quote/quote.css",
        content: `
        .quote blockquote {
  margin: 0 auto;
  padding: 0 32px;
  max-width: 700px;
}

.quote blockquote .quote-quotation {
  font-size: 120%;
}

.quote blockquote .quote-quotation > :first-child {
  text-indent: -0.6ch;
}

.quote blockquote .quote-quotation > :first-child::before,
.quote blockquote .quote-quotation > :last-child::after {
  line-height: 0;
}

.quote blockquote .quote-quotation > :first-child::before {
  content: "“";
}

.quote blockquote .quote-quotation > :last-child::after {
  content: "”";
}

.quote blockquote .quote-attribution {
  text-align: right;
}

.quote blockquote .quote-attribution > :first-child::before {
  content: "—";
}
`,
        name: "quote.css",
      },
    ],
    mdtable: `
  | quote       |
  | ------------| 
  | Quotation   |  
  | Attribution |     
`,
    inputHtml: `
  <div class="quote block" data-block-name="quote" data-block-status="loaded">
          <div>
            <div>Quotation</div>
            <div>Quotation text</div>
          </div>
          <div>
            <div>Attribution</div>
            <div>Attribution text</div>
              < /div>
              < /div>
    `,
  },
  Accordion: {
    tree: {
      name: "accordion",
      type: "directory",
      children: [
        {
          name: "accordion.js",
          type: "file",
        },
        {
          name: "accordion.css",
          type: "file",
        },
      ],
    },
    files: [
      {
        type: "javascript",
        path: "blocks/accordion/accordion.js",
        content: `
        function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (!hasWrapper(summary)) {
      summary.innerHTML = \`<p>\${summary.innerHTML}</p>\`;
    }
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    if (!hasWrapper(body)) {
      body.innerHTML = \`<p>\${body.innerHTML}</p>\`;
    }
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
};
`,
        name: "accordion.js",
      },
      {
        type: "css",
        path: "blocks/accordion/accordion.css",
        content: `
        .accordion details {
  border: 1px solid red;
}

/* stylelint-disable-next-line no-descending-specificity */
.accordion details + details {
  margin-top: 16px;
}

.accordion details summary {
  position: relative;
  padding: 0 16px;
  padding-right: 48px;
  cursor: pointer;
  list-style: none;
  overflow: auto;
  transition: background-color 0.2s;
}

.accordion details[open] summary {
  background-color: white;
}

.accordion details summary:focus,
.accordion details summary:hover {
  background-color: black;
}

.accordion details summary::-webkit-details-marker {
  display: none;
}

.accordion details summary::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translateY(-50%) rotate(135deg);
  width: 9px;
  height: 9px;
  border: 2px solid;
  border-width: 2px 2px 0 0;
  transition: transform 0.2s;
}

.accordion details[open] summary::after {
  transform: translateY(-50%) rotate(-45deg);
}

.accordion details .accordion-item-body {
  padding: 0 16px;
}

.accordion details[open] .accordion-item-body {
  border-top: 1px solid black;
  background-color: white;
}
`,
        name: "accordion.css",
      },
    ],
    mdtable: `
  | accordion |         |
  | --------- | --------|
  | Label     |  Body  |
`,
    inputHtml: `
  <div class="accordion block" data-block-name="accordion" data-block-status="loaded">
          <div>
            <div>Label</div>
            <div>Body</div>
          </div>
    </div>
      `,
  },
};
