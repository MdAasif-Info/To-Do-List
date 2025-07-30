// Select elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');


// Update summary and progress bar
function updateSummary() {
    const allTasks = Array.from(todoList.children);
    const total = allTasks.length;
    const completed = allTasks.filter(li => li.querySelector('.todo-checkbox')?.checked).length;
    const remaining = total - completed;
    document.getElementById('total-count').textContent = total;
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('remaining-count').textContent = remaining;

    // Progress bar
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById('progress-bar-fill').style.width = percent + '%';
    document.getElementById('progress-label').textContent = percent + '% Completed';

    // Also re-apply filter after any change
    applyFilter();
}

// Filtering
let currentFilter = 'all';
function applyFilter() {
    const allTasks = Array.from(todoList.children);
    allTasks.forEach(li => {
        const checked = li.querySelector('.todo-checkbox')?.checked;
        if (currentFilter === 'all') {
            li.style.display = '';
        } else if (currentFilter === 'active') {
            li.style.display = checked ? 'none' : '';
        } else if (currentFilter === 'completed') {
            li.style.display = checked ? '' : 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            applyFilter();
        });
    });
});

// Add task
todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const task = todoInput.value.trim();
    if (task) {
        addTask(task);
        todoInput.value = '';
        updateSummary();
    }
});

// Add task to list
function addTask(taskText) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.draggable = true;

    // Drag and drop handlers
    li.addEventListener('dragstart', function(e) {
        li.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
        window._draggedItem = li;
    });
    li.addEventListener('dragend', function() {
        li.classList.remove('dragging');
        window._draggedItem = null;
    });

    li.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    li.addEventListener('dragenter', function(e) {
        e.preventDefault();
        if (li !== window._draggedItem) li.classList.add('drag-over');
    });
    li.addEventListener('dragleave', function() {
        li.classList.remove('drag-over');
    });
    li.addEventListener('drop', function(e) {
        e.preventDefault();
        li.classList.remove('drag-over');
        const dragged = window._draggedItem;
        if (dragged && dragged !== li) {
            todoList.insertBefore(dragged, li.nextSibling);
            updateSummary();
        }
    });

    // Checkbox for completion
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';

    const span = document.createElement('span');
    span.className = 'todo-text highlight';
    span.textContent = taskText;

    // Edit on click
    span.addEventListener('click', function handleEdit() {
        // Prevent editing if already editing
        if (li.querySelector('.edit-input')) return;
        const currentText = span.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        input.style.flex = '1';
        input.style.fontSize = '1.08rem';
        input.style.padding = '0.2rem 0.3rem';
        input.style.borderRadius = '4px';
        input.style.border = '1.5px solid #c7d2fe';
        input.style.background = '#fff';
        input.style.color = '#2d2d2d';
        input.style.fontWeight = '500';
        input.style.outline = 'none';
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
        input.addEventListener('blur', saveEdit);

        function saveEdit() {
            const newText = input.value.trim();
            if (newText) {
                span.textContent = newText;
            }
            span.style.display = '';
            input.remove();
        }
        function cancelEdit() {
            span.style.display = '';
            input.remove();
        }

        span.style.display = 'none';
        li.insertBefore(input, span);
        input.focus();
        input.select();
    });

    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            span.classList.add('completed');
            span.classList.remove('highlight');
        } else {
            span.classList.remove('completed');
            span.classList.add('highlight');
        }
        updateSummary();
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.title = 'Delete Task';
    delBtn.innerHTML = '&times;'; // Modern cross icon
    delBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this task?')) {
            todoList.removeChild(li);
            updateSummary();
        }
    });
// Bulk actions
document.getElementById('mark-all-complete').addEventListener('click', function() {
    const checkboxes = todoList.querySelectorAll('.todo-checkbox');
    checkboxes.forEach(cb => {
        if (!cb.checked) {
            cb.checked = true;
            cb.dispatchEvent(new Event('change'));
        }
    });
});

document.getElementById('delete-completed').addEventListener('click', function() {
    const completed = todoList.querySelectorAll('.todo-checkbox:checked');
    if (completed.length === 0) return;
    if (confirm('Delete all completed tasks?')) {
        completed.forEach(cb => {
            cb.closest('li').remove();
        });
        updateSummary();
    }
});

document.getElementById('clear-list').addEventListener('click', function() {
    if (todoList.children.length === 0) return;
    if (confirm('Clear all tasks?')) {
        todoList.innerHTML = '';
        updateSummary();
    }
});
    
    // Update summary after adding
    updateSummary();

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    todoList.appendChild(li);
    updateSummary();
    saveTasks();
    applyFilter();
}
