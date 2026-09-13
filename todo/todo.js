(() => {
  const STORAGE_KEY = 'todo-app-tasks';

  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const taskCount = document.getElementById('task-count');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed');

  let tasks = loadTasks();
  let currentFilter = 'all';

  // ---------- Persistence ----------
  function loadTasks() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Could not read saved tasks:', err);
      return [];
    }
  }

  function saveTasks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Could not save tasks:', err);
    }
  }

  // ---------- CRUD ----------
  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      text: trimmed,
      completed: false,
      createdAt: Date.now()
    });
    saveTasks();
    render();
  }

  function updateTaskText(id, newText) {
    const trimmed = newText.trim();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (trimmed) {
      task.text = trimmed;
    }
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
  }

  // ---------- Rendering ----------
  function getVisibleTasks() {
    if (currentFilter === 'active') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <button class="toggle" aria-label="Toggle complete" aria-pressed="${task.completed}"></button>
      <span class="task-text" tabindex="0">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button class="edit" aria-label="Edit task">Edit</button>
        <button class="delete" aria-label="Delete task">Delete</button>
      </div>
    `;
    return li;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    const visible = getVisibleTasks();

    list.innerHTML = '';
    const fragment = document.createDocumentFragment();
    visible.forEach(task => fragment.appendChild(createTaskElement(task)));
    list.appendChild(fragment);

    const emptyText = emptyState.querySelector('.empty-text');
    emptyState.hidden = tasks.length !== 0 && visible.length !== 0;
    if (tasks.length === 0) {
      emptyText.textContent = 'Nothing here yet. Add your first task above.';
    } else if (visible.length === 0) {
      emptyText.textContent = `No ${currentFilter} tasks.`;
    }

    const remaining = tasks.filter(t => !t.completed).length;
    taskCount.textContent = remaining;
  }

  // ---------- Event delegation ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(input.value);
    input.value = '';
    input.focus();
  });

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.classList.contains('toggle')) {
      toggleTask(id);
    } else if (e.target.classList.contains('delete')) {
      deleteTask(id);
    } else if (e.target.classList.contains('edit')) {
      const span = item.querySelector('.task-text');
      span.contentEditable = 'true';
      span.focus();
      placeCaretAtEnd(span);
    }
  });

  list.addEventListener(
    'blur',
    (e) => {
      if (!e.target.classList || !e.target.classList.contains('task-text')) return;
      if (e.target.isContentEditable) {
        e.target.contentEditable = 'false';
        const item = e.target.closest('.task-item');
        updateTaskText(item.dataset.id, e.target.textContent);
      }
    },
    true
  );

  list.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('task-text') && e.target.isContentEditable) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
      } else if (e.key === 'Escape') {
        e.target.blur();
        render();
      }
    }
  });

  function placeCaretAtEnd(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  // ---------- Init ----------
  render();
})();
