export const SYSTEM_MESSAGE = `
---
Your task is to generate JSON for a new AEM Edge Delivery Services block, including JavaScript and CSS files, a markdown table representation, and sample input HTML based on the provided requirements.
---
**Requirements:**
1. **Extract Block Name**: Extract the block name from the user's input.
2. **Generate Markdown Table**: Based on the block, create an appropriate markdown table representation.
   - The markdown table should reflect the structure of the block, with each row representing a component or element within the block.
   - The first row should list the block name only.
   - For example, if the block consists of tabs, the markdown table should list the tabs and their corresponding content.
3. **Create Input HTML Structure** from the markdown table:
   - Each row in the markdown table corresponds to a <div> element only in the input HTML.
   - Represent elements within each row (cells) as nested <div> only, reflecting the content and structure of the block.
   - Internal elements (div) must not have any classes, IDs, or other HTML attributes.
4. **Create Folder/File Structures**: 
   - Based on the extracted block name and the input HTML structure, generate block_name.js and block_name.css files only.
5. **Functionality of Edge Delivery Services Block**:
   - Ensure the generated block has full functionality as per the given input or based on the block name/type.
6. **CSS Styling**:
   - In the CSS content, add fixed height and width for the block to ensure proper display. Do not add any style in the JavaScript file; use the CSS file for styling.
7. **JavaScript Functionality**:
   - An Edge Delivery Services block JavaScript file must start with a function called 'decorate'. This function takes the block input, which is an HTML element, and decorates it. The block element contains the HTML structure of the block, which varies depending on the block type.
   - The decorate method decorates the input HTML with full-fledged functionality as per the block type.
**Output Format**:
- Strictly generate valid JSON only.
- Ensure the generated code snippet is complete and functional, not just a placeholder or instructions.
- If unable to generate the code, indicate "I can't help with that".
**Note**:
- Only divs should be used to represent the block structure. Strictly follow the input HTML structure.
- The internal \`<div>\` elements within the block should not have any classes, IDs, or other properties. Only the outermost block element will have the specific classes and attributes.
- Use the decorate method to add classes or IDs for styling or functionality.
- Generate the block with text only, no images or other media.
- Divs should not have any classes, IDs, or other properties.
- Only divs should be used to represent the block structure. Strictly follow the input HTML structure.
- Don't use /* add your styles here */ in the CSS file or in the JavaScript file. Generate the full code.
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

export const SAMPLE_USER_MESSAGE_3 = `a carousel block`;

export const SAMPLE_ASSISTANT_OUTPUT_3 = {
  tree: {
    name: "carousel",
    type: "directory",
    children: [
      {
        name: "carousel.js",
        type: "file",
      },
      {
        name: "carousel.css",
        type: "file",
      },
    ],
  },
  files: [
    {
      type: "javascript",
      path: "blocks/carousel/carousel.js",
      content: `
import { fetchPlaceholders } from '../../scripts/aem.js';

const updateActiveSlide = (slide) => {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      link.setAttribute('tabindex', idx !== slideIndex ? '-1' : '0');
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    indicator.querySelector('button').disabled = idx === slideIndex;
  });
};

const showSlide = (block, slideIndex = 0) => {
  const slides = block.querySelectorAll('.carousel-slide');
  const realSlideIndex = (slideIndex < 0) ? slides.length - 1 : (slideIndex >= slides.length) ? 0 : slideIndex;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
};

const bindEvents = (block) => {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
};

const createSlide = (row, slideIndex, carouselId) => {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = \`carousel-\${carouselId}-slide-\${slideIndex}\`;
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(\`carousel-slide-\${colIdx === 0 ? 'image' : 'content'}\`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.id);
  }

  return slide;
};

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.id = \`carousel-\${carouselId}\`;
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = \`
      <button type="button" class="slide-prev" aria-label="\${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="\${placeholders.nextSlide || 'Next Slide'}"></button>
    \`;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = \`<button type="button" aria-label="\${placeholders.showSlide || 'Show Slide'} \${idx + 1} \${placeholders.of || 'of'} \${rows.length}"></button>\`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
`,
      name: "carousel.js",
    },
    {
      type: "css",
      path: "blocks/carousel/carousel.css",
      content: `
.carousel .carousel-slides-container {
  position: relative;
}

.carousel .carousel-slides,
.carousel .carousel-slide-indicators {
  list-style: none;
  margin: 0;
  padding: 0;
}

.carousel .carousel-slides {
  display: flex;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  overflow: scroll clip;
}

.carousel .carousel-slides::-webkit-scrollbar {
  display: none;
}

.carousel .carousel-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  width: 100%;
  min-height: min(50vw, calc(100dvh - var(--header-height)));
}

.carousel .carousel-slide:has(.carousel-slide-content[data-align='center']) {
  align-items: center;
}

.carousel .carousel-slide:has(.carousel-slide-content[data-align='right']) {
  align-items: flex-end;
}

.carousel .carousel-slide.carousel-slide-image picture {
  position: absolute;
  inset: 0;
}

.carousel .carousel-slide.carousel-slide-image picture > img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.carousel .carousel-slide.carousel-slide-content {
  z-index: 1;
  margin: 68px;
  padding: 16px;
  color: white;
  background-color: rgba(19, 19, 19, 0.75);
  position: relative;
  width: var(--slide-content-width, auto);
}

.carousel .carousel-slide-indicators {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 12px;
  padding: 12px;
  background-color: var(--light-color);
  line-height: 0;
}

.carousel .carousel-slide-indicator button {
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border-radius: 50%;
  background-color: #dadada;
  transition: background-color 0.2s;
}

.carousel .carousel-slide-indicator button:disabled,
.carousel .carousel-slide-indicator button:hover,
.carousel .carousel-slide-indicator button:focus-visible {
  background-color: var(--text-color);
}

.carousel .carousel-navigation-buttons {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}

.carousel .carousel-navigation-buttons button {
  position: relative;
  width: 44px;
  height: 44px;
  margin: 0;
  border-radius: 50%;
  padding: 0;
  background-color: rgba(19, 19, 19, 0.25);
  transition: background-color 0.2s;
}

.carousel .carousel-navigation-buttons button:hover,
.carousel .carousel-navigation-buttons button:focus-visible {
  background-color: rgba(19, 19, 19, 0.75);
}

.carousel .carousel-navigation-buttons button::after {
  display: block;
  content: '';
  border: 2px solid;
  border-bottom: 0;
  border-left: 0;
  height: 12px;
  width: 12px;
  position: absolute;
  top: 50%;
  left: calc(50% + 2px);
  transform: translate(-50%, -50%) rotate(-135deg);
}

.carousel .carousel-navigation-buttons button.slide-next::after {
  transform: translate(-50%, -50%) rotate(45deg);
  left: calc(50% - 2px);
}

@media (min-width: 600px) {
  .carousel .carousel-navigation-buttons {
    left: 24px;
    right: 24px;
  }

  .carousel .carousel-slide.carousel-slide-content {
    --slide-content-width: calc((100% - 184px) / 2);
    margin: 92px;
  }

  .carousel .carousel-slide.carousel-slide-content[data-align='justify'] {
    --slide-content-width: auto;
  }
}
`,
    },
  ],
};