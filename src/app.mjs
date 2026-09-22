import { search } from './search.js';

const form = document.querySelector('#search-form');
const input = document.querySelector('#item-search');
const list = document.querySelector('#search-results');
const message = document.querySelector('#search-message');
let index = [];
let results = [];
let active = -1;

const stateText = {
  verified_item: '공식 자료 확인 완료',
  unverified_item: '현재 확인 중',
};

function closeList() {
  active = -1;
  list.hidden = true;
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
}

function activate(next) {
  if (!results.length) return;
  active = (next + results.length) % results.length;
  list.querySelectorAll('[role="option"]').forEach((node, index) => {
    const selected = index === active;
    node.setAttribute('aria-selected', String(selected));
    if (selected) input.setAttribute('aria-activedescendant', node.id);
  });
}

function showMessage(result) {
  closeList();
  message.replaceChildren();
  if (result.state === 'empty_or_invalid') {
    message.textContent = '품목 이름을 2글자 이상 입력해 주세요. 등록된 1글자 품목은 바로 검색할 수 있어요.';
  } else if (result.state === 'unverified_item') {
    const name = result.results[0].name;
    const strong = document.createElement('strong');
    strong.textContent = name;
    message.append(strong, document.createTextNode(' 배출방법은 현재 공식 자료를 확인 중이에요.'));
  } else if (result.state === 'missing') {
    const strong = document.createElement('strong');
    strong.textContent = '아직 등록되지 않은 품목이에요.';
    message.append(strong, document.createElement('br'), document.createTextNode('현재는 검색어를 전송하거나 저장하지 않습니다.'));
  }
}

function choose(item) {
  if (item.state === 'verified_item') window.location.assign(`/item/${encodeURIComponent(item.slug)}/`);
  else showMessage({ state: item.state, results: [item] });
}

function render(result) {
  results = result.results;
  active = -1;
  list.replaceChildren();
  message.replaceChildren();
  if (!results.length) return closeList();
  for (const [position, item] of results.entries()) {
    const option = document.createElement('li');
    option.id = `search-option-${position}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    option.tabIndex = -1;
    const button = document.createElement('button');
    button.type = 'button';
    const copy = document.createElement('span');
    const name = document.createElement('strong');
    const category = document.createElement('span');
    const badge = document.createElement('span');
    name.textContent = item.name;
    category.textContent = item.category;
    badge.className = `status ${item.state === 'verified_item' ? 'verified' : 'pending'}`;
    badge.textContent = stateText[item.state];
    copy.append(name, category);
    button.append(copy, badge);
    button.addEventListener('pointerdown', event => event.preventDefault());
    button.addEventListener('click', () => choose(item));
    option.append(button);
    list.append(option);
  }
  list.hidden = false;
  input.setAttribute('aria-expanded', 'true');
}

input.addEventListener('input', () => {
  const result = search(index, input.value);
  if (!input.value.trim()) {
    message.replaceChildren();
    return closeList();
  }
  if (result.state === 'empty_or_invalid') {
    results = [];
    return closeList();
  }
  render(result);
});

input.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') { event.preventDefault(); activate(active + 1); }
  if (event.key === 'ArrowUp') { event.preventDefault(); activate(active - 1); }
  if (event.key === 'Escape') closeList();
  if (event.key === 'Enter' && active >= 0) { event.preventDefault(); choose(results[active]); }
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const result = search(index, input.value);
  if (result.state === 'verified_item') choose(result.results[0]);
  else showMessage(result);
});

document.addEventListener('click', event => {
  if (!form.contains(event.target) && !list.contains(event.target)) closeList();
});

try {
  const response = await fetch('/assets/search-index.json');
  if (!response.ok) throw new Error('검색 자료를 불러올 수 없습니다.');
  index = await response.json();
} catch {
  input.disabled = true;
  message.textContent = '검색을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
