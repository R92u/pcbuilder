// Empty rows keep their measured height so the scrollbar covers the full catalog.
export function createCatalogWindow(grid) {
 const rows = new Map();
 let products = [], cardMarkup, observer, columns = 0;
 const visible = new Set(), mounted = new Set();
 function columnCount() {
  const tracks=getComputedStyle(grid).gridTemplateColumns;
  return Math.max(1,tracks.split(/\s+/).filter(track=>parseFloat(track)>0).length);
 }
 function mount(row) {
  if (mounted.has(row.index)) return;
  mounted.add(row.index);
  row.element.style.height = '';
  row.element.innerHTML = products.slice(row.start, row.start + columns).map(cardMarkup).join('');
 }
 function updateWindow() {
  const keep = new Set();
  for (const index of visible) for (let n = index - 1; n <= index + 1; n++) keep.add(n);
  for (const index of keep) if (rows.has(index)) mount(rows.get(index));
  for (const index of mounted) {
   const row=rows.get(index);
   if (!keep.has(index) && !row.element.contains(document.activeElement)) {
    row.element.style.height = row.element.getBoundingClientRect().height + 'px';
    row.element.replaceChildren();mounted.delete(index);
   }
  }
 }
 function clear() {
  observer?.disconnect();observer = null;
  rows.clear();visible.clear();mounted.clear();grid.replaceChildren();
  products = [];cardMarkup = null;columns = 0;
 }
 function draw(next, markup, empty) {
  const count = columnCount();
  if (products.length && count === columns && products.length === next.length && next.every((p,i) => products[i].id === p.id)) {
   cardMarkup = markup;
   for (const index of mounted) {
    const row=rows.get(index);
    row.element.innerHTML=next.slice(row.start,row.start+columns).map(markup).join('');
   }
   return;
  }
  clear();products = next;cardMarkup = markup;columns = count;
  if (!products.length) {grid.innerHTML = empty;return;}
  const fragment = document.createDocumentFragment();
  for (let start = 0; start < products.length; start += columns) {
   const index = start / columns, element = document.createElement('div');
   element.className = 'shop-window-row';element.dataset.row = index;
   element.style.height = '420px';
   const row = {index,start,element};rows.set(index,row);fragment.append(element);
   if (index < 2) mount(row);
  }
  grid.append(fragment);
  observer = new IntersectionObserver((entries, source) => {
   if (source !== observer) return;
   for (const entry of entries) {
    const index = Number(entry.target.dataset.row);
    if (entry.isIntersecting) visible.add(index);else visible.delete(index);
   }
   updateWindow();
  });
  for (const row of rows.values()) observer.observe(row.element);
 }
 let lastWidth = 0;
 new ResizeObserver(([entry]) => {
  const width = entry.contentRect.width;
  if (width && width !== lastWidth && products.length && columns !== columnCount()) draw(products,cardMarkup,'');
  lastWidth = width;
 }).observe(grid);
 grid.addEventListener('error',event=>{
  const image = event.target;
  if (image.tagName === 'IMG') {image.hidden=true;if(image.nextElementSibling) image.nextElementSibling.hidden=false;}
 },true);
 return {draw,clear};
}

