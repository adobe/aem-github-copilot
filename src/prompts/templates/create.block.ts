export const SYSTEM_MESSAGE = `
---
Your task is to generate JSON for a new AEM Edge Delivery Services block, including JavaScript and CSS files, a markdown table representation, and sample input HTML based on the provided requirements.
---
**Requirements:**
1. **Extract Block Name**: Extract the block name from the user's input.
2. **Generate Markdown Table**: Based on the block, create an appropriate markdown table representation.
   - The markdown table should reflect the structure of the block, with each row representing a component or element within the block.
   - First row should list the block name only
   - For example, if the block consists of tabs, the markdown table should list the tabs and their corresponding content.
3. **Create Input HTML Structure** from markdown table:
   - Each row in the markdown table corresponds to a <div> element only in the input HTML.
   - Represent elements within each row (cells) as nested <div> only, reflecting the content and structure of the block.
   - Internal elements(div) must not have any classes, IDs, or other html attributes.
4. **Create Folder/File Structures**: 
   - Based on the extracted block name and the input HTML structure, generate block_name.js and block_name.css files only
5. **Functionality of Edge Delivery Services Block**:
   - Ensure the generated block has full functionality as per the given input or based on the block name/type.
6. **CSS Styling**:
   - In the CSS content, add fixed height and width for the block to ensure proper display. Do not add any style in the JavaScript file; use the CSS file for styling.
7. **JavaScript Functionality**:
   - An Edge Delivery Services block JavaScript file must start with a function called 'decorate'. This function takes the block input, which is an HTML element, and decorates it. The block element contains the HTML structure of the block, which varies depending on the block type.
   - Decorate method decorates the input html with full fledged functionality as per the block type.
**Output Format**:
- Strictly Generate valid JSON only.
- Ensure the generated code snippet is complete and functional, not just a placeholder or instructions.
- If unable to generate the code, indicate "I can't help with that".
**Note**:
- Only divs should be used to represent the block structure. Strictly follow the input HTML structure.
- The internal \`<div>\` elements within the block should not have any classes, IDs, or other properties. Only the outermost block element will have the specific classes and attributes.
- Use decorate method to add classes or id for styling or functionality.
- Generate block with text only, no images or other media.
- Divs should not have any classes, IDs, or other properties.
- Only divs should be used to represent the block structure. Strictly follow the input HTML structure.
- Don't use /* add your styles here */ in the css file or in javscript file. Generate the full code.
---
`;

export const SAMPLE_USER_MESSAGE = `a tabs block that show a list of tabs and their content`;

export const SAMPLE_ASSISTANT_OUTPUT = {
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
      function hasWrapper(el) {
        return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
      }
      export default async function decorate(block) {
        const tablist = document.createElement('div');
        tablist.className = 'tabs-list';
        const tabs = [...block.children].map((child) => child.firstElementChild);
        tabs.forEach((tab, i) => {
          const id = "tab-" + i;
          const tabpanel = block.children[i];
          tabpanel.className = 'tabs-panel';
          tabpanel.id = \`tabpanel-\${id}\`;
          const button = document.createElement('button');
          button.className = 'tabs-tab';
          button.innerHTML = tab.innerHTML;
          button.setAttribute('type', 'button');
          button.addEventListener('click', () => {
            block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
              panel.setAttribute('aria-hidden', true);
            });
            tablist.querySelectorAll('button').forEach((btn) => {
              btn.setAttribute('aria-selected', false);
            });
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
      }
      .tabs .tabs-list button {
        flex: 0 0 max-content;
        padding: 8px 16px;
        overflow: unset;
      }
      .tabs .tabs-list button[aria-selected="true"] {
        background-color: white;
      }
      .tabs .tabs-panel[aria-hidden="true"] {
        display: none;
      }
    `,
      name: "tabs.css",
    },
  ],
  mdtable: `
  | Tabs    |              |
  |---------|--------------|
  | Tab1    | tab one text | 
  | Tab Two | tab two text |
`,
  inputHtml: `
<div>
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
};

export const SAMPLE_USER_MESSAGE_2 = `a table block`;

export const SAMPLE_ASSISTANT_OUTPUT_2 = {
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
      path: "blocks/table/tabs.css",
      content: `
.table {
  width: 100%;
  overflow-x: auto;
}
.table table {
  width: 100%;
  max-width: 100%;
}
.table table tbody tr {
  border-bottom: 1px solid;
}
.table table th,
.table table td {
  padding: 8px 16px;
}
.table.no-header table tbody tr {
  border-top: 1px solid;
}
    `,
      name: "table.css",
    },
  ],
  mdtable: `
  | table    |
  |----------|
  | Name     |
  | John     |
`,
  inputHtml: `
    <div>
          <div>
            <div>Name</div>
            <div>Age</div>
          </div>
          <div>
            <div>John</div>
            <div>25</div>
          </div>
    </div>
      `,
};